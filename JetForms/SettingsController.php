<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Pike\Auth\Crypto;

/**
 * @psalm-import-type JetFormsMailSendSettings from \SitePlugins\JetForms\JetForms
 */
final class SettingsController {
    /**
     * Mutates $mailSettings and returns it.
     *
     * @psalm-param JetFormsMailSendSettings
     * @param \Pike\Auth\Crypto $crypto
     * @psalm-return JetFormsMailSendSettings
     */
    public static function withDecryptedValues(array &$mailSettings, Crypto $crypto): array {
        if ($mailSettings["sendingMethod"] === "smtp")
            $mailSettings["SMTP_password"] = $crypto->decrypt($mailSettings["SMTP_password"], SIVUJETTI_SECRET);
        return $mailSettings;
    }
}
