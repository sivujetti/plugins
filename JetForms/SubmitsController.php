<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Pike\{PikeException, Request, Response, Validation};
use SitePlugins\JetForms\Internal\SendMailBehaviour;
use Sivujetti\{App, CoolRepository};
use Sivujetti\Block\BlockTree;
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
     * @param \Sivujetti\CoolRepository $dbAccess 
     */
    public function handleSubmit(Request $req,
                                 Response $res,
                                 CoolRepository $dbAccess): void {
        if (($errors = self::validateSubmitInput($req->body)))
            throw new PikeException(implode("\n", $errors), PikeException::BAD_INPUT);
        //
        $page = $dbAccess->fetch("[[prefix]]pages", Page::class)
            ->fields(["id","slug","path","level","title","layoutId","blocks AS blocksJson","status"])
            ->where("slug = ?", "/{$req->params->pageSlug}")
            ->fetch();
        if (!$page) throw new PikeException("Invalid input (not such page)",
                                            PikeException::BAD_INPUT);
        $page->normalize();
        //
        if (!($form = BlockTree::findBlockById($req->params->blockId, $page->blocks)))
            throw new PikeException("Invalid input (not such block)",
                                    PikeException::BAD_INPUT);
        if (!($form->behaviours = json_decode($form->behaviours, flags: JSON_THROW_ON_ERROR)))
            throw new PikeException("Nothing to process", PikeException::BAD_INPUT);
        //
        foreach ($form->behaviours as $behaviour) {
            if ($behaviour->name === "SendMail")
                // @allow \Pike\PikeException
                App::$di->execute([SendMailBehaviour::class, "run"], [
                    $behaviour->data,
                    $req->body,
                ]);
            elseif ($behaviour->name === "NotifyUser" && is_string($req->body->_todo))
                "todo";
        }
        $res->redirect($req->body->_returnTo);
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
