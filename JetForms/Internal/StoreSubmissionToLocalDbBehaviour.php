<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Internal;

use Pike\Auth\Crypto;
use SitePlugins\JetForms\BehaviourExecutorInterface;
use Sivujetti\JsonUtils;
use Sivujetti\StoredObjects\StoredObjectsRepository;

/**
 * Runs a {type: "StoreSubmissionToLocalDb" ...} behaviour.
 *
 * @psalm-import-type InputMeta from \SitePlugins\JetForms\BehaviourExecutorInterface
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
    public function run(object $behaviourData, object $reqBody, array $submissionInfo): void {
        ["sentFromPage" => $pageSlug, "sentFromBlock" => $blockId, "answers" => $answers] = $submissionInfo;
        $this->storage->putEntry("JetForms:submissions", [
            "sentAt" => time(),
            "sentFromPage" => $pageSlug,
            "sentFromBlock" => $blockId,
            "answers" => $this->crypto->encrypt(JsonUtils::stringify($answers), SIVUJETTI_SECRET),
        ]);
    }
}
