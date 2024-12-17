<?php declare(strict_types=1);

namespace SitePlugins\JetGalleries;

use Sivujetti\Auth\{ACLRulesBuilder};
use Sivujetti\Block\BlockTree;
use Sivujetti\Page\Entities\Page;
use Sivujetti\UserPlugin\{UserPluginAPI, UserPluginInterface};

final class JetGalleries implements UserPluginInterface {
    /**
     * @inheritdoc
     */
    public function __construct(UserPluginAPI $api) {
        $api->on($api::ON_ROUTE_CONTROLLER_BEFORE_EXEC, function () use ($api) {
            $api->enqueueEditAppJsFile("plugin-jet-galleries-edit-app-lang-{$api->getCurrentLang()}.js");
            $api->enqueueEditAppJsFile("plugin-jet-galleries-edit-app-bundle.js");
            $api->enqueuePreviewAppJsFile("plugin-jet-galleries-webpage-preview-renderer-app-bundle.js");
        });
        $api->on($api::ON_PAGE_BEFORE_RENDER, function (Page $page, bool $editModeIsOn) use ($api) {
            if (!$editModeIsOn && !BlockTree::findBlock($page->blocks, fn($b) => $api->hasBehaviour($b, "jet-gallery")))
                return;
            if (!$api->isCssFileEnqueued("sivujetti/vendor/photoswipe.css"))
                $api->enqueueCssFile("sivujetti/vendor/photoswipe.css");
            if (!$api->isJsFileEnqueued("sivujetti/vendor/photoswipe-lightbox.umd.min.js"))
                $api->enqueueJsFile("sivujetti/vendor/photoswipe-lightbox.umd.min.js");
            if (!$api->isJsFileEnqueued("sivujetti/vendor/photoswipe.umd.min.js"))
                $api->enqueueJsFile("sivujetti/vendor/photoswipe.umd.min.js");
            if (!$api->isJsFileEnqueued("sivujetti/sivujetti-commons-for-web-pages.js"))
                $api->enqueueJsFile("sivujetti/sivujetti-commons-for-web-pages.js");
            if (!$api->isJsFileEnqueued("plugin-jet-galleries-bundle.js"))
                $api->enqueueJsFile("plugin-jet-galleries-bundle.js");
        });
    }
    /**
     * @inheritdoc
     */
    public function defineAclRules(ACLRulesBuilder $builder): ACLRulesBuilder {
        return $builder;
    }
}
