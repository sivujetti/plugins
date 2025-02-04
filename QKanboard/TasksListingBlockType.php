<?php declare(strict_types=1);

namespace SitePlugins\QKanboard;

use Pike\{Injector, Request};
use Sivujetti\Block\Entities\Block;
use Sivujetti\BlockType\{BlockTypeInterface, JsxLikeRenderingBlockTypeInterface,
                         PropertiesBuilder, RenderAwareBlockTypeInterface};
use Sivujetti\Page\WebPageAwareTemplate;

use function Sivujetti\createElement as el;

/**
 * @phpstan-import-type VNode from \Sivujetti\BlockType\JsxLikeRenderingBlockTypeInterface
 * @phpstan-import-type Task from \SitePlugins\QKanboard\KanboardDataFetcher
 * @phpstan-import-type Tag from \SitePlugins\QKanboard\KanboardDataFetcher
 * @phpstan-import-type KanboardAPITask from \SitePlugins\QKanboard\KanboardDataFetcher
 */
final class TasksListingBlockType implements BlockTypeInterface,
                                             JsxLikeRenderingBlockTypeInterface,
                                             RenderAwareBlockTypeInterface {
    public const NAME = "QKanboardTasksListing";
    private array $tasks = [];
    /**
     * @inheritdoc
     */
    public function defineProperties(PropertiesBuilder $builder): \ArrayObject {
        return $builder
            ->newProperty("projectId")
                ->dataType($builder::DATA_TYPE_UINT)
            ->getResult();
    }
    /**
     * @inheritdoc
     */
    public function onBeforeRender(Block $block,
                                   BlockTypeInterface $blockType,
                                   Injector $di): void {
        $di->execute($this->doBeforeRender(...), [":params" => (object) [
            "projectId" => $block->projectId
        ]]);
    }
    /**
     * @inheritdoc
     */
    public function render(object $block,
                           \Closure $createDefaultProps,
                           \Closure $renderChildren,
                           WebPageAwareTemplate $tmpl): array {
        return el("div", $createDefaultProps(), el("ul", null,
            array_map(fn(object $task) =>
                el("li", [], [
                    el("a", ["href" => $tmpl->url("/kehitysidea?taskId={$task->id}")], $task->title),
                    self::createTagVNodes($task->tags),
                    el("div", null, "#{$task->id} luotu " . self::secondsToRelative($task->createdAt)),
                ])
            , $this->tasks),
            ...$renderChildren()
        ));
    }
    /**
     * @param list<Tag>
     * @return VNode
     */
    public static function createTagVNodes(array $tags): array {
        return el("span", ["class" => "task-tags"],
            array_map(function (object $tag) {
                return el("span",
                    ["class" => "task-tag color-{$tag->colorId}"],
                    $tag->text
                );
            }, $tags)
        );
    }
    /**
     * @param \Pike\Request $req
     * @param \SitePlugins\QKanboard\KanboardDataFetcher $dataFetcher
     * @param object{projectId: int} $params
     */
    private function doBeforeRender(Request $req, KanboardDataFetcher $dataFetcher, object $params): void {
        $phase = [
            "in-progress" => 3,
            "done" => 4,
        ][$req->queryVar("phase", "")] ?? null;

        if (is_int($phase))
            $data = $dataFetcher->callApi("searchTasks", (object) [
                "project_id" => $params->projectId,
                "query" => "column:{$phase}",
            ]);
        else
            $data = $dataFetcher->callApi("getAllTasks", (object) [
                "project_id" => $params->projectId,
                "status_id" => (int) $req->queryVar("closed") ?? QKanboard::TASK_STATUS_ACTIVE,
            ]);

        $tasks = $dataFetcher->createTasksFrom($data->result);
        foreach ($tasks as $i => $task)
            $tasks[$i]->tags = $dataFetcher->fetchAndCreateTags($task->id);
        $this->tasks = $tasks;
    }
    /**
     * @param int $pastTime
     * @param ?int $now = null
     * @return string
     */
    private static function secondsToRelative(int $pastTime, ?int $now = null): string {
        $timeDifference = ($now ?? time()) - $pastTime;

        $minute = 60;
        $hour = $minute * 60;
        $day = $hour * 24;
        $week = $day * 7;
        $month = $day * 30; // Approximate
        $year = $day * 365; // Approximate

        if ($timeDifference < $minute) {
            return ($timeDifference <= 1) ? 'sekunti sitten' : $timeDifference . ' sekuntia sitten';
        } elseif ($timeDifference < $hour) {
            $minutes = floor($timeDifference / $minute);
            return ($minutes == 1) ? 'minuutti sitten' : $minutes . ' minuuttia sitten';
        } elseif ($timeDifference < $day) {
            $hours = floor($timeDifference / $hour);
            return ($hours == 1) ? 'tunti sitten' : $hours . ' tuntia sitten';
        } elseif ($timeDifference < $week) {
            $days = floor($timeDifference / $day);
            return ($days == 1) ? 'eilen' : $days . ' päivää sitten';
        } elseif ($timeDifference < $month) {
            $weeks = floor($timeDifference / $week);
            return ($weeks == 1) ? 'viime viikolla' : $weeks . ' viikkoa sitten';
        } elseif ($timeDifference < $year) {
            $months = floor($timeDifference / $month);
            return ($months == 1) ? 'viime kuussa' : date('M d', $pastTime);
        }
        return date('M d Y', $pastTime);
    }
}
