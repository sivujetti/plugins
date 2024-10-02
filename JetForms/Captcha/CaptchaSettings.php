<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Captcha;

use Pike\ArrayUtils;

/**
 * @psalm-import-type JetFormsCaptchaSettings from \SitePlugins\JetForms\JetForms
 */
class CaptchaSettings extends \stdClass {
    /**
     * @var \Closure $fetchData
     * @psalm-var \Closure():JetFormsCaptchaSettings|null $fetchData
     */
    protected \Closure $fetchData;
    /**
     * @var ?array
     * @psalm-var ?JetFormsCaptchaSettings
     */
    protected ?array $data = null;
    /**
     * @param \Closure $fetchData
     * @psalm-param \Closure():JetFormsCaptchaSettings|null $fetchData
     */
    public function __construct(\Closure $fetchData) {
        $this->fetchData = $fetchData;
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
     * @return array|null
     * @psalm-return JetFormsCaptchaSettings|null
     */
    private function getData(): array {
        if ($this->data === null) $this->data = $this->fetchData->__invoke();
        return $this->data;
    }
}
