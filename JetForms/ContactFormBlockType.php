<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Sivujetti\BlockType\{BlockTypeInterface, PropertiesBuilder};
use Sivujetti\ValidationUtils;

final class ContactFormBlockType implements BlockTypeInterface {
    public const NAME = "JetFormsContactForm";
    public const DEFAULT_RENDERER = "plugins/JetForms:block-contact-form";
    /**
     * @inheritdoc
     */
    public function defineProperties(PropertiesBuilder $builder): \ArrayObject {
        return $builder
            ->newProperty("behaviours")->dataType($builder::DATA_TYPE_TEXT, validationRules: [
                ["maxLength", ValidationUtils::HARD_LONG_TEXT_MAX_LEN]
            ])
            ->getResult();
    }
}
