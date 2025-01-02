<?php declare(strict_types=1);

namespace SitePlugins\JetStaticExp;

use Pike\{AppConfig, Db, FileSystem, Request, Response, Validation};
use Pike\Auth\Crypto;
use Sivujetti\{AppEnv, ValidationUtils};
use Sivujetti\Cli\PageRenderer;
use Sivujetti\Update\{Updater, ZipPackageStream};

/**
 * Contains handlers for "/plugins/jet-static-exp/exports[/<any>]".
 */
final class ExportsController {
    /**
     * POST /plugins/jet-static-exp/exports/export: Writes a zip file to
     * `${SIVUJETTI_INDEX_PATH}${$randomString32Chars}zip` that contains rendered
     * $req->body->pages (page1/index.html, page2/index.html ...) and public assets
     * (public/uploads/*.ext, public/relevant-file.ext).
     *
     * @param \Pike\Request $req
     * @param \Pike\Response $res
     * @param \Pike\AppConfig $appConfig 
     * @param \Sivujetti\AppEnv $appEnv
     * @param \Sivujetti\Update\ZipPackageStream $zip
     * @param \Pike\Auth\Crypto $crypto
     * @param \Pike\FileSystem $fs
     */
    public function exportSite(Request $req,
                               Response $res,
                               AppConfig $appConfig,
                               AppEnv $appEnv,
                               ZipPackageStream $zip,
                               Crypto $crypto,
                               FileSystem $fs): void {
        if (($errors = self::validateExportSiteInput($req->body))) {
            $res->status(400)->json($errors);
            return;
        }
        // 1. Create zip
        $randToken = $crypto->genRandomToken(16);
        $fileUrl = "public/{$randToken}.zip";
        $filePath = SIVUJETTI_INDEX_PATH . $fileUrl;
        $zip->open($filePath, create: true);

        // 2. Render and add all pages
        $rendered = self::renderPages($req, $appConfig, $appEnv);
        foreach ($rendered as $item)
            $zip->addFromString($item["relFilePath"], $item["html"]);

        // 2. Add public/<relevantFiles> and public/uploads/*
        if (($req->body->files[0] ?? "") === "all") {
            $publicDirPath = SIVUJETTI_INDEX_PATH . "public/";
            $allExceptThese = '/^(?:(?!\/public\/sivujetti\/|\/public\/tests\/).)*$/';
            $publicAll = $fs->readDirRecursive($publicDirPath, $allExceptThese);
            $relevant = self::filterOnlyRelevant($publicAll);
            $relatifyPath = Updater::makeRelatifier($publicDirPath);
            foreach ($relevant as $absFilePath)
                $zip->addFile($absFilePath, $relatifyPath($absFilePath));
        }

        // 3. Write to disk and return
        $zip->getResult(); // @allow \Pike\PikeException
        $res->json(["ok" => "ok", "resultFileUrl" => "/{$fileUrl}"]);
    }
    /**
     * @param \Pike\Request $req
     * @param \Pike\AppConfig $appConfig
     * @param \Sivujetti\AppEnv $appEnv
     * @psalm-return array<int, array{relFilePath: string, html: string}>
     */
    private static function renderPages(Request $req,
                                        AppConfig $appConfig,
                                        AppEnv $appEnv): array {
        require_once SIVUJETTI_BACKEND_PATH . "cli/src/PageRenderer.php";
        $pageRenderer = (new PageRenderer())->create(
            $appEnv->di->make(Db::class),
            [
                "app" => (array) $appConfig->getVals(),
                "env" => [
                    ...$appEnv->constants,
                    "BASE_URL" => $req->body->targetBaseUrl,
                    "QUERY_VAR" => $req->body->targetQueryVar,
                ]
            ]
        );
        $createRenderPageRequest = fn(string $slug) => new Request($slug, serverVars: [
            // for PagesController:getServerHost()
            "HTTPS" => str_starts_with($req->body->targetHost, "https:") ? "on" : "off",
            "HTTP_HOST" => explode("://", $req->body->targetHost)[1],
        ]);
        //
        $rendered = [];
        foreach ($req->body->pages as $slug) {
            $html = $pageRenderer->renderToString($createRenderPageRequest($slug));
            $pref = $slug !== "/" ? ltrim("{$slug}/", "/") : "";
            $rendered[] = [
                "relFilePath" => "{$pref}index.html",
                "html" => $html
            ];
        }
        //
        return $rendered;
    }
    /**
     * @param string[] $publicDirFiles
     * @return string[]
     */
    private static function filterOnlyRelevant(array $publicDirFiles): array {
        $out = [];
        $prefix = SIVUJETTI_INDEX_PATH . "public/";
        foreach ($publicDirFiles as $absFilePath) {
            if (!(
                // Applications/MAMP/htdocs/sivujetti/public/.DS_Store or
                // Applications/MAMP/htdocs/sivujetti/public/subdir/.DS_Store -> omit
                str_contains($absFilePath, "/.") ||
                // Applications/MAMP/htdocs/sivujetti/public/plugin-*.js -> omit
                str_starts_with($absFilePath, "{$prefix}plugin-") ||
                // /Applications/MAMP/htdocs/sivujetti/public/plugin-*-edit-app-bundle.js or
                // /Applications/MAMP/htdocs/sivujetti/public/sitename-edit-app-extensions-bundle.js -> omit
                str_contains($absFilePath, "-edit-app-")
            )) $out[] = $absFilePath;
        }
        return $out;
    }
    /**
     * @param object $input
     * @return string[] Error messages or []
     */
    private static function validateExportSiteInput(object $input): array {
        return Validation::makeObjectValidator()
            ->rule("pages", "minLength", 1, "array")
            ->rule("pages.*", "type", "string") // todo
            ->rule("files?.*", "in", ["all"])
            ->rule("targetHost", "type", "string")
            ->rule("targetHost", "maxLength", ValidationUtils::HARD_SHORT_TEXT_MAX_LEN)
            ->rule("targetBaseUrl", "in", ["/"]) // todo
            ->rule("targetQueryVar", "in", [""]) // todo
            ->validate($input);
    }
}
