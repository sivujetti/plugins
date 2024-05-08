<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Sivujetti\BlockType\{BlockTypeInterface, JsxLikeRenderingBlockTypeInterface,
                         PropertiesBuilder};
use Sivujetti\Page\WebPageAwareTemplate;

use function Sivujetti\createElement as el;

abstract class InputBlockType implements BlockTypeInterface, JsxLikeRenderingBlockTypeInterface {
    /**
     * @return array
     * @psalma-return array{inputType: string, inputMode?: string}
     */
    protected abstract function getSettings(): array;
    /**
     * @inheritdoc
     */
    public function defineProperties(PropertiesBuilder $builder): \ArrayObject {
        return $this->addDefaultProperties($builder)->getResult();
    }
    /**
     * @inheritdoc
     */
    public function render(object $block,
                           \Closure $createDefaultProps,
                           \Closure $renderChildren,
                           WebPageAwareTemplate $tmpl): array {
        $settings = $this->getSettings();
        [$El, $attrs] = $settings["inputType"] !== "textarea"
            ? ["input",    ["type" => $settings["inputType"]]]
            : ["textarea", !$block->numRows ? [] : ["rows" => $block->numRows]];
        return el("div", $createDefaultProps("form-group"),
            !$block->label
                ? ""
                : el("label", ["class" => "form-label", "for" => $block->name], $block->label),
            el(
                $El,
                [
                    "name" => $block->name,
                    "id" => $block->name,
                    "class" => "form-input",
                    ...$attrs,
                    ...($block->placeholder ? ["placeholder" => $block->placeholder] : []),
                    ...($block->isRequired ? ["data-pristine-required" => ""] : []),
                    ...(($settings["inputMode"] ?? null) ? ["inputmode" => $settings["inputMode"]] : []),
                ]
            ),
            ...$renderChildren(),
        );
    }
    /**
     * @param \Sivujetti\BlockType\PropertiesBuilder $to
     * @return \Sivujetti\BlockType\PropertiesBuilder
     */
    protected function addDefaultProperties(PropertiesBuilder $to): PropertiesBuilder {
        return $to
            ->newProperty("name", $to::DATA_TYPE_TEXT)
            ->newProperty("isRequired", $to::DATA_TYPE_UINT)
            ->newProperty("label", $to::DATA_TYPE_TEXT)
            ->newProperty("placeholder", $to::DATA_TYPE_TEXT);
    }
}
