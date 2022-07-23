<?php declare(strict_types=1);

namespace SitePlugins\JetIcons;

use Sivujetti\Auth\ACL;
use Sivujetti\Auth\ACLRulesBuilder;
use Sivujetti\UserPlugin\{UserPluginAPI, UserPluginInterface};

final class JetIcons implements UserPluginInterface {
    /**
     * @inheritdoc
     */
    public function __construct(UserPluginAPI $api) {
        $api->registerHttpRoute("GET", "/plugins/jet-icons/icons-pack-icons/default",
            MainController::class, "getIconPackIcons",
            ["consumes" => "application/json",
             "identifiedBy" => ["list", "icons"]]
        );
        //
        $api->on($api::ON_ROUTE_CONTROLLER_BEFORE_EXEC, function () use ($api) {
            $api->registerBlockType(IconBlockType::NAME, new IconBlockType);
            $api->registerBlockRenderer(IconBlockType::DEFAULT_RENDERER);
            //
            $api->enqueueEditAppJsFile("plugin-jet-icons-edit-app-lang-{$api->getCurrentLang()}.js");
            $api->enqueueEditAppJsFile("plugin-jet-icons-edit-app-bundle.js");
        });
    }
    /**
     * @inheritdoc
     */
    public function defineAclRules(ACLRulesBuilder $builder): ACLRulesBuilder {
        return $builder
            ->defineResource("icons", ["list"])
            ->setPermissions(ACL::ROLE_ADMIN, ["list"])
            ->setPermissions(ACL::ROLE_ADMIN_EDITOR, ["list"])
            ->setPermissions(ACL::ROLE_EDITOR, ["list"])
            ->setPermissions(ACL::ROLE_AUTHOR, ["list"]);
    }
}
