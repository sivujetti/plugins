<?php declare(strict_types=1);

namespace SitePlugins\SjorgSupportServer;

use Sivujetti\UserPlugin\{UserPluginAPI, UserPluginInterface};

final class SjorgSupportServer implements UserPluginInterface {
    /**
     * @inheritdoc
     */
    public function __construct(UserPluginAPI $api) {
        $api->registerHttpRoute("GET", "/plugins/sjorg-support-server/articles/featured",
            ArticlesController::class, "listFeaturedArticles"
        );
    }
}
