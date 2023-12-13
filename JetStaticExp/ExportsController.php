<?php declare(strict_types=1);

namespace SitePlugins\JetStaticExp;

use Pike\{AppConfig, Request, Response, Validation};
use Sivujetti\AppEnv;
use Sivujetti\Cli\PageRenderer;

/**
 * Contains handlers for "/plugins/jet-static-exp/exports[/<any>]".
 */
final class ExportsController {
    /**
     * POST /plugins/jet-static-exp/exports/export: ....
     *
     * @param \Pike\Request $req
     * @param \Pike\Response $res
     * @param \Pike\AppConfig $appConfig 
     * @param \Sivujetti\AppEnv $appEnv
     * @param \Sivujetti\Cli\PageRenderer $pageRenderer = null For tests
     */
    public function exportSite(Request $req,
                               Response $res,
                               AppConfig $appConfig,
                               AppEnv $appEnv,
                               PageRenderer $pageRenderer = null): void {
        if (($errors = self::validateExportSiteInput($req->body))) {
            $res->status(400)->json($errors);
            return;
        }
        //
        require SIVUJETTI_BACKEND_PATH . "cli/src/PageRenderer.php";
        if (!$pageRenderer)
            $pageRenderer = (new PageRenderer())->create([
                "app" => (array) $appConfig->getVals(),
                "env" => array_merge(
                    $appEnv->constants,
                    [
                        "SIVUJETTI_BASE_URL" => $req->body->targetBaseUrl,
                        "SIVUJETTI_QUERY_VAR" => $req->body->targetQueryVar,
                    ]
                )
            ]); 
        $createRenderPageRequest = fn(string $slug) => new Request($slug, serverVars: [
            // for PagesController:getServerHost()
            "HTTPS" => str_starts_with($req->body->targetHost, "https:") ? "on" : "off",
            "HTTP_HOST" => explode("://", $req->body->targetHost)[1],
        ]);
        //
        $rendered = [];
        foreach ($req->body->pages as $slug) {
            $html = $renderer->renderToString($createRenderPageRequest($slug));
            file_put_contents(__DIR__."/{$slug}.html", $html);
            $rendered[] = $html;
        }
        //
        $res->json((object) $rendered);
    }
    /**
     * Todo
     * @param object $input
     * @return string[] Error messages or []
     */
    private static function validateExportSiteInput(object $input): array {
        return Validation::makeObjectValidator()
            ->rule("pages.*", "type", "string") // todo
            ->rule("targetHost", "type", "string") // todo
            ->rule("targetBaseUrl", "type", "string") // todo
            ->rule("targetQueryVar", "type", "string") // todo
            ->validate($input);
    }
}
