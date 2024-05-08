<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Sivujetti\BlockType\{BlockTypeInterface, JsxLikeRenderingBlockTypeInterface, PropertiesBuilder};
use Sivujetti\Page\WebPageAwareTemplate;

use function Sivujetti\createElement as el;

final class SelectInputBlockType implements BlockTypeInterface, JsxLikeRenderingBlockTypeInterface {
    public const NAME = "JetFormsSelectInput";
    public const DEFAULT_RENDERER = "plugins/JetForms:block-input-select";
    /**
     * @inheritdoc
     */
    public function defineProperties(PropertiesBuilder $builder): \ArrayObject {
        return $builder
            ->newProperty("name", $builder::DATA_TYPE_TEXT)
            ->newProperty("label", $builder::DATA_TYPE_TEXT)
            ->newProperty("options")->dataType(
                $builder::DATA_TYPE_ARRAY,
                sanitizeWith: fn(array $in) => array_map(fn(object $itm) =>
                    (object) ["text" => strval($itm->text), "value" => strval($itm->value)]
                , $in)
            )
            ->newProperty("multiple", $builder::DATA_TYPE_UINT)
            ->getResult();
    }
    /**
     * @inheritdoc
     */
    public function render(object $block,
                           \Closure $createDefaultProps,
                           \Closure $renderChildren,
                           WebPageAwareTemplate $tmpl): array {
        return el("div", $createDefaultProps("form-group"),
            !$block->label
                ? ""
                : el("label", ["class" => "form-label", "for" => $block->name], $block->label),
            el(
                "select",
                [
                    "class" => "form-select",
                    "name" => $block->name . ($block->multiple ? "[]" : ""),
                    ...($block->multiple ? ["multiple" => ""] : []),
                ],
                array_map(fn($itm) =>
                    el("option", ["value" => $itm->value], $tmpl->__($itm->text))
                , [
                    ...$block->options,
                    (object) ["text" => "-", "value" => "-"]
                ]),
            ),
            ...$renderChildren()
        );
    }
}
