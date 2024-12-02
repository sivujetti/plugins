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
     * GET /plugins/sjorg-support-server/articles/featured[?sivujetti-version=:version]: Returns
     * a list of featured articles.
     *
     * @param \Pike\Request $req
     * @param \Pike\Response $res
     * @param \Sivujetti\Page\PagesRepository2 $pagesRepo
     */
    public function listFeaturedArticles(Request $req,
                                         Response $res,
                                         PagesRepository2 $pagesRepo): void {
        if (!$req->queryVar("sivujetti-version")) {
            $this->listArtsV1($req, $res, $pagesRepo);
            return;
        }

        $catId = $pagesRepo->select("PagesCategories", ["@simple"])
            ->where("slug = ?", ["/tukiartikkelit"])
            ->fetch()?->id ?? "not-found";
        $pages = $pagesRepo->select("Pages", ["@blocks"])
            ->where("categories LIKE ? AND status = ?", ["%{$catId}%", Page::STATUS_PUBLISHED])
            ->fetchAll();
        $lastMod = 1732871378;// \max(\array_map(fn($page) => $page->lastUpdatedAt, $pages));

        // Credits https://rednafi.com/misc/etag_and_http_caching/
        $lastModFromReqETag = \substr($req->header("If-None-Match", ""), \strlen("W/"));
        // Check if the ETag matches; if so, return 304 Not Modified
        if ($lastModFromReqETag === strval($lastMod)) {
            $res->status(304)->header("Access-Control-Allow-Origin", "*")->end();
            return;
        }

        // If ETag does not match, return the content and the ETag

        for ($i = 0; $i < count($pages); ++$i) // Filter out non-relevant blocks
            $pages[$i]->blocks = BlockTree::filterBlocks($pages[$i]->blocks, fn($b) =>
                ($b->type === Block::TYPE_PAGE_INFO ||
                $b->type === Block::TYPE_GLOBAL_BLOCK_REF) ? false : true
            , recursive: false);

        $res
            ->header("ETag", "W/{$lastMod}")
            ->header("Access-Control-Allow-Origin", "*")
            ->json($pages);
        return;
    }
    private function listArtsV1(Request $req,
                                Response $res,
                                PagesRepository2 $pagesRepo): void {
        $pages = $pagesRepo->select("Pages", ["@blocks"])
            ->where("slug LIKE ? AND status = ?", ["/tuki-kuinka%", Page::STATUS_PUBLISHED])
            ->fetchAll();

        // @todo remove this when pages have updatedAt
        $latestMod = 1678452042;

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
