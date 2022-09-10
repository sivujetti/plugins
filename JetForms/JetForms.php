<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Pike\PikeException;
use Sivujetti\Auth\ACLRulesBuilder;
use Sivujetti\Block\BlockTree;
use Sivujetti\Page\Entities\Page;
use Sivujetti\UserPlugin\{UserPluginAPI, UserPluginInterface};

/**
 * @psalm-type JetFormsMailSendSettings = array{sendingMethod: string, SMTP_host: ?string, SMTP_port: ?string, SMTP_username: ?string, SMTP_password: ?string, SMTP_secureProtocol: ?string}
 */
final class JetForms implements UserPluginInterface {
    /* fn(\PhpMailer\PhpMailer\PhpMailer $mailer): void */
    public const ON_MAILER_CONFIGURE = "plugins:jetFormsMailerOnConfigure";
    /** @var array<string, class-string> e.g. SendMail, SubsribeToNewsletter, CopyMessageToLocalDb */
    private array $behaviourExecutors = [];
    /**
     * @inheritdoc
     */
    public function __construct(UserPluginAPI $api) {
        $api->registerHttpRoute("POST", "/plugins/jet-forms/submits/[w:blockId]/[w:pageSlug]",
            SubmitsController::class, "handleSubmit",
            ["allowMissingRequestedWithHeader" => true, "skipAuth" => true]
        );
        $api->registerHttpRoute("GET", "/plugins/jet-forms/settings/mailSendSettings",
            SettingsController::class, "getMailSendSettings",
            ["consumes" => "application/json",
             "identifiedBy" => ["read", "mailSendSettings"]]
        );
        $api->registerHttpRoute("PUT", "/plugins/jet-forms/settings/mailSendSettings",
            SettingsController::class, "updateMailSendSettings",
            ["consumes" => "application/json",
             "identifiedBy" => ["update", "mailSendSettings"]]
        );
        //
        $api->on($api::ON_ROUTE_CONTROLLER_BEFORE_EXEC, function () use ($api) {
            $api->registerBlockType(ContactFormBlockType::NAME, new ContactFormBlockType);
            $api->registerBlockRenderer(ContactFormBlockType::DEFAULT_RENDERER);
            $api->registerBlockType(SubscriptionFormBlockType::NAME, new SubscriptionFormBlockType);
            $api->registerBlockRenderer(SubscriptionFormBlockType::DEFAULT_RENDERER);
            //
            $api->registerBlockRenderer(InlineInputBlockType::DEFAULT_RENDERER);
            $api->registerBlockRenderer(InputBlockType::DEFAULT_RENDERER);
            $api->registerBlockType(CheckboxInputBlockType::NAME, new CheckboxInputBlockType);
            $api->registerBlockType(EmailInputBlockType::NAME, new EmailInputBlockType);
            $api->registerBlockType(NumberInputBlockType::NAME, new NumberInputBlockType);
            $api->registerBlockType(TextareaInputBlockType::NAME, new TextareaInputBlockType);
            $api->registerBlockType(TextInputBlockType::NAME, new TextInputBlockType);
            //
            $api->registerBlockRenderer(SelectInputBlockType::DEFAULT_RENDERER);
            $api->registerBlockType(SelectInputBlockType::NAME, new SelectInputBlockType);
            //
            $api->enqueueEditAppJsFile("plugin-jet-forms-edit-app-lang-{$api->getCurrentLang()}.js");
            $api->enqueueEditAppJsFile("plugin-jet-forms-edit-app-bundle.js");
        });
        $api->on($api::ON_PAGE_BEFORE_RENDER, function (Page $page) use ($api) {
            if (!BlockTree::findBlock($page->blocks, fn($b) => $b->type === ContactFormBlockType::NAME ||
                                                                $b->type === SubscriptionFormBlockType::NAME))
                return;
            if (!$api->isJsFileEnqueued("sivujetti/vendor/pristine.min.js"))
                $api->enqueueJsFile("sivujetti/vendor/pristine.min.js");
            if (!$api->isJsFileEnqueued("plugin-jet-forms-bundle.js"))
                $api->enqueueJsFile("plugin-jet-forms-bundle.js");
        });
    }
    /**
     * @inheritdoc
     */
    public function defineAclRules(ACLRulesBuilder $builder): ACLRulesBuilder {
        return $builder
            ->defineResource("mailSendSettings", ["read", "update"]);
            // Use the default permissions (SUPER_ADMIN can do anything, everybody else nothing at all)
    }
    /**
     * @param string $name
     * @param class-string $ImplClass
     */
    public function registerBehaviourExecutor(string $name, string $ImplClass): void {
        if (!class_exists($ImplClass))
            throw new PikeException("class \"{$ImplClass}\" doesn't exist",
                                    PikeException::BAD_INPUT);
        if (!array_key_exists(BehaviourExecutorInterface::class,
                              class_implements($ImplClass, false)))
            throw new PikeException("Behaviour executor (\"{$ImplClass}\") must implement " . BehaviourExecutorInterface::class,
                                    PikeException::BAD_INPUT);
        $this->behaviourExecutors[$name] = $ImplClass;
    }
    /**
     * @return class-string|null
     */
    public function getBehaviourExecutor(string $name): ?string {
        return $this->behaviourExecutors[$name] ?? null;
    }
}
