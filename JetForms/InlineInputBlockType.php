<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Sivujetti\BlockType\{BlockTypeInterface, PropertiesBuilder};

abstract class InlineInputBlockType implements BlockTypeInterface {
    public const NAME = "_";
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
}
