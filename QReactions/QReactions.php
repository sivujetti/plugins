<?php declare(strict_types=1);

namespace SitePlugins\QReactions;

use Sivujetti\Block\BlockTree;
use Sivujetti\Page\Entities\Page;
use Sivujetti\UserPlugin\{UserPluginAPI, UserPluginInterface};

final class QReactions implements UserPluginInterface {
    public function __construct(UserPluginAPI $api) {
        $api->on($api::ON_ROUTE_CONTROLLER_BEFORE_EXEC, function () use ($api) {
            $api->registerBlockType(ReactionButtonsBlockType::NAME, new ReactionButtonsBlockType);
            $api->registerBlockRenderer(ReactionButtonsBlockType::DEFAULT_RENDERER);
            $api->enqueueEditAppJsFile("plugin-q-reactions-edit-app-lang-{$api->getCurrentLang()}.js");
            $api->enqueueEditAppJsFile("plugin-q-reactions-edit-app-bundle.js");
        });
        $api->on($api::ON_PAGE_BEFORE_RENDER, function (Page $page) use ($api) {
            if (!BlockTree::findBlock($page->blocks, fn($b) => $b->type === ReactionButtonsBlockType::NAME))
                return;
            if (!$api->isJsFileEnqueued("sivujetti/sivujetti-commons-for-web-pages.js"))
                $api->enqueueJsFile("sivujetti/sivujetti-commons-for-web-pages.js");
            if (!$api->isJsFileEnqueued("plugin-q-reactions-bundle.js"))
                $api->enqueueJsFile("plugin-q-reactions-bundle.js");
        });
        $api->registerHttpRoute("POST", "/plugins/q-reactions/reactions",
            ReactionsController::class, "addReaction"
        );
    }
}
