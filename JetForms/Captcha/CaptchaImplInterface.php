<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Captcha;

/**
 * @psalm-import-type VNode from Sivujetti\BlockType\JsxLikeRenderingBlockTypeInterface
 */
interface CaptchaImplInterface {
    /**
     * @return array
     * @psalm-return VNode[]
     */
    public function render(): array;
    /**
     * @param string|null $input
     * @return array [bool, string|null]
     * @psalm-return array{0: bool, 1: string|null}
     */
    public function validateResponseToken(?string $input): array;
}
