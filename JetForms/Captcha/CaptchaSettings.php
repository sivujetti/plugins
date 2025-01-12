<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Captcha;

use Pike\ArrayUtils;

/**
 * @phpstan-import-type JetFormsCaptchaSettings from \SitePlugins\JetForms\JetForms
 */
class CaptchaSettings extends \stdClass {
    /**
     * @var \Closure():JetFormsCaptchaSettings $getDataFn
     */
    protected \Closure $getDataFn;
    /**
     * @var ?JetFormsCaptchaSettings
     */
    protected ?array $data = null;
    /**
     * @param \Closure():JetFormsCaptchaSettings $getDataFn
     */
    public function __construct(\Closure $getDataFn) {
        $this->getDataFn = $getDataFn;
    }
    /**
     * @param string $forCaptcha Example "grecaptcha"
     */
    public function findSettings(string $forCaptcha): ?array {
        $data = $this->getData();
        return $data
            ? ArrayUtils::findByKey($data["settings"], $forCaptcha, "name")
            : null;
    }
    /**
     * @return JetFormsCaptchaSettings
     */
    private function getData(): array {
        if ($this->data === null) $this->data = $this->getDataFn->__invoke();
        return $this->data;
    }
}
