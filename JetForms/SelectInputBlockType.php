<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Sivujetti\BlockType\{BlockTypeInterface, PropertiesBuilder};
use Sivujetti\ValidationUtils;

final class SelectInputBlockType implements BlockTypeInterface {
    public const NAME = "JetFormsSelectInput";
    public const DEFAULT_RENDERER = "plugins/JetForms:block-input-select";
    /**
     * @inheritdoc
     */
    public function defineProperties(PropertiesBuilder $builder): \ArrayObject {
        return $builder
            ->newProperty("name", $builder::DATA_TYPE_TEXT)
            ->newProperty("label", $builder::DATA_TYPE_TEXT)
            ->newProperty("options")->dataType($builder::DATA_TYPE_TEXT, validationRules: [
                ["maxLength", ValidationUtils::HARD_LONG_TEXT_MAX_LEN]
            ])
            ->newProperty("multiple", $builder::DATA_TYPE_UINT)
            ->getResult();
    }
}
