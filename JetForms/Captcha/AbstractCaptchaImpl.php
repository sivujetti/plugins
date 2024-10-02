<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Captcha;

use Pike\Request;

/**
 * @psalm-import-type VNode from Sivujetti\BlockType\JsxLikeRenderingBlockTypeInterface
 */
abstract class AbstractCaptchaImpl {
    protected CaptchaSettings $settings;
    /**
     * @inheritdoc
     */
    public function __construct(CaptchaSettings $settings) {
        $this->settings = $settings;
    }
    /**
     * @return string[]
     */
    public abstract function enqueueableJsFiles(): array;
    /**
     * @param string|null $input
     * @param \Pike\Request $req 
     * @return array [bool, string|null]
     * @psalm-return array{0: bool, 1: string|null}
     */
    public abstract function validateResponseToken(?string $input, Request $req): array;
}
