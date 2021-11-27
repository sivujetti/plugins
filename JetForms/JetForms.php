<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Sivujetti\Block\BlockTree;
use Sivujetti\UserPlugin\{UserPluginAPI, UserPluginInterface};

final class JetForms implements UserPluginInterface {
    /* fn(\PhpMailer\PhpMailer\PhpMailer $mailer): void */
    public const ON_MAILER_CONFIGURE = "plugins:jetFormsMailerOnConfigure";
    /**
     * @inheritdoc
     */
    public function __construct(UserPluginAPI $api) {
        $api->registerBlockType(ContactFormBlockType::NAME, new ContactFormBlockType);
        $api->registerBlockRenderer("sivujetti:jet-forms-block-contact-form");
        $api->enqueueEditAppJsFile("plugin-jet-forms-edit-app-bundle.js");
        $api->on("sivujetti:onPageBeforeRender", function ($page) use ($api) {
            if (!BlockTree::findBlock($page->blocks, fn($b) => $b->type === ContactFormBlockType::NAME))
                return;
            if (!$api->isJsFileEnqueued("sivujetti/vendor/pristine.min.js"))
                $api->enqueueJsFile("sivujetti/vendor/pristine.min.js");
            if (!$api->isJsFileEnqueued("plugin-jet-forms-bundle.js"))
                $api->enqueueJsFile("plugin-jet-forms-bundle.js");
        });
        $api->registerHttpRoute("POST", "/plugins/jet-forms/submits/[w:blockId]/[w:pageSlug]",
            SubmitsController::class, "handleSubmit"
        );
    }
}
