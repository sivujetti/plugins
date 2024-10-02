<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Pike\{ArrayUtils};
use Sivujetti\BlockType\{BlockTypeInterface, JsxLikeRenderingBlockTypeInterface,
                         PropertiesBuilder};
use Sivujetti\Page\WebPageAwareTemplate;

use function Sivujetti\createElement as el;

class ContactFormBlockType implements BlockTypeInterface,
                                      JsxLikeRenderingBlockTypeInterface {
    public const NAME = "JetFormsContactForm";
    public const DEFAULT_RENDERER = "plugins/JetForms:block-contact-form";
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
                ...($block->captchaToUse
                    ? [
                        el("input", ["type" => "hidden", "name" => "captchaToUse", "value" => $block->captchaToUse]),
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
}
