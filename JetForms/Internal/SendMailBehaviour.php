<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Internal;

use Pike\{PhpMailerMailer, PikeException, Validation};
use Pike\Auth\Crypto;
use SitePlugins\JetForms\{BehaviourExecutorInterface, CheckboxInputBlockType,
                          JetForms, SettingsController, SettingsStorage};
use Sivujetti\SharedAPIContext;
use Sivujetti\TheWebsite\Entities\TheWebsite;

/**
 * Validates and runs a {type: "SendMail" ...} behaviour.
 *
 * @psalm-import-type JetFormsMailSendSettings from \SitePlugins\JetForms\JetForms
 */
final class SendMailBehaviour implements BehaviourExecutorInterface {
    /** @var \Pike\PhpMailerMailer */
    private PhpMailerMailer $mailer;
    /** @var \Sivujetti\SharedAPIContext  */
    private SharedAPIContext $apiCtx;
    /** @var \Sivujetti\TheWebsite\Entities\TheWebsite */
    private TheWebsite $theWebsite;
    /** @var \Pike\Auth\Crypto*/
    private SettingsStorage $settingsRepo;
    /** @var \SitePlugins\JetForms\SettingsStorage */
    private Crypto $crypto;
    /**
     * @param \Pike\PhpMailerMailer $mailer 
     * @param \Sivujetti\SharedAPIContext $apiCtx
     * @param \Sivujetti\TheWebsite\Entities\TheWebsite $theWebsite
     * @param \Pike\Auth\Crypto $crypto
     * @param \SitePlugins\JetForms\SettingsStorage $settingsRepo
     */
    public function __construct(PhpMailerMailer $mailer,
                                SharedAPIContext $apiCtx,
                                TheWebsite $theWebsite,
                                Crypto $crypto,
                                SettingsStorage $settingsRepository) {
        $this->mailer = $mailer;
        $this->apiCtx = $apiCtx;
        $this->theWebsite = $theWebsite;
        $this->settingsRepo = $settingsRepository;
        $this->crypto = $crypto;
    }
    /**
     * @param object $behaviour Data from the database
     * @param object $reqBody Data from the form (plugins/JetForms/templates/block-contact-form.tmpl.php)
     * @throws \Pike\PikeException If $behavious or $reqBody wasn't valid
     * @param array<int, {type: string, name: string, label: string, isRequired: bool}> $inputDetails
     */
    public function run(object $behaviour, object $reqBody, array $inputDetails): void {
        $errors = [];
        if (($errors = self::validateReqBodyForTemplate($reqBody, $inputDetails)))
            throw new PikeException(implode("\n", $errors), PikeException::BAD_INPUT);
        //
        $vars = $this->makeTemplateVars($reqBody, $inputDetails);
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
     * @param array<int, {type: string, name: string, label: string, isRequired: bool}> $inputDetails
     * @return string[] A list of error messages or []
     */
    private static function validateReqBodyForTemplate(object $reqBody, array $inputDetails): array {
        $v = Validation::makeObjectValidator();
        foreach ($inputDetails as $details) {
            if ($details["type"] !== CheckboxInputBlockType::NAME) {
                $propPath = $details["name"] . ($details["isRequired"] ? "" : "?");
                $v->rule($propPath, "type", "string");
                $v->rule($propPath, "maxLength", 6000);
            } else
                ;
        }
        return $v->validate($reqBody);
    }
    /**
     * @psalm-return JetFormsMailSendSettings
     */
    private function getSendMailSettingsOrThrow(): array {
        $dataBag = $this->settingsRepo->getDataBag("jetFormsMailSendSettings");
        if (!$dataBag)
            throw new PikeException("", PikeException::ERROR_EXCEPTION);
        return SettingsController::withDecryptedValues($dataBag->data, $this->crypto);
    }
    /**
     * @param object $reqBody Validated form data
     * @param array<int, {type: string, name: string, label: string, isRequired: bool}> $inputDetails
     * @return object
     */
    private function makeTemplateVars(object $reqBody, array $inputDetails): object {
        $combined = (object) [
            "siteName" => $this->theWebsite->name,
            "siteLang" => $this->theWebsite->lang,
        ];
        foreach ($inputDetails as ["name" => $name, "type" => $type]) {
            if ($type === CheckboxInputBlockType::NAME) {
                $combined->{$name} = property_exists($reqBody, $name) ? "Checked" : "Not checked";
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
