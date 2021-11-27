<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Internal;

use Pike\{PhpMailerMailer, PikeException, Validation};
use SitePlugins\JetForms\JetForms;
use Sivujetti\SharedAPIContext;
use Sivujetti\TheWebsite\Entities\TheWebsite;

/**
 * Validates and runs a {type: "SendMail" ...} behaviour.
 */
final class SendMailBehaviour {
    /** @var \Pike\PhpMailerMailer */
    private PhpMailerMailer $mailer;
    /** @var \Sivujetti\SharedAPIContext  */
    private SharedAPIContext $storage;
    /** @var \Sivujetti\TheWebsite\Entities\TheWebsite */
    private TheWebsite $theWebsite;
    /**
     * @param \Pike\PhpMailerMailer $mailer 
     * @param \Sivujetti\SharedAPIContext $storage 
     * @param \Sivujetti\TheWebsite\Entities\TheWebsite $theWebsite
     */
    public function __construct(PhpMailerMailer $mailer,
                                SharedAPIContext $storage,
                                TheWebsite $theWebsite) {
        $this->mailer = $mailer;
        $this->storage = $storage;
        $this->theWebsite = $theWebsite;
    }
    /**
     * @param object $behaviour Data from the database
     * @param object $reqBody Data from the form (plugins/JetForms/templates/block-contact-form.tmpl.php)
     * @throws \Pike\PikeException If $behavious or $reqBody wasn't valid
     */
    public function run(object $behaviour, object $reqBody): void {
        $errors = [];
        if (($errors = self::validateBehaviour($behaviour)))
            throw new PikeException(implode("\n", $errors), PikeException::BAD_INPUT);
        //
        $errors2 = [];
        if (($errors2 = self::validateReqBodyForTemplate($reqBody)))
            throw new PikeException(implode("\n", $errors2), PikeException::BAD_INPUT);
        //
        $vars = $this->makeTemplateVars($reqBody);
        // @allow \Pike\PikeException, \PHPMailer\PHPMailer\Exception
        $this->mailer->sendMail((object) [
            "fromAddress" => $behaviour->fromAddress,
            "fromName" => is_string($behaviour->fromName ?? null) ? $behaviour->fromName : "",
            "toAddress" => $behaviour->toAddress,
            "toName" => is_string($behaviour->toName ?? null) ? $behaviour->toName : "",
            "subject" => self::renderTemplate($behaviour->subjectTemplate, $vars),
            "body" => self::renderTemplate($behaviour->bodyTemplate, $vars),
            "configureMailer" => function ($mailer) {
                // Allow each on(JetForms::ON_MAILER_CONFIGURE, fn) subscriber to modify $mailer
                $this->storage->triggerEvent(JetForms::ON_MAILER_CONFIGURE, $mailer);
            },
        ]);
    }
    /**
     * @param object $reqBody
     * @return string[] A list of error messages or []
     */
    private static function validateReqBodyForTemplate(object $reqBody): array {
        $unrolled = new \stdClass;
        $v = Validation::makeObjectValidator();
        $i = 0;
        foreach ($reqBody as $key => $val) {
            if ($key[0] === "_") continue;
            $unrolled->{"template-var-keys-#{$i}"} = $key;
            $unrolled->{"template-var-values-#{$i}"} = $val;
            $v->rule("template-var-keys-#{$i}", "identifier");
            $v->rule("template-var-values-#{$i}", "type", "string");
            $v->rule("template-var-values-#{$i}", "maxLength", 6000);
            ++$i;
        }
        return $i ? $v->validate($unrolled) : ["Form template must contain at least one input"];
    }
    /**
     * @param object $reqBody Validated form data
     * @return object
     */
    private function makeTemplateVars(object $reqBody): object {
        $combined = (object) [
            "siteName" => $this->theWebsite->name,
            "siteLang" => $this->theWebsite->lang,
        ];
        foreach ($reqBody as $key => $val) {
            if ($key[0] !== "_") $combined->{$key} = $val;
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
    /**
     * @param object $behaviourFromDb
     * @return string[] A list of error messages or []
     */
    private static function validateBehaviour(object $behaviourFromDb): array {
        return Validation::makeObjectValidator()
            ->rule("subjectTemplate", "type", "string")
            ->rule("subjectTemplate", "maxLength", 128)
            ->rule("bodyTemplate", "type", "string")
            ->rule("fromAddress", "type", "string")
            ->rule("fromName?", "type", "string")
            ->rule("toAddress", "type", "string")
            ->rule("toName?", "type", "string")
            ->validate($behaviourFromDb);
    }
}
