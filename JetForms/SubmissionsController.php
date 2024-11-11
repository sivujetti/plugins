<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Pike\{ArrayUtils, PikeException, Request, Response, Validation};
use Pike\Auth\Crypto;
use SitePlugins\JetForms\Internal\{SendMailBehaviour, ShowSentMessageBehaviour,
                                    StoreSubmissionToLocalDbBehaviour};
use Sivujetti\{AppEnv, LogUtils, SharedAPIContext};
use Sivujetti\Auth\ACL;
use Sivujetti\Block\BlockTree;
use Sivujetti\GlobalBlockTree\GlobalBlockTreesRepository2;
use Sivujetti\Page\PagesRepository2;

/**
 * Contains handlers for "/plugins/jet-forms/submissions/*".
 *
 * @psalm-import-type InputMeta from \SitePlugins\JetForms\BehaviourExecutorInterface
 * @psalm-import-type FormInputAnswer from \SitePlugins\JetForms\BehaviourExecutorInterface
 */
final class SubmissionsController {
    private const NO_ANSWER = "- None provided";
    /**
     * POST /plugins/jet-forms/submissions/:blockId/:pageSlug/:isPartOfTreeId: fetches $params->pageSlug
     * from the database, finds $foundPage->blocks->find($params->blockId) and runs
     * each behaviour configured to it ([{type: "SendMail", ...} ...]).
     *
     * @param \Pike\Request $req
     * @param \Pike\Response $res
     * @param \Sivujetti\SharedAPIContext $apiCtx
     * @param \Sitejetti\Page\PagesRepository2 $pagesRepo
     * @param \Sivujetti\GlobalBlockTree\GlobalBlockTreesRepository2 $gbtRepo
     * @param \Sivujetti\AppEnv $appEnv
     */
    public function handleSubmission(Request $req,
                                     Response $res,
                                     SharedAPIContext $apiCtx,
                                     PagesRepository2 $pagesRepo,
                                     GlobalBlockTreesRepository2 $gbtRepo,
                                     AppEnv $appEnv): void {
        if (($errors = self::validateSubmissionInput($req->body)))
            throw new PikeException(implode("\n", $errors), PikeException::BAD_INPUT);
        //
        $pageSlug = $req->params->pageSlug !== "-" ? "/{$req->params->pageSlug}" : "/";
        $page = $pagesRepo->select(fields: ["@blocks"])
            ->where("slug = ?", $pageSlug)
            ->fetch();
        if (!$page) throw new PikeException("Invalid input (no such page)",
                                            PikeException::BAD_INPUT);
        //
        $trid = $req->params->isPartOfTreeId;
        [$form, $tree] = $trid === "main"
            ? [BlockTree::findBlockById($req->params->blockId, $page->blocks),
                (object) ["id" => $trid, "name" => "Main"]]
            : self::findFormFromGbt($req->params->blockId, $trid, $gbtRepo);
        if (!$form)
            throw new PikeException("Invalid input (no such block)",
                                    PikeException::BAD_INPUT);
        if (!$form->behaviours)
            throw new PikeException("Nothing to process", PikeException::BAD_INPUT);
        //
        if (($form->captchaToUse ?? null)) {
            /** @var \SitePlugins\JetForms\JetForms */
            $jetForms = $apiCtx->getPlugin("JetForms");
            $instance = $jetForms->getCaptchaImpl($form->captchaToUse);
            $isValid = false;
            try {
                [$isValid, $details] = $instance->validateResponseToken($req->body->captchaClientResponseToken ?? null, $req);
            } catch (\Exception $e) {
                $error = "Error: uncaught exception in captcha verification: " . LogUtils::formatError($e);
                (JetForms::$logFn ?? fn($err) => error_log($err))($error);
            }
            if (!$isValid) {
                $res->status(400)->plain("Captcha ({$form->captchaToUse}) verification failed" . (isset($details) ? ": {$details}" : "") . ".");
                return;
            }
        }
        //
        $meta = self::createInputsMeta($form);
        if (($errors = self::validateAnswers($req->body, $meta))) {
            $res->status(400)->plain(implode("\n", $errors));
            return;
        }
        $answers = self::createAnswers($meta, $req->body);
        //
        $clsStrings = self::createValidBehaviourClsStrings($form->behaviours, $apiCtx->getPlugin("JetForms"));
        $results = [];
        $reqUserRole = $req->myData->user?->role ?? null;
        $pushErrors = is_int($reqUserRole) && $reqUserRole <= ACL::ROLE_AUTHOR;
        for ($i = 0; $i < count($clsStrings); ++$i) {
            try {
                $result = $appEnv->di->execute([$clsStrings[$i], "run"], [
                    $form->behaviours[$i]->data,
                    $req->body,
                    $res,
                    ["answers" => $answers, "inputsMeta" => $meta, "sentFromPage" => $pageSlug,
                        "sentFromBlock" => $form->id, "sentFromTree" => $tree],
                    $results,
                ]);
                $results[] = $result;
            } catch (\Exception $e) {
                $error = "Error: behaviour {$i} failed: " . LogUtils::formatError($e);
                (JetForms::$logFn ?? fn($err) => error_log($err))($error);
                if ($pushErrors) $results[] = $error;
            }
        }
        //
        if (defined("JET_FORMS_NO_FEAT_1"))
            $res->redirect($req->body->_returnTo);
        // else Do nothing (redirection has been handled by ShowSentMessageBehaviour)
    }
    /**
     * GET /plugins/jet-forms/submissions: lists all submissions stored to the local
     * database.
     *
     * @param \Pike\Response $res
     * @param \SitePlugins\JetForms\Internal\StoreSubmissionToLocalDbBehaviour $submissionsRepo
     */
    public function listSubmissions(Response $res, StoreSubmissionToLocalDbBehaviour $submissionsRepo): void {
        $subs = $submissionsRepo->getSubmissions();
        $res->json($subs);
    }
    /**
     * POST /plugins/jet-forms/submit-tokens/generate: Creates a token
     * (<form><input name="captchaClientResponseToken">) that will be validated
     * in $this->handleSubmission().
     *
     * @param \Pike\Request $req
     * @param \Pike\Response $res
     * @param \Pike\Auth\Crypto $crypto
     */
    public function generateJetCaptchaToken(Request $req,
                                            Response $res,
                                            Crypto $crypto): void {
        $payload = time() . "|" . $req->attr("REMOTE_ADDR");
        $key = ContactFormBlockType::getSecret();
        $encrypted = $crypto->encrypt($payload, $key);
        $res->json(["token" => $encrypted]);
    }
    /**
     * @param string $blockId
     * @param string $globalBlockTreeId
     * @param \Sivujetti\GlobalBlockTree\GlobalBlockTreesRepository2 $gbtRepo
     * @return array{0: \Sivujetti\Block\Entities\Block|null, 1: array<int, \Sivujetti\Block\Entities\Block>|null}
     */
    private static function findFormFromGbt(string $blockId,
                                            string $globalBlockTreeId,
                                            GlobalBlockTreesRepository2 $gbtRepo): array {
        $gbt = $gbtRepo->select()->where("id = ?", [$globalBlockTreeId])->fetch();
        return $gbt
            ? [BlockTree::findBlockById($blockId, $gbt->blocks), (object) ["id" => $gbt->id, "name" => $gbt->name]]
            : [null, null];
    }
    /**
     * @psalm-return array<int, InputMeta>
     */
    private static function createInputsMeta(object $form): array {
        $out = [];
        $inputs = [
            CheckboxInputBlockType::NAME,
            EmailInputBlockType::NAME,
            NumberInputBlockType::NAME,
            RadioGroupInputBlockType::NAME,
            SelectInputBlockType::NAME,
            TextareaInputBlockType::NAME,
            TextInputBlockType::NAME,
        ];
        BlockTree::traverse($form->children, function ($block) use ($inputs, &$out) {
            if (in_array($block->type, $inputs, true))
                $out[] = [
                    "type" => $block->type,
                    "name" => $block->name,
                    "label" => $block->label,
                    "placeholder" => $block->placeholder ?? "",
                    "isRequired" => ($block->isRequired ?? null) === 1,
                    "details" => match ($block->type) {
                        RadioGroupInputBlockType::NAME => [
                            "radios" => $block->radios,
                        ],
                        SelectInputBlockType::NAME => [
                            "options" => $block->options,
                            "multiple" => $block->multiple === 1,
                        ],
                        default =>  [],
                    }
                ];
        });
        return $out;
    }
    /**
     * @psalm-param array<int, InputMeta> $inputsMeta
     * @param object $reqBody
     * @psalm-return array<int, FormInputAnswer>
     */
    private static function createAnswers(array $inputsMeta, object $reqBody): array {
        $out = [];
        foreach ($inputsMeta as $meta) {
            $label = $meta["label"] ?: $meta["placeholder"] ?: $meta["name"];
            $out[$label] = [
                "label" => $label,
                "answer" => self::getAnswerSingle($meta, $reqBody)
            ];
        }
        return array_values($out);
    }
    /**
     * @psalm-param InputMeta $meta
     * @param object $reqBody
     * @return string|array
     */
    private static function getAnswerSingle(array $meta, object $reqBody): string|array {
        ["name" => $name, "type" => $type] = $meta;

        if ($type === CheckboxInputBlockType::NAME)
            return property_exists($reqBody, $name) ? "Checked" : "Not checked";

        if ($type === RadioGroupInputBlockType::NAME) {
            $selected = $reqBody->{$name} ?? null;
            return ["type" => "singleSelect", "entries" => array_map(fn($opt) =>
                ["text" => $opt->text, "isSelected" => $opt->value === $selected]
            , $meta["details"]["radios"])];
        }

        if ($type === SelectInputBlockType::NAME) {
            $selectInputDetails = $meta["details"];
            $opts = $selectInputDetails["options"];
            //
            if (!$selectInputDetails["multiple"]) {
                $selected = $reqBody->{$name} ?? "-";
                return $selected !== "-" ? ArrayUtils::findByKey($opts, $selected, "value")->text : "-";
            }
            //
            $selected = $reqBody->{$name} ?? [];
            return ["type" => "multiSelect", "entries" => array_map(fn($opt) =>
                ["text" => $opt->text, "isSelected" => in_array($opt->value, $selected, true)]
            , $opts)];
        }

        return ($reqBody->{$name} ?? "") ?: self::NO_ANSWER;
    }
    /**
     * @param array $behaviours $block->behaviours
     * @param \SitePlugins\JetForms\JetForms $plugin
     * @return class-string[]
     * @throws \Pike\PikeException
     */
    private static function createValidBehaviourClsStrings(array $behaviours, JetForms $plugin): array {
        return array_map(function (object $behaviour) use ($plugin) {
            $ClassString = match ($behaviour->name) {
                // Default executors
                "SendMail" => SendMailBehaviour::class,
                "StoreSubmissionToLocalDb" => StoreSubmissionToLocalDbBehaviour::class,
                "NotifyUser" => "todo",
                "ShowSentMessage" => ShowSentMessageBehaviour::class,
                // User-defined executors
                default => $plugin->getBehaviourExecutor($behaviour->name),
            };
            if (!$ClassString)
                throw new PikeException("No executor found for behaviour `{$behaviour->name}`",
                                        PikeException::BAD_INPUT);
            return $ClassString;
        }, $behaviours);
    }
    /**
     * @param object $reqBody
     * @psalm-param array<int, InputMeta> $inputsMeta
     * @return string[] A list of error messages or []
     */
    private static function validateAnswers(object $reqBody, array $inputsMeta): array {
        $v = Validation::makeObjectValidator();
        foreach ($inputsMeta as $meta) {
            if ($meta["type"] === CheckboxInputBlockType::NAME) {
                if ($meta["isRequired"]) $v->rule($meta["name"], "in", ["on"]);
                continue;
            }
            $isSelect = $meta["type"] === SelectInputBlockType::NAME;
            if ($isSelect || $meta["type"] === RadioGroupInputBlockType::NAME) {
                $defs = $meta["details"][$isSelect ? "options" : "radios"]; // array<int, {text: string, value: string}>
                $validValues = [...array_map(fn($d) => $d->value, $defs), "-"];
                if (!$isSelect || !$meta["details"]["multiple"]) {
                    $propPath = $meta["name"] . (!$isSelect && !$meta["isRequired"] ? "?" : "");
                    $v->rule($propPath, "in", $validValues);
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
     * @param object $input
     * @return string[] Error messages or []
     */
    private static function validateSubmissionInput(object $input): array {
        return Validation::makeObjectValidator()
            ->rule("_returnTo", "type", "string")
            ->rule("_returnTo", "maxLength", 512)
            ->validate($input);
    }
}
