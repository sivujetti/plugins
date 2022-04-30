<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Pike\{PikeException, Request, Response, Validation};
use SitePlugins\JetForms\Internal\SendMailBehaviour;
use Sivujetti\{App, PagesRepositoryTemp, SharedAPIContext};
use Sivujetti\Block\BlockTree;
use Sivujetti\Block\Entities\Block;

/**
 * Contains handlers for "/plugins/jet-forms/submits/*".
 */
final class SubmitsController {
    /**
     * POST /plugins/jet-forms/submits/:blockId/:pageSlug: fetches $params->pageSlug
     * from the database, finds $foundPage->blocks->find($params->blockId) and runs
     * each behaviour configured to it ([{type: "SendMail", ...}] by default).
     *
     * @param \Pike\Request $req
     * @param \Pike\Response $res
     * @param \Sivujetti\SharedAPIContext $apiCtx
     * @param \Sitejetti\PagesRepositoryTemp $pagesRepo
     */
    public function handleSubmit(Request $req,
                                 Response $res,
                                 SharedAPIContext $apiCtx,
                                 PagesRepositoryTemp $pagesRepo): void {
        if (($errors = self::validateSubmitInput($req->body)))
            throw new PikeException(implode("\n", $errors), PikeException::BAD_INPUT);
        //
        $page = $pagesRepo->fetch()
            ->where("slug = ?", "/{$req->params->pageSlug}")
            ->fetch();
        if (!$page) throw new PikeException("Invalid input (not such page)",
                                            PikeException::BAD_INPUT);
        //
        if (!($form = BlockTree::findBlockById($req->params->blockId, $page->blocks)))
            throw new PikeException("Invalid input (not such block)",
                                    PikeException::BAD_INPUT);
        if (!($form->behaviours = json_decode($form->behaviours, flags: JSON_THROW_ON_ERROR)))
            throw new PikeException("Nothing to process", PikeException::BAD_INPUT);
        $clsStrings = self::createValidBehaviourClsStrings($form, $apiCtx->getPlugin("JetForms"));
        $details = self::createFormInputDetails($form);
        //
        for ($i = 0; $i < count($clsStrings); ++$i)
            // @allow \Pike\PikeException
            $errors = App::$adi->execute([$clsStrings[$i], "run"], [
                $form->behaviours[$i]->data,
                $req->body,
                $details,
            ]);
        //
        if ($errors) $errors = array_map("urlencode", $errors);
        $asJson = $errors ? json_encode($errors, JSON_UNESCAPED_UNICODE) : null;
        $res->redirect($req->body->_returnTo . ($asJson ? "&errors={$asJson}" : ""));
    }
    /**
     * @return array<int, array{type: string, name: string, label: string, isRequired: bool}>
    */
    private static function createFormInputDetails(object $form): array {
        $out = [];
        $normalInputs = [
            CheckboxInputBlockType::NAME,
            EmailInputBlockType::NAME,
            TextareaInputBlockType::NAME,
            TextInputBlockType::NAME,
        ];
        BlockTree::traverse($form->children, function ($block) use ($normalInputs, &$out) {
            if (in_array($block->type, $normalInputs, true))
                $out[] = [
                    "type" => $block->type,
                    "name" => $block->name,
                    "label" => $block->label,
                    "isRequired" => ($block->isRequired ?? null) === 1,
                ];
        });
        return $out;
    }
    /**
     * @param \Sivujetti\Block\Entities\Block $block Form block from db
     * @param \SitePlugins\JetForms\JetForms $plugin
     * @return class-string[]
     * @throws \Pike\PikeException
     */
    private static function createValidBehaviourClsStrings(Block $form, JetForms $plugin): array {
        return array_map(function (object $behaviour) use ($plugin) {
            $ClassString = match ($behaviour->name) {
                // Default executors
                "SendMail" => SendMailBehaviour::class,
                "NotifyUser" => "todo",
                // User-defined executors
                default => $plugin->getBehaviourExecutor($behaviour->name),
            };
            if (!$ClassString)
                throw new PikeException("No executor found for behaviour `{$behaviour->name}`",
                                        PikeException::BAD_INPUT);
            return $ClassString;
        }, $form->behaviours);
    }
    /**
     * @access private
     */
    private static function validateSubmitInput(object $input): array {
        return Validation::makeObjectValidator()
            ->rule("_returnTo", "type", "string")
            ->rule("_returnTo", "maxLength", 512)
            ->validate($input);
    }
}
