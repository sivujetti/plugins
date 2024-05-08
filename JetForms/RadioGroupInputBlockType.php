<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Sivujetti\BlockType\{BlockTypeInterface, JsxLikeRenderingBlockTypeInterface, PropertiesBuilder};
use Sivujetti\Page\WebPageAwareTemplate;

use function Sivujetti\createElement as el;

final class RadioGroupInputBlockType implements BlockTypeInterface, JsxLikeRenderingBlockTypeInterface {
    public const NAME = "JetFormsRadioGroupInput";
    public const DEFAULT_RENDERER = "plugins/JetForms:block-input-radio-group";
    /**
     * @inheritdoc
     */
    public function defineProperties(PropertiesBuilder $builder): \ArrayObject {
        return $builder
            ->newProperty("name", $builder::DATA_TYPE_TEXT)
            ->newProperty("label", $builder::DATA_TYPE_TEXT)
            ->newProperty("radios")->dataType(
                $builder::DATA_TYPE_ARRAY,
                sanitizeWith: fn(array $in) => array_map(fn(object $itm) =>
                    (object) ["text" => strval($itm->text), "value" => strval($itm->value)]
                , $in)
            )
            ->newProperty("isRequired", $builder::DATA_TYPE_UINT)
            ->getResult();
    }
    /**
     * @inheritdoc
     */
    public function render(object $block,
                           \Closure $createDefaultProps,
                           \Closure $renderChildren,
                           WebPageAwareTemplate $tmpl): array {
        return el("div", $createDefaultProps("form-group"), [
            ...($block->label
                ? [el("div", ["class" => "form-label"], $block->label)]
                : []),
            ...array_map(fn($radio) => el("label", ["class" => "form-radio"],
                el("input", [
                    "name" => $block->name,
                    "value" => $radio->value,
                    "type" => "radio",
                    "name" => $block->name,
                    ...($block->isRequired ? ["data-pristine-required" => ""] : []),
                ]),
                el("i", ["class" => "form-icon"]), " ", $radio->text
            ), $block->radios),
            ...$renderChildren(),
        ]);
    }
}
