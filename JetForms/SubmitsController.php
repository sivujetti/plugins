<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Envms\FluentPDO\Queries\Select;
use Pike\{CoolDb, PikeException, Request, Response, Validation};
use Pike\Interfaces\RowMapperInterface;
use SitePlugins\JetForms\Internal\SendMailBehaviour;
use Sivujetti\{App, SharedAPIContext};
use Sivujetti\Block\BlockTree;
use Sivujetti\Block\Entities\Block;
use Sivujetti\Page\Entities\Page;

/**
 * Contains handlers for "/plugins/jet-forms/submits/*".
 */
final class SubmitsController {
    /**
     * POST /plugins/jet-forms/submits/:blockId/:pageSlug: fetched $params->pageSlug
     * from the database, finds $foundPage->blocks->find($params->blockId) and runs
     * each behaviour configured to it ([{type: "SendMail", ...}] by default).
     *
     * @param \Pike\Request $req
     * @param \Pike\Response $res
     * @param \Sivujetti\SharedAPIContext $apiCtx
     * @param \SitePlugins\JetForms\PagesRepositoryTemp $pagesRepo
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
        //
        for ($i = 0; $i < count($clsStrings); ++$i)
            // @allow \Pike\PikeException
            $errors = App::$di->execute([$clsStrings[$i], "run"], [
                $form->behaviours[$i]->data,
                $req->body,
            ]);
        //
        if ($errors) $errors = array_map("urlencode", $errors);
        $asJson = $errors ? json_encode($errors, JSON_UNESCAPED_UNICODE) : null;
        $res->redirect($req->body->_returnTo . ($asJson ? "&errors={$asJson}" : ""));
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

final class PagesRepositoryTemp {
    private CoolDb $coolDb;
    public function __construct(CoolDb $coolDb) {
        $this->coolDb = $coolDb;
    }
    public function fetch(): Select {
        return $this->coolDb->select("\${p}pages", Page::class)
            ->fields(["id","slug","path","level","title","layoutId","blocks AS blocksJson","status"])
            ->mapWith(new class implements RowMapperInterface {
                public function mapRow(object $page, int $_numRow, array $_rows): object {
                    $page->blocks = array_map(fn($blockRaw) =>
                        Block::fromObject($blockRaw)
                    , json_decode($page->blocksJson, flags: JSON_THROW_ON_ERROR));
                    unset($page->blocksJson);
                    return $page;
                }
            });
    }
}
