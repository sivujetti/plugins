<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

final class EmailInputBlockType extends InputBlockType {
    public const NAME = "JetFormsEmailInput";
    /**
     * @inheritdoc
     */
    protected function getSettings(): array {
        return ["inputType" => "email"];
    }
}
