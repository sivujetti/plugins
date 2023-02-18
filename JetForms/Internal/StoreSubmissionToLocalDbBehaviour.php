<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Internal;

use SitePlugins\JetForms\BehaviourExecutorInterface;
use Sivujetti\StoredObjects\StoredObjectsRepository;

/**
 * Runs a {type: "StoreSubmissionToLocalDb" ...} behaviour.
 *
 * @psalm-import-type InputMeta from \SitePlugins\JetForms\BehaviourExecutorInterface
 */
final class StoreSubmissionToLocalDbBehaviour implements BehaviourExecutorInterface {
    /** @var \Sivujetti\StoredObjects\StoredObjectsRepository */
    private StoredObjectsRepository $storage;
    /**
     * @param \Sivujetti\StoredObjects\StoredObjectsRepository $storage
     */
    public function __construct(StoredObjectsRepository $storage) {
        $this->storage = $storage;
    }
    /**
     * @inheritdoc
     */
    public function run(object $behaviourData, object $reqBody, array $submissionInfo): void {
        ["sentFromPage" => $pageSlug, "sentFromBlock" => $blockId, "answers" => $answers] = $submissionInfo;
        $this->storage->putEntry("JetForms:submissions", (object) [
            "sentAt" => time(),
            "sentFromPage" => $pageSlug,
            "sentFromBlock" => $blockId,
            "answers" => $answers,
        ]);
    }
}
