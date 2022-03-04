<?php declare(strict_types=1);

namespace SitePlugins\QReactions;

use Pike\{Request, Response, Validation};

/**
 * Contains handlers for "/plugins/q-reactions/*".
 */
final class ReactionsController {
    /**
     * POST /plugins/q-reactions/reactions: Registers a reaction for $req->body->linkedTo
     * entity using $req->user->id or $_SERVER["REMOTE_ADDR"] as an identity if no such
     * reaction was already registered.
     *
     * @param \Pike\Request $req
     * @param \Pike\Response $res
     * @param \SitePlugins\QReactions\ReactionsRepository
     */
    public function addReaction(Request $req,
                                Response $res,
                                ReactionsRepository $reactionsRepo): void {
        if (($errors = Validation::makeObjectValidator()
            ->rule("reactionType", "type", "string") // "thumbsUp" etc.
            ->rule("reactionType", "maxLength", 64)
            ->rule("linkedTo.entityId", "type", "string") // "1", "uuid" etc.
            ->rule("linkedTo.entityId", "maxLength", 92)
            ->rule("linkedTo.entityType", "type", "string") // "Pages", "Articles" etc.
            ->rule("linkedTo.entityType", "maxLength", 92)
            ->validate($req->body))) {
            $res->status(400)->json($errors);
            return;
        }
        //
        $identity = self::getIdentity($req);
        if ($reactionsRepo->select()
            ->where(
                "`submissionIdentityType` = ? AND `submissionIdentityValue` = ? AND" .
                " `linkedToEntityType` = ? AND `linkedToEntityId` = ?",
                array_merge(array_values($identity), [$req->body->linkedTo->entityType, $req->body->linkedTo->entityId])
            )
            ->fetch()) {
            $res->status(200)->json(["ok" => "ok",
                                     "userHadAlreadyReacted" => true]);
            return;
        }
        //
        $reactionsRepo->insert()
            ->values((object) [
                "reactionType" => $req->body->reactionType,
                "submissionIdentityType" => $identity["submissionIdentityType"],
                "submissionIdentityValue" => $identity["submissionIdentityValue"],
                "linkedToEntityType" => $req->body->linkedTo->entityType,
                "linkedToEntityId" => $req->body->linkedTo->entityId,
                "submittedAt" => time()
            ])
            ->execute();
        $res->status(201)->json(["ok" => "ok",
                                 "userHadAlreadyReacted" => false]);

    }
    /**
     * @param \Pike\Request $req
     * @return array{submissionIdentityType: "userId"|"ipAddr", submissionIdentityValue: string}
     */
    private static function getIdentity(Request $req): array {
        if (($id = $req->myData->user?->id ?? null))
            return ["submissionIdentityType" => "userId",
                    "submissionIdentityValue" => $id];
        return ["submissionIdentityType" => "ipAddr",
                "submissionIdentityValue" => sha1($req->attr("REMOTE_ADDR"))];
    }
}
