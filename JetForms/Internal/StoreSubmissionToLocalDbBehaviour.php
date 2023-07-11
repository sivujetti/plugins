<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Internal;

use Pike\Auth\Crypto;
use Pike\Response;
use SitePlugins\JetForms\BehaviourExecutorInterface;
use Sivujetti\JsonUtils;
use Sivujetti\StoredObjects\StoredObjectsRepository;

/**
 * Runs a {type: "StoreSubmissionToLocalDb" ...} behaviour.
 *
 * @psalm-import-type InputMeta from \SitePlugins\JetForms\BehaviourExecutorInterface
 * @psalm-import-type SubmissionInfo from \SitePlugins\JetForms\BehaviourExecutorInterface
 */
final class StoreSubmissionToLocalDbBehaviour implements BehaviourExecutorInterface {
    /** @var \Sivujetti\StoredObjects\StoredObjectsRepository */
    private StoredObjectsRepository $storage;
    /** @var \Pike\Auth\Crypto */
    private Crypto $crypto;
    /**
     * @param \Sivujetti\StoredObjects\StoredObjectsRepository $storage
     * @param \Pike\Auth\Crypto $crypto
     */
    public function __construct(StoredObjectsRepository $storage, Crypto $crypto) {
        $this->storage = $storage;
        $this->crypto = $crypto;
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
            "answers" => $this->crypto->encrypt(JsonUtils::stringify($answers), SIVUJETTI_SECRET),
        ]) ?? "";
    }
    /**
     * @param bool $decrypt = true
     * @psalm-return array<int, SubmissionInfo>
     */
    public function getSubmissions(bool $decrypt = true): array {
        $subs = $this->storage->find("JetForms:submissions")->fetchAll();
        $l = $decrypt ? count($subs) : 0;
        for ($i = 0; $i < $l; ++$i) {
            $json = $this->crypto->decrypt($subs[$i]->data["answers"], SIVUJETTI_SECRET);
            $subs[$i]->data["answers"] = JsonUtils::parse($json);
        }
        return array_map(fn($sub) => $sub->data, $subs);
    }
}
