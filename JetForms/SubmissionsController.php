<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Pike\{ArrayUtils, PikeException, Request, Response, Validation};
use SitePlugins\JetForms\Internal\{SendMailBehaviour, StoreSubmissionToLocalDbBehaviour};
use Sivujetti\{App, SharedAPIContext};
use Sivujetti\Block\BlockTree;
use Sivujetti\Page\PagesRepository2;

/**
 * Contains handlers for "/plugins/jet-forms/submissions/*".
 *
 * @psalm-import-type InputMeta from \SitePlugins\JetForms\BehaviourExecutorInterface
 * @psalm-import-type FormInputAnswer from \SitePlugins\JetForms\BehaviourExecutorInterface
 */
final class SubmissionsController {
    /**
     * POST /plugins/jet-forms/submissions/:blockId/:pageSlug: fetches $params->pageSlug
     * from the database, finds $foundPage->blocks->find($params->blockId) and runs
     * each behaviour configured to it ([{type: "SendMail", ...} ...]).
     *
     * @param \Pike\Request $req
     * @param \Pike\Response $res
     * @param \Sivujetti\SharedAPIContext $apiCtx
     * @param \Sitejetti\Page\PagesRepository2 $pagesRepo
     * @param string $errorLogFn = "error_log" Mainly for tests
     */
    public function handleSubmission(Request $req,
                                     Response $res,
                                     SharedAPIContext $apiCtx,
                                     PagesRepository2 $pagesRepo,
                                     string $errorLogFn = "error_log"): void {
        if (($errors = self::validateSubmissionInput($req->body)))
            throw new PikeException(implode("\n", $errors), PikeException::BAD_INPUT);
        //
        $pageSlug = $req->params->pageSlug !== "-" ? "/{$req->params->pageSlug}" : "/";
        $page = $pagesRepo->select(fields: ["@blocks"])
            ->where("slug = ?", $pageSlug)
            ->fetch();
        if (!$page) throw new PikeException("Invalid input (not such page)",
                                            PikeException::BAD_INPUT);
        //
        if (!($form = BlockTree::findBlockById($req->params->blockId, $page->blocks)))
            throw new PikeException("Invalid input (not such block)",
                                    PikeException::BAD_INPUT);
        if (!($form->behaviours = json_decode($form->behaviours, flags: JSON_THROW_ON_ERROR)))
            throw new PikeException("Nothing to process", PikeException::BAD_INPUT);
        //
        $meta = self::createInputsMeta($form);
        if (($errors = self::validateAnswers($req->body, $meta))) {
            $res->status(400)->plain(implode("\n", $errors));
            return;
        }
        $answers = self::createAnswers($meta, $req->body);
        //
        $clsStrings = self::createValidBehaviourClsStrings($form->behaviours, $apiCtx->getPlugin("JetForms"));
        for ($i = 0; $i < count($clsStrings); ++$i) {
            try {
                App::$adi->execute([$clsStrings[$i], "run"], [
                    $form->behaviours[$i]->data,
                    $req->body,
                    ["answers" => $answers, "inputsMeta" => $meta, "sentFromPage" => $pageSlug, "sentFromBlock" => $form->id],
                ]);
            } catch (\Exception $e) {
                call_user_func($errorLogFn, "JetForms: behaviour {$i} failed: " . self::formatError($e));
            }
        }
        //
        $res->redirect($req->body->_returnTo);
    }
    /**
     * @psalm-return array<int, InputMeta>
     */
    private static function createInputsMeta(object $form): array {
        $out = [];
        $inputs = [
            CheckboxInputBlockType::NAME,
            EmailInputBlockType::NAME,
            TextareaInputBlockType::NAME,
            TextInputBlockType::NAME,
        ];
        BlockTree::traverse($form->children, function ($block) use ($inputs, &$out) {
            $isSelect = $block->type === SelectInputBlockType::NAME;
            if ($isSelect || in_array($block->type, $inputs, true))
                $out[] = [
                    "type" => $block->type,
                    "name" => $block->name,
                    "label" => $block->label,
                    "placeholder" => $block->placeholder ?? "",
                    "isRequired" => ($block->isRequired ?? null) === 1,
                    "details" => !$isSelect ? [] : [
                        "options" => json_decode($block->options,
                                                 associative: true,
                                                 flags: JSON_THROW_ON_ERROR),
                        "multiple" => $block->multiple === 1,
                    ]
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
        return array_map(function (array $meta) use ($reqBody) {
            $label = "";
            if (strlen($meta["label"])) $label = $meta["label"];
            else if (strlen($meta["placeholder"])) $label = $meta["placeholder"];
            else $label = $meta["name"];
            return ["label" => $label, "value" => self::getResultSingle($meta, $reqBody)];
        }, $inputsMeta);
    }
    /**
     * @psalm-param InputMeta $meta
     * @param object $reqBody
     * @return string
     */
    private static function getResultSingle(array $meta, object $reqBody): string {
        ["name" => $name, "type" => $type] = $meta;
        //
        if ($type === CheckboxInputBlockType::NAME)
            return property_exists($reqBody, $name) ? "Checked" : "Not checked";
        //
        if ($type === SelectInputBlockType::NAME) {
            $opts = $meta["details"]["options"];
            if (!$meta["details"]["multiple"]) {
                $selected = $reqBody->{$name} ?? "-";
                return $selected !== "-" ? ArrayUtils::findByKey($opts, $selected, "value")["text"] : "-";
            }
            //
            $selected = $reqBody->{$name} ?? [];
            return implode("\n", array_map(fn($opt) =>
                "[" . (in_array($opt["value"], $selected, true) ? "x" : " ") . "] {$opt["text"]}"
            , $opts));
        }
        return ($reqBody->{$name} ?? "") ?: "- None provided";
    }
    /**
     * @param array $block->behaviours
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
     * @param object $input
     * @return string[] Error messages or []
     */
    private static function validateSubmissionInput(object $input): array {
        return Validation::makeObjectValidator()
            ->rule("_returnTo", "type", "string")
            ->rule("_returnTo", "maxLength", 512)
            ->validate($input);
    }
    /**
     * @param \Exception $e
     * @return string
     */
    private static function formatError(\Exception $e): string {
        return "<<error_start>>\n" .
            "At `{$e->getFile()}` line {$e->getLine()}\n" .
            "-- Message ---\n" .
            "{$e->getMessage()}\n" .
            "-- Trace ---\n" .
            "{$e->getTraceAsString()}\n" .
        "<<error_end>>";
    }
}
