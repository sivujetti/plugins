<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Pike\{ArrayUtils, PikeException, Request, Response, Validation};
use SitePlugins\JetForms\Internal\{SendMailBehaviour, StoreSubmissionToLocalDbBehaviour};
use Sivujetti\{App, JsonUtils, LogUtils, SharedAPIContext};
use Sivujetti\Block\BlockTree;
use Sivujetti\Block\Entities\Block;
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
     * @param string $errorLogFn = "error_log" Mainly for tests
     */
    public function handleSubmission(Request $req,
                                     Response $res,
                                     SharedAPIContext $apiCtx,
                                     PagesRepository2 $pagesRepo,
                                     GlobalBlockTreesRepository2 $gbtRepo,
                                     string $errorLogFn = "error_log"): void {
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
        $form = $trid === "main"
            ? BlockTree::findBlockById($req->params->blockId, $page->blocks)
            : self::findFormFromGbt($req->params->blockId, $trid, $gbtRepo);
        if (!$form)
            throw new PikeException("Invalid input (no such block)",
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
                call_user_func($errorLogFn, "JetForms: behaviour {$i} failed: " . LogUtils::formatError($e));
            }
        }
        //
        $res->redirect($req->body->_returnTo);
    }
    /**
     * @param string $blockId
     * @param string $globalBlockTreeId
     * @param \Sivujetti\GlobalBlockTree\GlobalBlockTreesRepository2 $gbtRepo
     * @return \Sivujetti\Block\Entities\Block|null
     */
    private static function findFormFromGbt(string $blockId,
                                            string $globalBlockTreeId,
                                            GlobalBlockTreesRepository2 $gbtRepo): ?Block {
        $gbt = $gbtRepo->select()->where("id = ?", [$globalBlockTreeId])->fetch();
        return $gbt ? BlockTree::findBlockById($blockId, $gbt->blocks) : null;
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
                            "radios" => JsonUtils::parse($block->radios, asObject: false),
                        ],
                        SelectInputBlockType::NAME => [
                            "options" => JsonUtils::parse($block->options, asObject: false),
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
            $label = "";
            if (strlen($meta["label"])) $label = $meta["label"];
            else if (strlen($meta["placeholder"])) $label = $meta["placeholder"];
            else $label = $meta["name"];
            //
            $out[$label] = ["label" => $label, "answer" => self::getAnswerSingle($meta, $reqBody)];
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
                ["text" => $opt["text"], "isSelected" => $opt["value"] === $selected]
            , $meta["details"]["radios"])];
        }

        if ($type === SelectInputBlockType::NAME) {
            $selectInputDetails = $meta["details"];
            $opts = $selectInputDetails["options"];
            //
            if (!$selectInputDetails["multiple"]) {
                $selected = $reqBody->{$name} ?? "-";
                return $selected !== "-" ? ArrayUtils::findByKey($opts, $selected, "value")["text"] : "-";
            }
            //
            $selected = $reqBody->{$name} ?? [];
            return ["type" => "multiSelect", "entries" => array_map(fn($opt) =>
                ["text" => $opt["text"], "isSelected" => in_array($opt["value"], $selected, true)]
            , $opts)];
        }

        return ($reqBody->{$name} ?? "") ?: self::NO_ANSWER;
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
                continue; // ??
            $isSelect = $meta["type"] === SelectInputBlockType::NAME;
            if ($isSelect || $meta["type"] === RadioGroupInputBlockType::NAME) {
                $k = $isSelect ? "options" : "radios";
                $validValues = array_merge(array_column($meta["details"][$k], "value"), ["-"]);
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
