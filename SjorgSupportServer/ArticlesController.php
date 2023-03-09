<?php declare(strict_types=1);

namespace SitePlugins\SjorgSupportServer;

use Pike\{Request, Response};
use Sivujetti\Block\BlockTree;
use Sivujetti\Block\Entities\Block;
use Sivujetti\Page\Entities\Page;
use Sivujetti\Page\PagesRepository2;

/**
 * Contains handlers for "/plugins/sjorg-support-server/articles/*".
 */
final class ArticlesController {
    /**
     * GET /plugins/sjorg-support-server/articles/featured: Returns a list of
     * featured articles.
     *
     * @param \Pike\Request $req
     * @param \Pike\Respose $res
     * @param \Sivujetti\Page\PagesRepository2 $pagesRepo
     */
    public function listFeaturedArticles(Request $req,
                                         Response $res,
                                         PagesRepository2 $pagesRepo): void {
        $pages = $pagesRepo->select("Pages", ["@blocks"])
            ->where("slug LIKE ? AND status = ?", ["/tuki-%", Page::STATUS_PUBLISHED])
            ->fetchAll();

        // @todo remove this when pages have updatedAt
        $temp = true;
        $latestMod = $temp ? 1678452042 : max(array_map(fn($page) => $page->lastUpdatedAt, $pages));

        // https://github.com/php/web-php/blob/57dd39fcb2c4206acd64ccfd2dfa45ef93a01c9b/index.php#L34
        $tsstring = gmdate("D, d M Y H:i:s ", $latestMod) . "GMT";
        // Check if the client has the same page cached
        if ($req->header("if-modified-since") === $tsstring) {
            $res->status(304)->header("Access-Control-Allow-Origin", "*")->end();
            return;
        }
        // Inform the user agent what is our last modification date
        $res->header("Last-Modified", $tsstring);

        // Filter out non-relevant blocks
        foreach ($pages as $i => $page)
            $pages[$i]->blocks = BlockTree::filterBlocks($pages[$i]->blocks, fn($b) =>
                ($b->type === Block::TYPE_PAGE_INFO ||
                $b->type === Block::TYPE_GLOBAL_BLOCK_REF) ? false : true
            , recursive: false);

        $res
            ->header("Access-Control-Allow-Origin", "*")
            ->json($pages);
        return;
    }
}
