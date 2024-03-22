<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

final class TextInputBlockType extends InputBlockType {
    public const NAME = "JetFormsTextInput";
    /**
     * @inheritdoc
     */
    protected function getSettings(): array {
        return ["inputType" => "text"];
    }
}
