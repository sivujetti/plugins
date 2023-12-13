<?php declare(strict_types=1);

namespace SitePlugins\JetStaticExp;

use Sivujetti\Auth\{ACL, ACLRulesBuilder};
use Sivujetti\UserPlugin\{UserPluginAPI, UserPluginInterface};

final class JetStaticExp implements UserPluginInterface {
    /**
     * @inheritdoc
     */
    public function __construct(UserPluginAPI $api) {
        $api->registerHttpRoute("POST", "/plugins/jet-static-exp/exports/export",
            ExportsController::class, "exportSite",
            ["consumes" => "application/json",
             "identifiedBy" => ["exportAsStatic", "sites"]]
        );
    }
    /**
     * @inheritdoc
     */
    public function defineAclRules(ACLRulesBuilder $builder): ACLRulesBuilder {
        return $builder
            ->defineResource("sites", ["exportAsStatic"])
                ->setPermissions(ACL::ROLE_ADMIN, ["exportAsStatic"])
                ->setPermissions(ACL::ROLE_ADMIN_EDITOR, ["exportAsStatic"]);
    }
}
