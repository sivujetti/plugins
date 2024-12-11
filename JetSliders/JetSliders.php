<?php declare(strict_types=1);

namespace SitePlugins\JetSliders;

use Sivujetti\Auth\{ACLRulesBuilder};
use Sivujetti\Block\BlockTree;
use Sivujetti\Page\Entities\Page;
use Sivujetti\UserPlugin\{UserPluginAPI, UserPluginInterface};

final class JetSliders implements UserPluginInterface {
    /**
     * @inheritdoc
     */
    public function __construct(UserPluginAPI $api) {
        $api->on($api::ON_ROUTE_CONTROLLER_BEFORE_EXEC, function () use ($api) {
            $api->enqueueEditAppJsFile("plugin-jet-sliders-edit-app-lang-{$api->getCurrentLang()}.js");
            $api->enqueueEditAppJsFile("plugin-jet-sliders-edit-app-bundle.js");
        });
        $api->on($api::ON_PAGE_BEFORE_RENDER, function (Page $page, bool $editModeIsOn) use ($api) {
            if (!$editModeIsOn && !BlockTree::findBlock($page->blocks, fn($b) => $api->hasBehaviour($b, "jet-slider")))
                return;
            if (!$api->isCssFileEnqueued("sivujetti/vendor/keen-slider.min.css"))
                $api->enqueueCssFile("sivujetti/vendor/keen-slider.min.css");
            if (!$api->isJsFileEnqueued("sivujetti/vendor/keen-slider.js"))
                $api->enqueueJsFile("sivujetti/vendor/keen-slider.js");
            if (!$api->isJsFileEnqueued("plugin-jet-sliders-bundle.js"))
                $api->enqueueJsFile("plugin-jet-sliders-bundle.js");
        });
    }
    /**
     * @inheritdoc
     */
    public function defineAclRules(ACLRulesBuilder $builder): ACLRulesBuilder {
        return $builder;
    }
}
