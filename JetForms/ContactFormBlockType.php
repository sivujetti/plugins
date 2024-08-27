<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Pike\{ArrayUtils, Injector, PikeException};
use SitePlugins\JetForms\Captcha\CaptchaImplInterface;
use SitePlugins\JetForms\Captcha\JetCaptcha;
use Sivujetti\{AppEnv, SharedAPIContext};
use Sivujetti\Block\Entities\Block;
use Sivujetti\BlockType\{BlockTypeInterface, JsxLikeRenderingBlockTypeInterface,
                         PropertiesBuilder, RenderAwareBlockTypeInterface};
use Sivujetti\Page\WebPageAwareTemplate;

use function Sivujetti\createElement as el;

class ContactFormBlockType implements BlockTypeInterface,
                                      RenderAwareBlockTypeInterface,
                                      JsxLikeRenderingBlockTypeInterface {
    public const NAME = "JetFormsContactForm";
    public const DEFAULT_RENDERER = "plugins/JetForms:block-contact-form";
    /** @var \SitePlugins\JetForms\Captcha\CaptchaImplInterface[] */
    private static array $captchaClses = [];
    /**
     * @inheritdoc
     */
    public function defineProperties(PropertiesBuilder $builder): \ArrayObject {
        return $builder
            ->newProperty("behaviours")->dataType(
                $builder::DATA_TYPE_ARRAY,
                sanitizeWith: fn(array $in) => array_map(fn(object $beh) =>
                    $beh // todo
                , $in)
            )
            ->newProperty("captchaToUse")->dataType($builder::DATA_TYPE_TEXT, isNullable: true)
            ->getResult();
    }
    /**
     * @inheritdoc
     */
    public function onBeforeRender(Block $block,
                                   BlockTypeInterface $blockType,
                                   Injector $di): void {
        if (!$block->captchaToUse)
            return;
        if (!array_key_exists($block->captchaToUse, self::$captchaClses)) {
            if ($block->captchaToUse !== "jet-captcha")
                $di->execute($this->doPerformBeforeRender(...), [
                    ":captchaToUse" => $block->captchaToUse,
                ]);
            else
                self::$captchaClses["jet-captcha"] = new JetCaptcha();
        }
    }
    /**
     * @inheritdoc
     */
    public function render(object $block,
                           \Closure $createDefaultProps,
                           \Closure $renderChildren,
                           WebPageAwareTemplate $tmpl): array {
        $currentUrl = $tmpl->getLocal("currentUrl");
        $currentPage = $tmpl->getLocal("currentPage");
        $slugPcs = $currentPage->slug !== "/" ? $currentPage->slug : "/-";
        $treeId = $tmpl->findBlockAndTree($currentPage->blocks, fn($b) => $b->id === $block->id)[1]->id;
        $cImpl = $block->captchaToUse ? self::$captchaClses[$block->captchaToUse] : null;
        return el("form",
            [
                "action" => $tmpl->url("/plugins/jet-forms/submissions/{$block->id}{$slugPcs}/{$treeId}"),
                "method" => "post",
                "data-form-sent-message" => ArrayUtils::findByKey($block->behaviours, "ShowSentMessage", "name")?->data?->message ?? "",
                "data-form-id" => $block->id,
                "data-form-type" => "contact",
                ...$createDefaultProps("jet-form"), // class may be mutated my public/plugin-jet-forms-bundle.js also
            ],
            ...[
                ...$renderChildren(),
                el("input", [
                    "type" => "hidden",
                    "name" => "_returnTo",
                    "value" => is_string($block->returnTo ?? null)
                        ? $block->returnTo
                        : "{$tmpl->url($currentUrl)}#contact-form-sent={$block->id}"
                ]),
                ...($cImpl
                    ? [
                        el("input", ["type" => "hidden", "name" => "captchaToUse", "value" => $block->captchaToUse]),
                        ...$cImpl->render()
                    ]
                    : []),
            ]
        );
    }
    /**
     * @return ?string
     */
    public static function getSecret(): ?string {
        $arr = require __DIR__ . "/config.php";
        return $arr["secret"] ?? null;
    }
    /**
     * @param string $captchaToUse
     * @param \Sivujetti\SharedAPIContext $apiCtx 
     * @param \Sivujetti\AppEnv $appEnv
     */
    private function doPerformBeforeRender(string $captchaToUse,
                                          SharedAPIContext $apiCtx,
                                          AppEnv $appEnv): void {
        /** @var \SitePlugins\JetForms\JetForms */
        $jetForms = $apiCtx->getPlugin("JetForms");
        $ClsString = $jetForms->getCaptchaImpl($captchaToUse);
        $instance = $appEnv->di->make($ClsString);
        if (!($instance instanceof CaptchaImplInterface))
            throw new PikeException("Captcha classes must implement CaptchaImplInterface",
                                    PikeException::DOING_IT_WRONG);
        self::$captchaClses[$captchaToUse] = $instance;
    }
}
