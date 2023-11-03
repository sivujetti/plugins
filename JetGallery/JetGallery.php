<?php declare(strict_types=1);

namespace SitePlugins\JetGallery;

use Sivujetti\Auth\{ACLRulesBuilder};
use Sivujetti\Block\BlockTree;
use Sivujetti\Page\Entities\Page;
use Sivujetti\UserPlugin\{UserPluginAPI, UserPluginInterface};

final class JetGallery implements UserPluginInterface {
    /**
     * @inheritdoc
     */
    public function __construct(UserPluginAPI $api) {
        $api->on($api::ON_ROUTE_CONTROLLER_BEFORE_EXEC, function () use ($api) {
            $api->registerBlockType(GridGalleryBlockType::NAME, new GridGalleryBlockType);
            $api->registerBlockRenderer(GridGalleryBlockType::DEFAULT_RENDERER);
            $api->registerBlockType(GalleryImageBlockType::NAME, new GalleryImageBlockType);
            $api->registerBlockRenderer(GalleryImageBlockType::DEFAULT_RENDERER);
            //
            $api->enqueueEditAppJsFile("plugin-jet-gallery-edit-app-lang-{$api->getCurrentLang()}.js");
            $api->enqueueEditAppJsFile("plugin-jet-gallery-edit-app-bundle.js");
        });
        $api->on($api::ON_PAGE_BEFORE_RENDER, function (Page $page) use ($api) {
            if (!BlockTree::findBlock($page->blocks, fn($b) => $b->type === GridGalleryBlockType::NAME))
                return;
            if (!$api->isCssFileEnqueued("sivujetti/vendor/photoswipe.css"))
                $api->enqueueCssFile("sivujetti/vendor/photoswipe.css");
            if (!$api->isJsFileEnqueued("sivujetti/vendor/photoswipe-lightbox.umd.min.js"))
                $api->enqueueJsFile("sivujetti/vendor/photoswipe-lightbox.umd.min.js");
            if (!$api->isJsFileEnqueued("sivujetti/vendor/photoswipe.umd.min.js"))
                $api->enqueueJsFile("sivujetti/vendor/photoswipe.umd.min.js");
            if (!$api->isJsFileEnqueued("plugin-jet-gallery-bundle.js"))
                $api->enqueueJsFile("plugin-jet-gallery-bundle.js");
        });
    }
    /**
     * @inheritdoc
     */
    public function defineAclRules(ACLRulesBuilder $builder): ACLRulesBuilder {
        return $builder;
    }
}
