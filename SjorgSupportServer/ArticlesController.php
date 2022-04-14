<?php declare(strict_types=1);

namespace SitePlugins\SjorgSupportServer;

use Pike\{Response};
use Sivujetti\{PagesRepositoryTemp};
use Sivujetti\Page\Entities\Page;

/**
 * Contains handlers for "/plugins/sjorg-support-server/articles/*".
 */
final class ArticlesController {
    /**
     * GET /plugins/sjorg-support-server/articles/featured: Returns a list of
     * featured articles.
     *
     * @param \Pike\Request $req
     * @param \Sivujetti\PagesRepositoryTemp $pagesRepo
     */
    public function listFeaturedArticles(Response $res,
                                         PagesRepositoryTemp $pagesRepo): void {
        $pages = $pagesRepo->fetch()
            ->where("slug LIKE ? AND status = ?", ["/tuki-%", Page::STATUS_PUBLISHED])
            ->fetchAll();
        $halfYearSecs = (int)(60 * 60 * 24 * (365 / 2));
        $res
            ->header('Expires', gmdate('D, d M Y H:i:s \G\M\T', time() + $halfYearSecs))
            ->header("Access-Control-Allow-Origin", "*")
            ->json($pages);
    }
}
