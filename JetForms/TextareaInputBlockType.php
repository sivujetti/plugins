<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Sivujetti\BlockType\{BlockTypeInterface, PropertiesBuilder};

final class TextareaInputBlockType implements BlockTypeInterface {
    public const NAME = "JetFormsTextareaInput";
    public const DEFAULT_RENDERER = InputBlockType::DEFAULT_RENDERER;
    /**
     * @inheritdoc
     */
    public function defineProperties(PropertiesBuilder $builder): \ArrayObject {
        return InputBlockType::addDefaultProperties($builder)
            ->newProperty("numRows", $builder::DATA_TYPE_UINT)
            ->getResult();
    }
}
