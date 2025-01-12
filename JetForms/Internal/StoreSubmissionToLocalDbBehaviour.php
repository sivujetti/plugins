<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Internal;

use Pike\Auth\Crypto;
use Pike\Response;
use SitePlugins\JetForms\BehaviourExecutorInterface;
use Sivujetti\{AppEnv, JsonUtils};
use Sivujetti\StoredObjects\StoredObjectsRepository;

/**
 * Runs a {type: "StoreSubmissionToLocalDb" ...} behaviour.
 *
 * @phpstan-import-type SubmissionInfo from \SitePlugins\JetForms\BehaviourExecutorInterface
 */
final class StoreSubmissionToLocalDbBehaviour implements BehaviourExecutorInterface {
    /** @var \Sivujetti\StoredObjects\StoredObjectsRepository */
    private StoredObjectsRepository $storage;
    /** @var \Closure */
    private \Closure $cryptoMethod;
    /**
     * @param \Sivujetti\StoredObjects\StoredObjectsRepository $storage
     * @param \Pike\Auth\Crypto $crypto
     * @param \Sivujetti\AppEnv $appEnv
     */
    public function __construct(StoredObjectsRepository $storage,
                                Crypto $crypto,
                                AppEnv $appEnv) {
        $this->storage = $storage;
        $secret = $appEnv->constants["SITE_SECRET"];
        $this->cryptoMethod = fn(string $meth, string $arg1) => $crypto->{$meth}($arg1, $secret);
    }
    /**
     * @inheritdoc
     */
    public function run(object $behaviourData,
                        object $reqBody,
                        Response $res,
                        array $submissionInfo,
                        array $runResultsArr): mixed {
        [
            "answers" => $answers,
            "sentFromPage" => $pageSlug,
            "sentFromBlock" => $blockId,
            "sentFromTree" => $tree
        ] = $submissionInfo;
        return $this->storage->putEntry("JetForms:submissions", [
            "sentAt" => time(),
            "sentFromPage" => $pageSlug,
            "sentFromBlock" => $blockId,
            "sentFromTree" => $tree,
            "answers" => $this->cryptoMethod->__invoke("encrypt", JsonUtils::stringify($answers)),
        ]) ?? "";
    }
    /**
     * @param bool $decrypt = true
     * @return array<int, SubmissionInfo>
     */
    public function getSubmissions(bool $decrypt = true): array {
        $subs = $this->storage->find("JetForms:submissions")->fetchAll();
        $l = $decrypt ? count($subs) : 0;
        for ($i = 0; $i < $l; ++$i) {
            $json = $this->cryptoMethod->__invoke("decrypt", $subs[$i]->data["answers"]);
            $subs[$i]->data["answers"] = JsonUtils::parse($json);
        }
        return array_map(fn($sub) => $sub->data, $subs);
    }
}
