<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Pike\{Request, Response, Validation};
use Pike\Auth\Crypto;
use Sivujetti\StoredObjects\StoredObjectsRepository;

/**
 * Contains handlers for "/plugins/jet-forms/settings/mailSendSettings".
 *
 * @psalm-import-type JetFormsMailSendSettings from \SitePlugins\JetForms\JetForms
 */
final class SettingsController {
    /**
     * GET /plugins/jet-forms/settings/mailSendSettings: Returns mail send settings
     * stored to the database.
     *
     * @param \Pike\Response $res
     * @param \Sivujetti\StoredObjects\StoredObjectsRepository $storedObjectsRepo 
     * @param \Pike\Auth\Crypto $crypto
     */
    public function getMailSendSettings(Response $res,
                                        StoredObjectsRepository $storedObjectsRepo,
                                        Crypto $crypto): void {
        $entry = $storedObjectsRepo->getEntry("JetForms:mailSendSettings");
        if (!$entry) {
            $res->status(404)->json(null);
            return;
        }
        $entry->data = self::withDecryptedValues($entry->data, $crypto);
        $res->json($entry->data);
    }
    /**
     * PUT /plugins/jet-forms/settings/mailSendSettings: Returns mail send settings
     * stored to the database.
     *
     * @param \Pike\Request $req
     * @param \Pike\Response $res
     * @param \Sivujetti\StoredObjects\StoredObjectsRepository $storedObjectsRepo 
     * @param \Pike\Auth\Crypto $crypto
     */
    public function updateMailSendSettings(Request $req,
                                           Response $res,
                                           StoredObjectsRepository $storedObjectsRepo,
                                           Crypto $crypto): void {
        if (($errors = self::validateAsd($req->body))) {
            $res->status(400)->json($errors);
            return;
        }
        $numRows = $storedObjectsRepo->updateEntryData("JetForms:mailSendSettings", (object) [
            "sendingMethod" => $req->body->sendingMethod,
            "SMTP_host" => $req->body->SMTP_host ?? null,
            "SMTP_port" => $req->body->SMTP_port ?? null,
            "SMTP_username" => $req->body->SMTP_username ?? null,
            "SMTP_password" => $req->body->SMTP_password
                ? $crypto->encrypt($req->body->SMTP_password, SIVUJETTI_SECRET)
                : null,
            "SMTP_secureProtocol" => $req->body->SMTP_secureProtocol ?? null,
        ]);
        //
        $res->json((object) ["ok" => $numRows === 1 ? "ok" : "err"]);
    }
    /**
     * @param object $input
     * @return string[] Error messages or []
     */
    private static function validateAsd(object $input): array {
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
     * Mutates $mailSettings and returns it.
     *
     * @psalm-param JetFormsMailSendSettings &$mailSettings
     * @param \Pike\Auth\Crypto $crypto
     * @psalm-return JetFormsMailSendSettings
     */
    public static function withDecryptedValues(array &$mailSettings, Crypto $crypto): array {
        if ($mailSettings["sendingMethod"] === "smtp")
            $mailSettings["SMTP_password"] = $crypto->decrypt($mailSettings["SMTP_password"], SIVUJETTI_SECRET);
        return $mailSettings;
    }
}
