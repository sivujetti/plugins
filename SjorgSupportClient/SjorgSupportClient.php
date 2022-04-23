<?php declare(strict_types=1);

namespace SitePlugins\SjorgSupportClient;

use Sivujetti\UserPlugin\{UserPluginAPI, UserPluginInterface};

final class SjorgSupportClient implements UserPluginInterface {
    /**
     * @inheritdoc
     */
    public function __construct(UserPluginAPI $api) {
        $api->on($api::ON_ROUTE_CONTROLLER_BEFORE_EXEC, function () use ($api) {
            $api->enqueueEditAppJsFile("plugin-sjorg-support-client-edit-app-lang-{$api->getCurrentLang()}.js");
            $api->enqueueEditAppJsFile("plugin-sjorg-support-client-edit-app-bundle.js");
        });
    }
}
