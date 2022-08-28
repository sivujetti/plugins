<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Internal;

use Pike\{ArrayUtils, PhpMailerMailer, PikeException, Validation};
use Pike\Auth\Crypto;
use SitePlugins\JetForms\{BehaviourExecutorInterface, CheckboxInputBlockType, JetForms,
                            SelectInputBlockType, SettingsController};
use Sivujetti\SharedAPIContext;
use Sivujetti\StoredObjects\StoredObjectsRepository;
use Sivujetti\TheWebsite\Entities\TheWebsite;

/**
 * Validates and runs a {type: "SendMail" ...} behaviour.
 *
 * @psalm-import-type JetFormsMailSendSettings from \SitePlugins\JetForms\JetForms
 * @psalm-import-type InputMeta from \SitePlugins\JetForms\BehaviourExecutorInterface
 */
final class SendMailBehaviour implements BehaviourExecutorInterface {
    /** @var \Pike\PhpMailerMailer */
    private PhpMailerMailer $mailer;
    /** @var \Sivujetti\SharedAPIContext  */
    private SharedAPIContext $apiCtx;
    /** @var \Sivujetti\TheWebsite\Entities\TheWebsite */
    private TheWebsite $theWebsite;
    /** @var \Sivujetti\StoredObjects\StoredObjectsRepository */
    private StoredObjectsRepository $storedObjectsRepo;
    /** @var \Pike\Auth\Crypto */
    private Crypto $crypto;
    /**
     * @param \Pike\PhpMailerMailer $mailer 
     * @param \Sivujetti\SharedAPIContext $apiCtx
     * @param \Sivujetti\TheWebsite\Entities\TheWebsite $theWebsite
     * @param \Sivujetti\StoredObjects\StoredObjectsRepository $storedObjectsRepo
     * @param \Pike\Auth\Crypto $crypto
     */
    public function __construct(PhpMailerMailer $mailer,
                                SharedAPIContext $apiCtx,
                                TheWebsite $theWebsite,
                                StoredObjectsRepository $storedObjectsRepo,
                                Crypto $crypto) {
        $this->mailer = $mailer;
        $this->apiCtx = $apiCtx;
        $this->theWebsite = $theWebsite;
        $this->storedObjectsRepo = $storedObjectsRepo;
        $this->crypto = $crypto;
    }
    /**
     * @param object $behaviour Data from the database
     * @param object $reqBody Data from the form (plugins/JetForms/templates/block-contact-form.tmpl.php)
     * @throws \Pike\PikeException If $behaviours or $reqBody wasn't valid
     * @param array<int, InputMeta> $inputsMeta
     */
    public function run(object $behaviour, object $reqBody, array $inputsMeta): void {
        $errors = [];
        if (($errors = self::validateReqBodyForTemplate($reqBody, $inputsMeta)))
            throw new PikeException(implode("\n", $errors), PikeException::BAD_INPUT);
        //
        $vars = $this->makeTemplateVars($reqBody, $inputsMeta);
        $mailSettings = $this->getSendMailSettingsOrThrow();
        // @allow \Pike\PikeException, \PHPMailer\PHPMailer\Exception
        $this->mailer->sendMail((object) [
            "fromAddress" => $behaviour->fromAddress,
            "fromName" => is_string($behaviour->fromName ?? null) ? $behaviour->fromName : "",
            "toAddress" => $behaviour->toAddress,
            "toName" => is_string($behaviour->toName ?? null) ? $behaviour->toName : "",
            "subject" => self::renderTemplate($behaviour->subjectTemplate, $vars),
            "body" => self::renderTemplate($behaviour->bodyTemplate, $vars),
            "configureMailer" => function ($mailer) use ($mailSettings) {
                if ($mailSettings["sendingMethod"] === "mail") {
                    $mailer->isMail();
                } elseif ($mailSettings["sendingMethod"] === "smtp") {
                    $mailer->isSMTP();
                    $mailer->Host = $mailSettings["SMTP_host"];
                    $mailer->Port = $mailSettings["SMTP_port"];
                    $mailer->SMTPSecure = $mailSettings["SMTP_secureProtocol"];
                    $mailer->SMTPAuth = true;
                    $mailer->Username = $mailSettings["SMTP_username"];
                    $mailer->Password = $mailSettings["SMTP_password"];
                } else {
                    throw new PikeException("Should not happen", PikeException::BAD_INPUT);
                }
                // Allow each on(JetForms::ON_MAILER_CONFIGURE, fn) subscriber to modify $mailer
                $this->apiCtx->triggerEvent(JetForms::ON_MAILER_CONFIGURE, $mailer, $mailSettings);
            },
        ]);
    }
    /**
     * @param object $reqBody
     * @param array<int, InputMeta> $inputsMeta
     * @return string[] A list of error messages or []
     */
    private static function validateReqBodyForTemplate(object $reqBody, array $inputsMeta): array {
        $v = Validation::makeObjectValidator();
        foreach ($inputsMeta as $meta) {
            if ($meta["type"] === CheckboxInputBlockType::NAME)
                ; // ??
            elseif ($meta["type"] === SelectInputBlockType::NAME) {
                $validValues = array_merge(array_column($meta["details"]["options"], "value"), ["-"]);
                if (!$meta["details"]["multiple"]) {
                    $v->rule($meta["name"], "in", $validValues);
                } else {
                    $v->rule("{$meta["name"]}?", "type", "array");
                    $v->rule("{$meta["name"]}?.*", "in", $validValues);
                }
            } else {
                $propPath = $meta["name"] . ($meta["isRequired"] ? "" : "?");
                $v->rule($propPath, "type", "string");
                $v->rule($propPath, "maxLength", 6000);
            }
        }
        return $v->validate($reqBody);
    }
    /**
     * @psalm-return JetFormsMailSendSettings
     */
    private function getSendMailSettingsOrThrow(): array {
        $dataBag = $this->storedObjectsRepo->getEntry("JetForms:mailSendSettings");
        if (!$dataBag)
            throw new PikeException("", PikeException::ERROR_EXCEPTION);
        return SettingsController::withDecryptedValues($dataBag->data, $this->crypto);
    }
    /**
     * @param object $reqBody Validated form data
     * @param array<int, InputMeta> $inputsMeta
     * @return object
     */
    private function makeTemplateVars(object $reqBody, array $inputsMeta): object {
        $combined = (object) ["siteName" => $this->theWebsite->name];
        foreach ($inputsMeta as $meta) {
            ["name" => $name, "type" => $type] = $meta;
            if ($type === CheckboxInputBlockType::NAME) {
                $combined->{$name} = property_exists($reqBody, $name) ? "Checked" : "Not checked";
            } elseif ($type === SelectInputBlockType::NAME) {
                $opts = $meta["details"]["options"];
                if (!$meta["details"]["multiple"]) {
                    $selected = $reqBody->{$name} ?? "-";
                    $combined->{$name} = $selected !== "-" ? ArrayUtils::findByKey($opts, $selected, "value")["text"] : "-";
                } else {
                    $selected = $reqBody->{$name} ?? [];
                    $combined->{$name} = implode("\n", array_map(fn($opt) =>
                        "[" . (in_array($opt["value"], $selected, true) ? "x" : " ") . "] {$opt["text"]}"
                    , $opts));
                }
            } else {
                $combined->{$name} = $reqBody->{$name} ?? "- None provided";
            }
        }
        return $combined;
    }
    /**
     * @param string $tmpl The template defined by the site developer
     * @param object $vars see self::makeTemplateVars()
     * @return string
     */
    private static function renderTemplate(string $tmpl, object $vars): string {
        foreach ($vars as $key => $val)
            $tmpl = str_replace("[{$key}]", htmlentities($val), $tmpl);
        return $tmpl;
    }
}
