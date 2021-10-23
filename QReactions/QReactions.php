<?php declare(strict_types=1);

namespace SitePlugins\QReactions;

use Sivujetti\Block\BlockTree;
use Sivujetti\UserPlugin\{UserPluginAPI, UserPluginInterface};

final class QReactions implements UserPluginInterface {
    public function __construct(UserPluginAPI $api) {
        $api->registerBlockType(ReactionButtonsBlockType::NAME, new ReactionButtonsBlockType);
        $api->registerBlockRenderer("sivujetti:q-reactions-block-reaction-buttons");
        $api->enqueueEditAppJsFile("plugin-q-reactions-edit-app-bundle.js");
        $api->on("sivujetti:onPageBeforeRender", function ($page) use ($api) {
            if (!BlockTree::findBlock($page->blocks, fn($b) => $b->type === ReactionButtonsBlockType::NAME))
                return;
            if (!$api->isJsFileEnqueued("sivujetti/sivujetti-website-tools.js"))
                $api->enqueueJsFile("sivujetti/sivujetti-website-tools.js");
            if (!$api->isJsFileEnqueued("plugin-q-reactions-bundle.js"))
                $api->enqueueJsFile("plugin-q-reactions-bundle.js");
        });
        $api->registerHttpRoute("POST", "/plugins/q-reactions/reactions",
            ReactionsController::class, "addReaction"
        );
    }
}
