<?php declare(strict_types=1);

namespace SitePlugins\JetStaticExp;

use Pike\{AppConfig, FileSystem, Request, Response, Validation};
use Sivujetti\{AppEnv, PageRenderer, SharedAPIContext, ShortIdGenerator, ValidationUtils};
use Sivujetti\Update\{Updater, ZipPackageStream};

/**
 * Contains handlers for "/plugins/jet-static-exp/exports[/<any>]".
 *
 * @phpstan-import-type ExportedItem from \SitePlugins\JetStaticExp\JetStaticExp
 */
final class ExportsController {
    /**
     * POST /plugins/jet-static-exp/exports/exportable-public-files: Returns a
     * list of urls that the user can select for export.
     *
     * @param \Pike\Response $res
     * @param \Pike\FileSystem $fs
     */
    public function listExportablePublicFiles(Response $res, FileSystem $fs): void {
        $files = self::getExportablePublicFiles($fs);
        $res->json($files);
    }
    /**
     * POST /plugins/jet-static-exp/exports/export: Writes a zip file to
     * `${SIVUJETTI_INDEX_PATH}${$randomString32Chars}zip` that contains rendered
     * $req->body->pages (page1/index.html, page2/index.html ...) and selected
     * public assets $req->body->files.
     *
     * @param \Pike\Request $req
     * @param \Pike\Response $res
     * @param \Sivujetti\PageRenderer $pageRenderer
     * @param \Pike\AppConfig $appConfig 
     * @param \Sivujetti\AppEnv $appEnv
     * @param \Sivujetti\SharedAPIContext $apiCtx
     * @param \Sivujetti\Update\ZipPackageStream $zip
     * @param \Pike\FileSystem $fs
     */
    public function exportSite(Request $req,
                               Response $res,
                               PageRenderer $pageRenderer,
                               AppConfig $appConfig,
                               AppEnv $appEnv,
                               SharedAPIContext $apiCtx,
                               ZipPackageStream $zip,
                               FileSystem $fs): void {
        if (($errors = self::validateExportSiteInput(
            $req->body,
            self::getExportablePublicFiles($fs)
        ))) {
            $res->status(400)->json($errors);
            return;
        }

        // 1. Create zip
        $randToken = (new \DateTime())->format("Y-m-d") . "_" . (ShortIdGenerator::generate());
        $fileUrl = "public/{$randToken}.zip";
        $filePath = SIVUJETTI_INDEX_PATH . $fileUrl;
        $zip->open($filePath, create: true);

        // 2. Render and add selected pages
        $rendered = self::renderPages($pageRenderer, $req, $appConfig, $appEnv, $apiCtx);
        foreach ($rendered as $item) {
            $zip->addFromString($item["relFilePath"], $item["html"]);
        }

        // 3. Add public/<relevantFiles> and public/uploads/*
        $urls = self::createPublicFilesList($req->body->files, $rendered, $fs);
        $relative = ltrim($req->body->targetBaseUrl, "/");
        foreach ($urls as $url) {
            $zip->addFile(SIVUJETTI_INDEX_PATH . "public/{$url}", "{$relative}public/{$url}");
        }

        // 4. Write to disk and return
        $zip->getResult(); // @allow \Pike\PikeException
        $res->json(["ok" => "ok", "resultFileUrl" => "/{$fileUrl}"]);
    }
    /**
     * @param list<string> $selectedFiles
     * @param list<ExportedItem> $renderedPages
     * @param \Pike\FileSystem $fs
     * @return list<string> Example: ["uploads/file.jpg", "file.css"]
     */
    private static function createPublicFilesList(array $selectedFiles, array $renderedPages, FileSystem $fs): array {
        $out = [];
        // 1. Add from the filesystem first
        foreach ($selectedFiles as $url) {
            if ($url !== "uploads/*")
                $out[] = $url;
            else
                $out = [...$out, ...array_map(
                    // "/path/to/public/uploads/*.*" -> "uploads/*.*"
                    Updater::makeRelatifier(SIVUJETTI_INDEX_PATH . "public/"),
                    $fs->readDir(SIVUJETTI_INDEX_PATH . "public/uploads")
                )];
        }

        // 2. Then add the files that were enqueued during execution
        $addDiscovered = function (array $filesAddedAtRuntime) use (&$out) {
            foreach ($filesAddedAtRuntime as $file) {
                if (!in_array($file->url, $out, true))
                   $out[] = $file->url;
            }
        };
        foreach ($renderedPages as $item) {
            $addDiscovered($item["enqueuedFiles"]?->css ?? []);
            $addDiscovered($item["enqueuedFiles"]?->js ?? []);
        }

        return $out;
    }
    /**
     * @param \Pike\FileSystem $fs
     * @return list<string> Example: ["uploads/*", "file.css"]
     */
    private static function getExportablePublicFiles(FileSystem $fs): array {
        $all = $fs->readDir(SIVUJETTI_INDEX_PATH . "public");
        $exportable = [];
        $pubPath = SIVUJETTI_INDEX_PATH . "public/";
        $convertToUrl = Updater::makeRelatifier($pubPath); // "/path/to/public/*.*" -> "*.*"
        foreach ($all as $absFilePath) {
            if (!(
                // /path/to/public/plugin-*.js -> omit
                str_starts_with($absFilePath, "{$pubPath}plugin-") ||
                // /path/to/public/plugin-*-edit-app-bundle.js or
                // /path/to/public/sitename-edit-app-extensions-bundle.js -> omit
                str_contains($absFilePath, "-edit-app-") ||
                // /path/to/public/*.zip -> omit
                str_ends_with($absFilePath, ".zip") |
                // /path/to/public/sivujetti (a directory) -> omit
                $absFilePath === "{$pubPath}sivujetti"
            )) $exportable[] = $convertToUrl($absFilePath) . (str_contains($absFilePath, ".") ? "" : "/*");
        }
        return $exportable;
    }
    /**
     * @param \Sivujetti\PageRenderer $pageRenderer
     * @param \Pike\Request $req
     * @param \Pike\AppConfig $appConfig
     * @param \Sivujetti\AppEnv $appEnv
     * @param \Sivujetti\SharedAPIContext $apiCtx
     * @return list<ExportedItem>
     */
    private static function renderPages(PageRenderer $pageRenderer,
                                        Request $req,
                                        AppConfig $appConfig,
                                        AppEnv $appEnv,
                                        SharedAPIContext $apiCtx): array {
        $selectedPages = $req->body->pages;
        if (!$selectedPages) return [];

        $pageRenderer->setParentAppEnv($appEnv);
        $pageRenderer->setConfig([
            "env" => [
                ...$appEnv->constants,
                "BASE_URL" => $req->body->targetBaseUrl,
                "QUERY_VAR" => "",
            ],
            "app" => (array) $appConfig->getVals(),
        ]);
        $createRenderPageRequest = fn(string $slug) => new Request($slug, serverVars: [
            // for PagesController:getServerHost()
            "HTTPS" => str_starts_with($req->body->targetHost, "https:") ? "on" : "off",
            "HTTP_HOST" => explode("://", $req->body->targetHost)[1],
        ]);
        //
        $rendered = [];
        $addDiscovered = $req->body->addDicoveredPublicAssets ?? true;
        foreach ($selectedPages as $slug) {
            $enqueuedFiles = new \stdClass;
            $html = $pageRenderer->renderToString(
                $createRenderPageRequest($slug),
                $addDiscovered ? function (object $userDefinedAssets) use (&$enqueuedFiles) {
                    $enqueuedFiles = $userDefinedAssets;
                } : null
            );
            $pref = $slug !== "/" ? ltrim("{$slug}/", "/") : "";
            $rendered[] = $apiCtx->applyFilters("JetStaticExp:renderedPage", [
                "html" => $html,
                "relFilePath" => "{$pref}index.html",
                "enqueuedFiles" => $enqueuedFiles,
            ]);
        }
        //
        return $rendered;
    }
    /**
     * @param object $input
     * @param object $topLevelPublicFilesAll
     * @return list<string> Error messages or []
     */
    private static function validateExportSiteInput(object $input, array $topLevelPublicFilesAll): array {
        return Validation::makeObjectValidator()
            ->rule("pages", "type", "array")
            ->rule("pages.*", "type", "string") // todo
            ->rule("files?.*", "in", $topLevelPublicFilesAll)
            ->rule("targetHost", "type", "string")
            ->rule("targetHost", "maxLength", ValidationUtils::HARD_SHORT_TEXT_MAX_LEN)
            ->rule("targetBaseUrl", "in", ["/"]) // todo
            ->validate($input);
    }
}
