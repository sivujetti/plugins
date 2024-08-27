<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Pike\PikeException;
use SitePlugins\JetForms\Captcha\CaptchaImplInterface;
use Sivujetti\Auth\{ACL, ACLRulesBuilder};
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
    /** @var class-string[] */
    private array $captchaImpls = [];
    /**
     * @inheritdoc
     */
    public function __construct(UserPluginAPI $api) {
        $api->registerHttpRoute("POST", "/plugins/jet-forms/submissions/[w:blockId]/[w:pageSlug]/[w:isPartOfTreeId]",
            SubmissionsController::class, "handleSubmission",
            ["allowMissingRequestedWithHeader" => true, "skipAuthButLoadRequestUser" => true]
        );
        $api->registerHttpRoute("GET", "/plugins/jet-forms/submissions",
            SubmissionsController::class, "listSubmissions",
            ["consumes" => "application/json",
             "identifiedBy" => ["list", "submissions"]]
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
            $api->registerBlockType(CheckboxInputBlockType::NAME, new CheckboxInputBlockType);
            $api->registerBlockType(ContactFormBlockType::NAME, new ContactFormBlockType);
            $api->registerBlockType(EmailInputBlockType::NAME, new EmailInputBlockType);
            $api->registerBlockType(NumberInputBlockType::NAME, new NumberInputBlockType);
            $api->registerBlockType(RadioGroupInputBlockType::NAME, new RadioGroupInputBlockType);
            $api->registerBlockType(SelectInputBlockType::NAME, new SelectInputBlockType);
            $api->registerBlockType(TextareaInputBlockType::NAME, new TextareaInputBlockType);
            $api->registerBlockType(TextInputBlockType::NAME, new TextInputBlockType);
            //
            $api->enqueueEditAppJsFile("plugin-jet-forms-edit-app-lang-{$api->getCurrentLang()}.js");
            $api->enqueueEditAppJsFile("plugin-jet-forms-edit-app-bundle.js");
            $api->enqueuePreviewAppJsFile("plugin-jet-forms-webpage-preview-renderer-app-bundle.js");
        });
        $api->on($api::ON_PAGE_BEFORE_RENDER, function (Page $page) use ($api) {
            if (!BlockTree::findBlock($page->blocks, fn($b) => $b->type === ContactFormBlockType::NAME))
                return;
            if (!$api->isJsFileEnqueued("sivujetti/vendor/pristine.min.js"))
                $api->enqueueJsFile("sivujetti/vendor/pristine.min.js");
            if (!$api->isJsFileEnqueued("sivujetti/sivujetti-commons-for-web-pages.js"))
                $api->enqueueJsFile("sivujetti/sivujetti-commons-for-web-pages.js");
            if (!$api->isJsFileEnqueued("plugin-jet-forms-bundle.js"))
                $api->enqueueJsFile("plugin-jet-forms-bundle.js");
        });
    }
    /**
     * @inheritdoc
     */
    public function defineAclRules(ACLRulesBuilder $builder): ACLRulesBuilder {
        return $builder
            ->defineResource("mailSendSettings", ["read", "update"])
                ->setPermissions(ACL::ROLE_ADMIN, ["read", "update"])
                ->setPermissions(ACL::ROLE_ADMIN_EDITOR, ["read", "update"])
            ->defineResource("submissions", ["list"])
                ->setPermissions(ACL::ROLE_ADMIN, ["list"])
                ->setPermissions(ACL::ROLE_ADMIN_EDITOR, ["list"])
                ->setPermissions(ACL::ROLE_EDITOR, ["list"]);
    }
    /**
     * @param string $name
     * @param class-string $ImplClass
     */
    public function registerBehaviourExecutor(string $name, string $ImplClass): void {
        $this->registerCls("Behaviour executor", $name, $ImplClass);
    }
    /**
     * @return class-string|null
     */
    public function getBehaviourExecutor(string $name): ?string {
        return $this->behaviourExecutors[$name] ?? null;
    }
    /**
     * @param string $name
     * @param class-string $ImplClass
     */
    public function registerCaptchaImpl(string $name, string $ImplClass): void {
        $this->registerCls("Captcha impl", $name, $ImplClass);
    }
    /**
     * @return class-string|null
     */
    public function getCaptchaImpl(string $name): ?string {
        return $this->captchaImpls[$name] ?? null;
    }
    /**
     * @param string $kind "Behaviour executor" or "Captcha impl"
     * @param string $name
     * @param class-string $ImplClass
     */
    private function registerCls(string $kind, string $name, string $ImplClass): void {
        [$interface, $bucket] = $kind === "Behaviour executor"
            ? [CaptchaImplInterface::class, $this->behaviourExecutors]
            : [CaptchaImplInterface::class, $this->captchaImpls];
        if (!class_exists($ImplClass))
            throw new PikeException("class \"{$ImplClass}\" doesn't exist",
                                    PikeException::BAD_INPUT);
        if (!array_key_exists($interface,
                              class_implements($ImplClass, false)))
            throw new PikeException("{$kind} (\"{$ImplClass}\") must implement {$interface}",
                                    PikeException::BAD_INPUT);
        $bucket[$name] = $ImplClass;
    }
}
