<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

final class NumberInputBlockType extends InputBlockType {
    public const NAME = "JetFormsNumberInput";
    /**
     * @inheritdoc
     */
    protected function getSettings(): array {
        return [
            "inputType" => "text",
            "inputMode" => "numeric",
        ];
    }
}
