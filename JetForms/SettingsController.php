<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Pike\{ArrayUtils, Request, Response, Validation};
use Pike\Auth\Crypto;
use Sivujetti\{AppEnv, ValidationUtils};
use Sivujetti\StoredObjects\StoredObjectsRepository;

/**
 * Contains handlers for "/plugins/jet-forms/settings/*".
 *
 * @phpstan-import-type JetFormsMailSendSettings from \SitePlugins\JetForms\JetForms
 * @phpstan-import-type JetFormsCaptchaSettings from \SitePlugins\JetForms\JetForms
 */
final class SettingsController {
    /**
     * GET /plugins/jet-forms/settings/mailSendSettings: Returns mail send settings
     * stored to the database.
     *
     * @param \Pike\Response $res
     * @param \Sivujetti\StoredObjects\StoredObjectsRepository $storedObjectsRepo 
     * @param \Pike\Auth\Crypto $crypto
     * @param \Sivujetti\AppEnv $appEnv
     */
    public function getMailSendSettings(Response $res,
                                        StoredObjectsRepository $storedObjectsRepo,
                                        Crypto $crypto,
                                        AppEnv $appEnv): void {
        $entry = $storedObjectsRepo->find("JetForms:mailSendSettings")->fetch() ?? null;
        if (!$entry) {
            $res->status(404)->json(null);
            return;
        }
        $entry->data = self::withDecryptedValues($entry->data,
                                                 $crypto,
                                                 $appEnv->constants["SITE_SECRET"]);
        $res->json($entry->data);
    }
    /**
     * PUT /plugins/jet-forms/settings/mailSendSettings: Saves mail send settings
     * $req->body->* to the database.
     *
     * @param \Pike\Request $req
     * @param \Pike\Response $res
     * @param \Sivujetti\StoredObjects\StoredObjectsRepository $storage
     * @param \Pike\Auth\Crypto $crypto
     * @param \Sivujetti\AppEnv $appEnv
     */
    public function updateMailSendSettings(Request $req,
                                           Response $res,
                                           StoredObjectsRepository $storage,
                                           Crypto $crypto,
                                           AppEnv $appEnv): void {
        if (($errors = self::validateUpdateMailSendSettingsInput($req->body))) {
            $res->status(400)->json($errors);
            return;
        }
        $numRows = $storage->updateEntry("JetForms:mailSendSettings", [
            "sendingMethod" => $req->body->sendingMethod,
            "SMTP_host" => $req->body->SMTP_host ?? null,
            "SMTP_port" => $req->body->SMTP_port ?? null,
            "SMTP_username" => $req->body->SMTP_username ?? null,
            "SMTP_password" => $req->body->SMTP_password
                ? $crypto->encrypt($req->body->SMTP_password, $appEnv->constants["SITE_SECRET"])
                : null,
            "SMTP_secureProtocol" => $req->body->SMTP_secureProtocol ?? null,
        ])->execute();
        //
        $res->json((object) ["ok" => "ok", "numAffectedRows" => $numRows]);
    }
    /**
     * GET /plugins/jet-forms/settings/captchaData: Returns captcha settings
     * stored to the database.
     *
     * @param \Pike\Response $res
     * @param \Sivujetti\StoredObjects\StoredObjectsRepository $storedObjectsRepo 
     * @param \Pike\Auth\Crypto $crypto
     * @param \Sivujetti\AppEnv $appEnv
     */
    public function getCaptchaSettings(Response $res,
                                       StoredObjectsRepository $storedObjectsRepo,
                                       Crypto $crypto,
                                       AppEnv $appEnv): void {
        $entryData = $storedObjectsRepo->find("JetForms:captchaData")->fetch()?->data ?? [];
        if (!$entryData) {
            $res->json(null);
            return;
        }
        $entryData = self::withDecryptedValues($entryData,
                                               $crypto,
                                               $appEnv->constants["SITE_SECRET"]);
        $res->json($entryData);
    }
    /**
     * PUT /plugins/jet-forms/settings/captchaData: Saves captcha settings
     * $req->body->* to the database.
     *
     * @param \Pike\Request $req
     * @param \Pike\Response $res
     * @param \Sivujetti\StoredObjects\StoredObjectsRepository $storage
     * @param \Pike\Auth\Crypto $crypto
     * @param \Sivujetti\AppEnv $appEnv
     */
    public function updateCaptchaSettings(Request $req,
                                           Response $res,
                                           StoredObjectsRepository $storage,
                                           Crypto $crypto,
                                           AppEnv $appEnv): void {
        $data = $req->body;
        if (($errors = self::validateCaptchaSettingsInput($data))) {
            $res->status(400)->json($errors);
            return;
        }
        $numRows = $storage->updateEntry("JetForms:captchaData", ["settings" => [
            [
                "name" => "jet-captcha",
                "minFormFillTime" => $data->jetCaptcha->minFormFillTime,
            ],
            [
                "name" => "grecaptcha",
                ...($data->grecaptcha->siteKey
                    ? [
                        "siteKey" => $data->grecaptcha->siteKey,
                        "secretKey" => $crypto->encrypt($data->grecaptcha->secretKey, $appEnv->constants["SITE_SECRET"]),
                    ]
                    : [
                        "siteKey" => "",
                        "secretKey" => "",
                    ]),
                "minScore" => $data->grecaptcha->minScore,
            ],
        ]])->execute();
        //
        $res->json((object) ["ok" => "ok", "numAffectedRows" => $numRows]);
    }
    /**
     * @param JetFormsMailSendSettings|JetFormsCaptchaSettings|object $settings
     * @param \Pike\Auth\Crypto $crypto
     * @param ?string $secret = null
     * @return JetFormsMailSendSettings|JetFormsCaptchaSettings|object
     */
    public static function withDecryptedValues(array $settings,
                                               Crypto $crypto,
                                               #[\SensitiveParameter]
                                               ?string $secret = null): array {
        // Mail send settings
        if (($settings["sendingMethod"] ?? null) === "smtp") {
            $secret ??= self::getSiteSecret();
            $settings["SMTP_password"] = $crypto->decrypt($settings["SMTP_password"], $secret);

        // Captcha settings
        } elseif (
            ($arr = $settings["settings"] ?? null) &&
            is_array($arr) &&
            ($idx = ArrayUtils::findIndexByKey($arr, "grecaptcha", "name")) > -1 &&
            ($arr[$idx]["secretKey"] ?? "")
        ) {
            $secret ??= self::getSiteSecret();
            $settings["settings"][$idx]["secretKey"] = $crypto->decrypt($arr[$idx]["secretKey"], $secret);
        }

        return $settings;
    }
    /**
     * @param object $input
     * @return list<string> Error messages or []
     */
    private static function validateUpdateMailSendSettingsInput(object $input): array {
        return Validation::makeObjectValidator()
            ->rule("sendingMethod", "in", ["mail", "smtp"])
            ->rule("SMTP_host?", "type", "string")
            ->rule("SMTP_port?", "type", "string")
            ->rule("SMTP_username?", "type", "string")
            ->rule("SMTP_password?", "type", "string")
            ->rule("SMTP_secureProtocol?", "in", ["tls", "ssl"])
            ->validate($input);
    }
    /**
     * @param object $input
     * @return list<string> Error messages or []
     */
    private static function validateCaptchaSettingsInput(object $input): array {
        return Validation::makeObjectValidator()
            ->rule("jetCaptcha", "type", "object")
            ->rule("jetCaptcha.minFormFillTime", "type", "number")
            ->rule("grecaptcha", "type", "object")
            ->rule("grecaptcha.siteKey", "maxLength", ValidationUtils::HARD_SHORT_TEXT_MAX_LEN)
            ->rule("grecaptcha.secretKey", "maxLength", ValidationUtils::HARD_SHORT_TEXT_MAX_LEN)
            ->rule("grecaptcha.minScore", "type", "float")
            ->validate($input);
    }
    /**
     * @return string
     */
    private static function getSiteSecret(): string {
        $secret = (require SIVUJETTI_INDEX_PATH . "/config.php")["env"]["SITE_SECRET"];
        return $secret;
    }
}
