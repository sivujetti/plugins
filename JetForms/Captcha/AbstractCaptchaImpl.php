<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Captcha;

use Pike\Request;

/**
 * @psalm-import-type VNode from Sivujetti\BlockType\JsxLikeRenderingBlockTypeInterface
 */
abstract class AbstractCaptchaImpl {
    /** @var \SitePlugins\JetForms\Captcha\CaptchaSettings */
    protected CaptchaSettings $settings;
    /**
     * @var \Closure
     * @psalm-var \Closure(string):void
     */
    protected \Closure $logFn;
    /**
     * @inheritdoc
     */
    public function __construct(CaptchaSettings $settings) {
        $this->settings = $settings;
        $this->setLogFn(\error_log(...));
    }
    /**
     * @param \Closure $logFn
     * @psalm-param \Closure(string):void $logFn
     */
    public function setLogFn(\Closure $logFn) {
        $this->logFn = $logFn;
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
    /**
     * @param string $debugError
     * @param bool $withStatus
     * @return array [bool, string|null]
     * @psalm-return array{0: bool, 1: string|null}
     */
    protected function logAndReturnWith(string $debugError, bool $withStatus): array {
        $this->logFn->__invoke($debugError);
        return [$withStatus, null];
    }
}
