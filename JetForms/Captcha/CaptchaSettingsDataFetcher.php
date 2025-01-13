<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Captcha;

use Pike\Auth\Crypto;
use SitePlugins\JetForms\SettingsController;
use Sivujetti\AppEnv;
use Sivujetti\StoredObjects\StoredObjectsRepository;

/**
 * @phpstan-import-type JetFormsCaptchaSettings from \SitePlugins\JetForms\JetForms
 */
class CaptchaSettingsDataFetcher {
    private StoredObjectsRepository $objectsRepo;
    private Crypto $crypto;
    private AppEnv $appEnv;
    public function __construct(StoredObjectsRepository $objectsRepo, Crypto $crypto, AppEnv $appEnv) {
        $this->objectsRepo = $objectsRepo;
        $this->crypto = $crypto;
        $this->appEnv = $appEnv;
    }
    /**
     * @return JetFormsCaptchaSettings|null
     */
    public function getData(): array {
        $data = $this->objectsRepo
            ->find("JetForms:captchaData")
            ->fetch()?->data ?? [];
        return $data
            ? SettingsController::withDecryptedValues($data, $this->crypto, $this->appEnv->constants["SITE_SECRET"])
            : $data;
    }
}
