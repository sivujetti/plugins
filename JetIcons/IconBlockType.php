<?php declare(strict_types=1);

namespace SitePlugins\JetIcons;

use Pike\{ArrayUtils, Injector};
use Sivujetti\Auth\ACL;
use Sivujetti\BlockType\{BlockTypeInterface, JsxLikeRenderingBlockTypeInterface,
                         PropertiesBuilder, SaveAwareBlockTypeInterface};
use Sivujetti\Page\WebPageAwareTemplate;

use function Sivujetti\createElement as el;

final class IconBlockType implements BlockTypeInterface,
                                     SaveAwareBlockTypeInterface,
                                     JsxLikeRenderingBlockTypeInterface {
    public const NAME = "JetIconsIcon";
    public const DEFAULT_RENDERER = "plugins/JetIcons:block-icon-default";
    /**
     * @inheritdoc
     */
    public function defineProperties(PropertiesBuilder $builder): \ArrayObject {
        $roles = ACL::ROLE_ADMIN|ACL::ROLE_ADMIN_EDITOR|ACL::ROLE_EDITOR|ACL::ROLE_AUTHOR;
        return $builder
            ->newProperty("iconId")
                ->dataType($builder::DATA_TYPE_TEXT, canBeEditedBy: $roles)
            ->newProperty("cachedInlineSvg")
                ->dataType($builder::DATA_TYPE_TEXT, canBeEditedBy: $roles)
            ->getResult();
    }
    /**
     * @inheritdoc
     */
    public function render(object $block,
                           \Closure $createDefaultProps,
                           \Closure $renderChildren,
                           WebPageAwareTemplate $tmpl): array {
        return el("span", $createDefaultProps(),
            ($block->iconId && $block->cachedInlineSvg
                ? el("svg", [
                        "xmlns" => "http://www.w3.org/2000/svg",
                        "class" => "icon icon-tabler icon-tabler-{$block->iconId}", // @allow unescaped
                        "width" => "24",
                        "height" => "24",
                        "viewBox" => "0 0 24 24",
                        "stroke-width" => "2",
                        "stroke" => "currentColor",
                        "fill" => "none",
                        "stroke-linecap" => "round",
                        "stroke-linejoin" => "round"
                    ],
                    $block->cachedInlineSvg // @allow unescaped
                )
                : el("span", [
                        "title" => $tmpl->__("Waits for configuration ..."),
                        "style" => "border: 1px dashed;display: inline-block;padding: 11px;"
                    ],
                    ""
                )
            ),
            ...$renderChildren()
        );
    }
    /**
     * @inheritdoc
     */
    public function onBeforeSave(bool $isInsert,
                                 object $storableBlock,
                                 BlockTypeInterface $blockType,
                                 Injector $di): void {
        $iconId = ArrayUtils::findByKey($storableBlock->propsData, "iconId", "key")->value;
        if (!$iconId) return; // Nothing to update / icon not selected yet

        $di->execute(function(object $block, TablerIconPack $icons) use ($iconId): void {
            $pair = (object) [
                "key" => "__cachedInlineSvg",
                "value" => $icons->getSingle($iconId, "")
            ];
            $currentIdx = ArrayUtils::findIndexByKey($block->propsData, "__cachedInlineSvg", "key");
            if ($currentIdx > -1) $block->propsData[$currentIdx] = $pair; // override
            else $block->propsData[] = $pair; // add
        }, [
            ":block" => $storableBlock,
        ]);
    }
}
