<?php declare(strict_types=1);

namespace SitePlugins\QKanboard;

use Pike\ArrayUtils;
use Sivujetti\Auth\{ACLRulesBuilder};
use Sivujetti\UserPlugin\{UserPluginAPI, UserPluginInterface};

final class QKanboard implements UserPluginInterface {
    public const TASK_STATUS_ACTIVE = 1;
    public const TASK_STATUS_INACTIVE = 0;
    public const TASK_COLUMN_IN_PROGRESS = 3;
    public const TASK_COLUMN_DONE = 4;
    /**
     * @inheritdoc
     */
    public function __construct(UserPluginAPI $api) {
        $api->on($api::ON_PAGE_BEFORE_RENDER, function ($page, $editModeIsOn) use ($api) {
            if ($editModeIsOn)
                return;
            $taskMeta = ArrayUtils::find($page->blocks, fn($b) => $b->type === TaskPageProcessorBlockType::NAME);
            if (!$taskMeta)
                return;
            TaskPageProcessorBlockType::patchTaskPage($taskMeta, $page);
        });
        $api->on($api::ON_ROUTE_CONTROLLER_BEFORE_EXEC, function () use ($api) {
            $api->registerBlockType(TasksListingBlockType::NAME, new TasksListingBlockType);
            $api->registerBlockType(TaskPageProcessorBlockType::NAME, new TaskPageProcessorBlockType);
            //
            $api->enqueueEditAppJsFile("plugin-q-kanboard-edit-app-lang-{$api->getCurrentLang()}.js");
            $api->enqueueEditAppJsFile("plugin-q-kanboard-edit-app-bundle.js");
            $api->enqueuePreviewAppJsFile("plugin-q-kanboard-webpage-preview-renderer-app-bundle.js");
        });
    }
    /**
     * @inheritdoc
     */
    public function defineAclRules(ACLRulesBuilder $builder): ACLRulesBuilder {
        return $builder;
    }
}
