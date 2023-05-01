<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Internal;

use Pike\{PhpMailerMailer, PikeException};
use Pike\Auth\Crypto;
use SitePlugins\JetForms\{BehaviourExecutorInterface, JetForms, SettingsController};
use Sivujetti\SharedAPIContext;
use Sivujetti\StoredObjects\StoredObjectsRepository;
use Sivujetti\TheWebsite\Entities\TheWebsite;

/**
 * Runs a {type: "SendMail" ...} behaviour.
 *
 * @psalm-import-type JetFormsMailSendSettings from \SitePlugins\JetForms\JetForms
 * @psalm-import-type FormInputAnswer from \SitePlugins\JetForms\BehaviourExecutorInterface
 * @psalm-import-type SubmissionInfo from \SitePlugins\JetForms\BehaviourExecutorInterface
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
     * @inheritdoc
     */
    public function run(object $behaviour, object $reqBody, array $submissionInfo): void {
        $vars = $this->makeTemplateVars();
        $mailSettings = $this->getSendMailSettingsOrThrow();
        // @allow \Pike\PikeException, \PHPMailer\PHPMailer\Exception
        $this->mailer->sendMail((object) [
            "fromAddress" => $behaviour->fromAddress,
            "fromName" => is_string($behaviour->fromName ?? null) ? $behaviour->fromName : "",
            "toAddress" => $behaviour->toAddress,
            "toName" => is_string($behaviour->toName ?? null) ? $behaviour->toName : "",
            "subject" => self::renderConstantTags($behaviour->subjectTemplate, $vars),
            "body" => self::renderDynamicTags(self::renderConstantTags($behaviour->bodyTemplate, $vars), $submissionInfo["answers"]),
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
     * @psalm-return JetFormsMailSendSettings
     */
    private function getSendMailSettingsOrThrow(): array {
        $dataBag = $this->storedObjectsRepo->find("JetForms:mailSendSettings")->fetch() ?? null;
        if (!$dataBag)
            throw new PikeException("JetForms:mailSendSettings missing", PikeException::ERROR_EXCEPTION);
        return SettingsController::withDecryptedValues($dataBag->data, $this->crypto);
    }
    /**
     * @return array{siteName: string}
     */
    private function makeTemplateVars(): array {
        return ["siteName" => $this->theWebsite->name];
    }
    /**
     * @param string $tmpl The template defined by the site developer
     * @param array{siteName: string} $vars see $this->makeTemplateVars()
     * @return string
     */
    private static function renderConstantTags(string $tmpl, array $vars): string {
        foreach ($vars as $key => $val)
            $tmpl = str_replace("[{$key}]", htmlentities($val), $tmpl);
        return $tmpl;
    }
    /**
     * @param string $tmpl The template defined by the site developer
     * @psalm-param array<int, FormInputAnswer> $answers
     * @return string
     */
    private static function renderDynamicTags(string $tmpl, array $answers): string {
        if (str_contains($tmpl, "[resultsAll]"))
            return str_replace("[resultsAll]", self::renderResultsAll($answers), $tmpl);
        return $tmpl;
    }
    /**
     * @psalm-param array<int, FormInputAnswer> $answers
     * @return string
     */
    private static function renderResultsAll(array $answers): string {
        return $answers
            ? implode("\n\n", array_map(function (array $ans) {
                $asString = null;
                if (is_string($ans["answer"]))
                    $asString = $ans["answer"];
                else {
                    [$a, $b, $c] = $ans["answer"]["type"] === "singleSelect"
                        ? ["(", "o", ")"]  // radio
                        : ["[", "x", "]"]; // select[multiple]
                    $asString = implode("\n", array_map(fn($itm) =>
                        $a . ($itm["isSelected"] ? $b : " ") . "{$c} {$itm["text"]}"
                    , $ans["answer"]["entries"]));
                }
                return "{$ans["label"]}:\n" . htmlentities($asString);
            }, $answers))
            : "-";
    }
}
