<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Pike\Auth\Crypto;
use Pike\{ArrayUtils, Injector, Request};
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
    /** @var string */
    private static string $cachedCaptchaToken = "";
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
            ->newProperty("useCaptcha")->dataType($builder::DATA_TYPE_UINT)
            ->getResult();
    }
    /**
     * @inheritdoc
     */
    public function onBeforeRender(Block $block,
                                   BlockTypeInterface $blockType,
                                   Injector $di): void {
        if (!$block->useCaptcha)
            return;
        if (self::$cachedCaptchaToken) {
            $block->__captchaChallenge = self::$cachedCaptchaToken;
            return;
        }
        $di->execute([$this, "doPerformBeforeRender"], [
            ":block" => $block,
        ]);
    }
    /**
     * @param \Sivujetti\Block\Entities\Block $block
     * @param \Pike\Request $req
     * @param \Pike\Auth\Crypto $crypto
     */
    public function doPerformBeforeRender(Block $block,
                                          Request $req,
                                          Crypto $crypto): void {
        if ($req->queryVar("in-edit") === null) {
            $key = self::getSecret();
            self::$cachedCaptchaToken = $crypto->encrypt(strval(time()), $key);
        } else {
            self::$cachedCaptchaToken = "-";
        }
        $block->__captchaChallenge = self::$cachedCaptchaToken;
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
                $block->useCaptcha
                    ? el("input", ["type" => "hidden", "name" => "_cChallenge", "value" => $block->__captchaChallenge ?? ""])
                    : ""
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
}
