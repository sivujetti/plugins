<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Captcha;

class JetCaptcha implements CaptchaImplInterface {
    /**
     * @inheritdoc
     */
    public function render(): array {
        return []; // todo
    }
    /**
     * @inheritdoc
     */
    public function validateResponseToken(?string $input): array {
        return [true, null];
    }
}
