<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Sivujetti\BlockType\{BlockTypeInterface, PropertiesBuilder};

abstract class InputBlockType implements BlockTypeInterface {
    public const NAME = "_";
    public const DEFAULT_RENDERER = "plugins/JetForms:block-input-auto";
    /**
     * @inheritdoc
     */
    public function defineProperties(PropertiesBuilder $builder): \ArrayObject {
        return self::addDefaultProperties($builder)->getResult();
    }
    /**
     * @param \Sivujetti\BlockType\PropertiesBuilder $to
     * @return \Sivujetti\BlockType\PropertiesBuilder
     */
    public static function addDefaultProperties(PropertiesBuilder $to): PropertiesBuilder {
        return $to
            ->newProperty("name", $to::DATA_TYPE_TEXT)
            ->newProperty("isRequired", $to::DATA_TYPE_UINT)
            ->newProperty("label", $to::DATA_TYPE_TEXT)
            ->newProperty("placeholder", $to::DATA_TYPE_TEXT);
    }
}
