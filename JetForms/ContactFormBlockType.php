<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Sivujetti\BlockType\{BlockTypeInterface, PropertiesBuilder};

final class ContactFormBlockType implements BlockTypeInterface {
    public const NAME = "JetFormsContactForm";
    /**
     * @inheritdoc
     */
    public function defineProperties(PropertiesBuilder $builder): \ArrayObject {
        return $builder
            ->newProperty("fields", $builder::DATA_TYPE_TEXT)
            ->newProperty("behaviours", $builder::DATA_TYPE_TEXT)
            ->getResult();
    }
}
