<?php declare(strict_types=1);

namespace SitePlugins\JetStaticExp;

use Sivujetti\Auth\{ACL, ACLRulesBuilder};
use Sivujetti\UserPlugin\{UserPluginAPI, UserPluginInterface};

/**
 * @phpstan-import-type UserDefinedAssets from \Sivujetti\SharedAPIContext
 *
 * @phpstan-type ExportedItem array{html: string, relFilePath: string, enqueuedFiles: UserDefinedAssets}
 */
final class JetStaticExp implements UserPluginInterface {
    /**
     * @inheritdoc
     */
    public function __construct(UserPluginAPI $api) {
        $api->registerHttpRoute("GET", "/plugins/jet-static-exp/exports/exportable-public-files",
            ExportsController::class, "listExportablePublicFiles",
            ["consumes" => "application/json",
             "identifiedBy" => ["exportAsStatic", "sites"]]
        );
        $api->registerHttpRoute("POST", "/plugins/jet-static-exp/exports/export",
            ExportsController::class, "exportSite",
            ["consumes" => "application/json",
             "identifiedBy" => ["exportAsStatic", "sites"]]
        );
        //
        $api->on($api::ON_ROUTE_CONTROLLER_BEFORE_EXEC, function () use ($api) {
            $api->enqueueEditAppJsFile("plugin-jet-static-exp-edit-app-lang-{$api->getCurrentLang()}.js");
            $api->enqueueEditAppJsFile("plugin-jet-static-exp-edit-app-bundle.js");
        });
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
