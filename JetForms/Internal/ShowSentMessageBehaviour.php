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
        $res->redirect($reqBody->_returnTo);
        return "ok";
    }
}
