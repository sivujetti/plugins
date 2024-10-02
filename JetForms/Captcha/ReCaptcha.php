<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Captcha;

use Pike\Request;

class ReCaptcha extends AbstractCaptchaImpl {
    /**
     * @inheritdoc
     */
    public function enqueueableJsFiles(): array {
        return ["plugin-jet-forms-grecaptcha.js?site-key={$this->getSiteKey()}"];
    }
    /**
     * @inheritdoc
     */
    public function validateResponseToken(?string $input, Request $req): array {
        if (!is_string($input) || strlen($input) < 2) {
            \error_log("[Debug] `captchaClientResponseToken` not present");
            return [false, null];
        }
        // todo
        return [true, null];
    }
    /**
     * @return string
     */
    private function getSiteKey(): string {
        $arr = $this->settings->findSettings("grecaptcha") ?? [];
        return $arr["siteKey"] ?? "site-key-not-found";
    }
}
