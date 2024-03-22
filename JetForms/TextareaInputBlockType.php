<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Sivujetti\BlockType\{PropertiesBuilder};

final class TextareaInputBlockType extends InputBlockType {
    public const NAME = "JetFormsTextareaInput";
    /**
     * @inheritdoc
     */
    protected function addDefaultProperties(PropertiesBuilder $to): PropertiesBuilder {
        return parent::addDefaultProperties($to)
            ->newProperty("numRows", $to::DATA_TYPE_UINT);
    }
    /**
     * @inheritdoc
     */
    protected function getSettings(): array {
        return ["inputType" => "textarea"];
    }
}
