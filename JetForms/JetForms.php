<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Pike\PikeException;
use Sivujetti\Block\BlockTree;
use Sivujetti\Page\Entities\Page;
use Sivujetti\UserPlugin\{UserPluginAPI, UserPluginInterface};

final class JetForms implements UserPluginInterface {
    /* fn(\PhpMailer\PhpMailer\PhpMailer $mailer): void */
    public const ON_MAILER_CONFIGURE = "plugins:jetFormsMailerOnConfigure";
    /** @var array<string, class-string> e.g. SendMail, SubsribeToNewsletter, CopyMessageToLocalDb */
    private array $behaviourExecutors = [];
    /**
     * @inheritdoc
     */
    public function __construct(UserPluginAPI $api) {
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
            $api->registerBlockType(TextareaInputBlockType::NAME, new TextareaInputBlockType);
            $api->registerBlockType(TextInputBlockType::NAME, new TextInputBlockType);
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
        $api->registerHttpRoute("POST", "/plugins/jet-forms/submits/[w:blockId]/[w:pageSlug]",
            SubmitsController::class, "handleSubmit"
        );
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
