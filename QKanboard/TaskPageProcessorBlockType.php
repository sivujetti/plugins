<?php declare(strict_types=1);

namespace SitePlugins\QKanboard;

use Pike\{Injector, PikeException, Request};
use Sivujetti\Block\BlockTree;
use Sivujetti\Block\Entities\Block;
use Sivujetti\BlockType\{BlockTypeInterface, JsxLikeRenderingBlockTypeInterface,
                         PropertiesBuilder, RenderAwareBlockTypeInterface};
use Sivujetti\Page\Entities\Page;
use Sivujetti\Page\WebPageAwareTemplate;

use function Sivujetti\createElement as el;
use function Sivujetti\renderVNodes;

/**
 */
final class TaskPageProcessorBlockType implements BlockTypeInterface,
                                                  JsxLikeRenderingBlockTypeInterface,
                                                  RenderAwareBlockTypeInterface {
    public const NAME = "QKanboardTaskPageProcessor";
    /**
     * @inheritdoc
     */
    public function defineProperties(PropertiesBuilder $builder): \ArrayObject {
        return $builder->newProperty("dummy", $builder::DATA_TYPE_UINT)->getResult();
    }
    /**
     * @inheritdoc
     */
    public function onBeforeRender(Block $block,
                                   BlockTypeInterface $blockType,
                                   Injector $di): void {
        $di->execute($this->doBeforeRender(...), [":block" => $block]);
    }
    /**
     * @inheritdoc
     */
    public function render(object $block,
                           \Closure $createDefaultProps,
                           \Closure $renderChildren,
                           WebPageAwareTemplate $tmpl): array {
        return el("div", $createDefaultProps(), "");
    }
    /**
     * @param \Sivujetti\Block\Entities\Block $taskMetaBlock
     * @param \Sivujetti\Page\Entities\Page $page
     */
    public static function patchTaskPage(Block $taskMetaBlock, Page $page): void {
        $doRepNoEsc = fn($var, $val, $str) => str_replace("val:{$var}", $val, $str);
        $doRep = fn($var, $val, $str) => $doRepNoEsc($var, WebPageAwareTemplate::e($val), $str);
        $task = $taskMetaBlock->__task;
        $textBlocks = BlockTree::filterBlocks($page->blocks, fn($b) => $b->type === "Text");

        // Header > Breadcrumbs
        $breadCrumbsTextBlock = $textBlocks[0];
        $str = $breadCrumbsTextBlock->html;
        $str = $doRep("id", strval($task->id), $str);
        $breadCrumbsTextBlock->html = $str;

        // Header > Main text
        $headerTextBlock = $textBlocks[1];
        $str = $headerTextBlock->html;
        $str = $doRep("id", strval($task->id), $str);
        $str = $doRep("title", $task->title, $str);
        $headerTextBlock->html = $str;

        // Description
        $bodyTextBlock = $textBlocks[2];
        $str = $bodyTextBlock->html;
        $str = nl2br($doRep("description", $task->description, $str));
        $bodyTextBlock->html = $str;

        // Status
        $statusTextBlock = $textBlocks[4];
        $str = $statusTextBlock->html;
        $str = nl2br($doRep("status", $task->status === 0 ? "Suljettu" : match ($task->columnId) {
            QKanboard::TASK_COLUMN_BACKLOG => "Avoin",
            QKanboard::TASK_COLUMN_IN_PROGRESS => "Työn alla",
            QKanboard::TASK_COLUMN_DONE => "Valmis",
            default => "-",
        }, $str));
        $statusTextBlock->html = $str;

        // Created at
        $createAtTextBlock = $textBlocks[6];
        $str = $createAtTextBlock->html;
        $str = nl2br($doRep("createdAt", TasksListingBlockType::secondsToRelative($task->createdAt, lang: "fi"), $str));
        $createAtTextBlock->html = $str;

        // Tags
        $tagsTextBlock = $textBlocks[8];
        $str = $tagsTextBlock->html;
        $str = $doRepNoEsc("tags",
            renderVNodes([TasksListingBlockType::createTagVNodes($task->tags)])
        , $str);
        $tagsTextBlock->html = $str;
    }
    /**
     * @param 
     * @param 
     * @param 
     */
    private function doBeforeRender(KanboardDataFetcher $dataFetcher, Request $req, Block $block): void {
        if (!$req->queryVar("taskId"))
            return;
        $data = $dataFetcher->callApi("getTask", (object) [
            "task_id" => (int) $req->queryVar("taskId"),
        ]);
        $item = $data->result;
        $item->tags = $dataFetcher->fetchAndCreateTags($item->id);
        $block->__task = $dataFetcher->createTaskFrom($item);
    }
}
