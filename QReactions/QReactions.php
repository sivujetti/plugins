<?php declare(strict_types=1);

namespace SitePlugins\QReactions;

use Sivujetti\UserPlugin\{UserPluginAPI, UserPluginInterface};

final class QReactions implements UserPluginInterface {
    public function __construct(UserPluginAPI $api) {
        $api->registerBlockType("QReactionsReactionButtons", new ReactionButtonsBlockType);
        $api->registerBlockRenderer("sivujetti:q-reactions-block-reaction-buttons");
        $api->enqueueEditAppJsFile("plugin-q-reactions.bundled.js");
    }
}
