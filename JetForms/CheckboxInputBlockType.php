<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Sivujetti\BlockType\{BlockTypeInterface, JsxLikeRenderingBlockTypeInterface, PropertiesBuilder};
use Sivujetti\Page\WebPageAwareTemplate;

use function Sivujetti\createElement as el;

final class CheckboxInputBlockType implements BlockTypeInterface, JsxLikeRenderingBlockTypeInterface {
    public const NAME = "JetFormsCheckboxInput";
    public const DEFAULT_RENDERER = "plugins/JetForms:block-inline-input-auto";
    /**
     * @inheritdoc
     */
    public function defineProperties(PropertiesBuilder $builder): \ArrayObject {
        return $builder
            ->newProperty("name", $builder::DATA_TYPE_TEXT)
            ->newProperty("isRequired", $builder::DATA_TYPE_UINT)
            ->newProperty("label", $builder::DATA_TYPE_TEXT)
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
            el("label", ["class" => "form-checkbox"],
                el(
                    "input",
                    [
                        "name" => $block->name,
                        "type" => "checkbox",
                        ...($block->isRequired ? ["data-pristine-required" => ""] : []),
                    ],
                ),
                el("i", ["class" => "form-icon"]), " ", $block->label,
            ),
            $renderChildren(),
        );
    }
}
