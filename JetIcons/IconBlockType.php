<?php declare(strict_types=1);

namespace SitePlugins\JetIcons;

use Pike\{ArrayUtils, Injector};
use Sivujetti\Auth\ACL;
use Sivujetti\Block\Entities\Block;
use Sivujetti\BlockType\{BlockTypeInterface, PropertiesBuilder, RenderAwareBlockTypeInterface, SaveAwareBlockTypeInterface};

/**
 * @psalm-import-type RawStorableBlock from \Sivujetti\BlockType\SaveAwareBlockTypeInterface
 */
final class IconBlockType implements BlockTypeInterface, SaveAwareBlockTypeInterface, RenderAwareBlockTypeInterface {
    public const NAME = "JetIconsIcon";
    public const DEFAULT_RENDERER = "plugins/JetIcons:block-icon-default";
    /**
     * @inheritdoc
     */
    public function defineProperties(PropertiesBuilder $builder): \ArrayObject {
        return $builder
            ->newProperty("iconId")
                ->dataType($builder::DATA_TYPE_TEXT, canBeEditedBy: ACL::ROLE_ADMIN|ACL::ROLE_ADMIN_EDITOR|ACL::ROLE_EDITOR|ACL::ROLE_AUTHOR)
            ->getResult();
    }
    /**
     * @inheritdoc
     */
    public function onBeforeSave(bool $isInsert,
                                 object $storableBlock,
                                 BlockTypeInterface $blockType,
                                 Injector $di): void {
        if (!ArrayUtils::findByKey($storableBlock->propsData, "__cachedInlineSvg", "key")?->value)
            $di->execute([$this, "doPerformBeforeSave"], [
                ":storableBlock" => $storableBlock,
            ]);
    }
    /**
     * @psalm-param RawStorableBlock $storableBlock
     * @param \SitePlugins\JetIcons\TablerIconPack $icons
     */
    public function doPerformBeforeSave(object $storableBlock,
                                        TablerIconPack $icons): void {
        $iconId = ArrayUtils::findByKey($storableBlock->propsData, "iconId", "key")->value;
        $storableBlock->propsData[] = (object) [
            "key" => "__cachedInlineSvg",
            "value" => $icons->getSingle($iconId, "")
        ];
    }
    /**
     * @inheritdoc
     */
    public function onBeforeRender(Block $block,
                                   BlockTypeInterface $blockType,
                                   Injector $di): void {
        // todo add __cachedInlineSvg if missing (/blocks/render)
    }
}
