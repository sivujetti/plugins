<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Internal;

use Pike\Response;
use SitePlugins\JetForms\BehaviourExecutorInterface;

/**
 * Runs a {type: "ShowSentMessage" ...} behaviour.
 */
final class ShowSentMessageBehaviour implements BehaviourExecutorInterface {
    /**
     * @inheritdoc
     */
    public function run(object $behaviourData, object $reqBody, Response $res, array $submissionInfo, array $runResultsArr): mixed {
        // Note: $runResultsArr contains "Error: .." items _only_ if current user is logged in, and has role <= ROLE_AUTHOR
        $errors = array_reduce($runResultsArr, fn($errors, $str) =>
            str_starts_with($str, "Error:") ? [...$errors, $str] : $errors
        , []);
        if (!$errors)
            $res->redirect($reqBody->_returnTo);
        else
            $res->plain(implode("\n", $errors));
        return "ok";
    }
}
