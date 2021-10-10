<?php declare(strict_types=1);

namespace SitePlugins\QReactions;

use Pike\Db;

final class ReactionsRepository {
    private const T = "`\${p}QReactionsReactions`";
    /** @var \Pike\Db $db */
    private Db $db;
    /**
     * @param \Pike\Db $db
     */
    public function __construct(Db $db) {
        $this->db = $db;
    }
    /**
     * Assumes that all input parameters are valid.
     *
     * @param string $reactionType
     * @param object $linkedTo
     * @param array{submissionIdentityType: "userId"|"ipAddr", submissionIdentityValue: string} $identity
     * @return int $numAffectedRows
     */
    public function insert(string $reactionType, object $linkedTo, array $identity): int {
        [$qList, $values, $columns] = $this->db->makeInsertQParts((object) [
            "reactionType" => $reactionType,
            "submissionIdentityType" => $identity["submissionIdentityType"],
            "submissionIdentityValue" => $identity["submissionIdentityValue"],
            "linkedToEntityType" => $linkedTo->entityType,
            "linkedToEntityId" => $linkedTo->entityId,
            "submittedAt" => time()
        ]);
        return $this->db->exec("INSERT INTO " . self::T . " ({$columns}) VALUES ({$qList})",
                               $values);
    }
    /**
     * @param array{submissionIdentityType: "userId"|"ipAddr", submissionIdentityValue: string} $identity
     * @param string $entityType e.g. "Pages"
     * @param string $entityId e.g. "1"
     * @return array{id: string, reactionType: string, submissionIdentityType: "userId"|"ipAddr", submissionIdentityValue: string, linkedToEntityType: string, linkedToEntityId: string, submittedAt: string}|null
     */
    public function getSingle(array $identity, string $entityType, string $entityId): ?array {
        $arr = $this->getMany($identity, $entityType, $entityId);
        return $arr ? $arr[0] : null;
    }
    /**
     * @param array{submissionIdentityType: "userId"|"ipAddr", submissionIdentityValue: string} $identity
     * @param string $entityType e.g. "Pages"
     * @param string $entityId e.g. "1"
     * @return array<int, array{id: string, reactionType: string, submissionIdentityType: "userId"|"ipAddr", submissionIdentityValue: string, linkedToEntityType: string, linkedToEntityId: string, submittedAt: string}>
     */
    private function getMany(array $identity, string $entityType, string $entityId): array {
        return $this->db->fetchAll(
            "SELECT * from " . self::T .
            " WHERE `submissionIdentityType` = ? AND `submissionIdentityValue` = ? AND" .
            " `linkedToEntityType` = ? AND `linkedToEntityId` = ?",
            array_merge(array_values($identity), [$entityType, $entityId]),
            \PDO::FETCH_ASSOC
        );
    }
}
