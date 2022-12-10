<?php declare(strict_types=1);

namespace SitePlugins\JetIcons;

use Pike\{ArrayUtils, Injector};
use Sivujetti\Auth\ACL;
use Sivujetti\BlockType\{BlockTypeInterface, PropertiesBuilder, SaveAwareBlockTypeInterface};

/**
 * @psalm-import-type RawStorableBlock from \Sivujetti\BlockType\SaveAwareBlockTypeInterface
 */
final class IconBlockType implements BlockTypeInterface, SaveAwareBlockTypeInterface {
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
