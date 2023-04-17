<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Patch;

use Pike\ArrayUtils;
use Pike\Db\FluentDb;
use Sivujetti\Block\BlockTree;
use Sivujetti\JsonUtils;
use Sivujetti\Update\UpdateProcessTaskInterface;

final class PatchDbTask1 implements UpdateProcessTaskInterface {
    /** @var bool */
    private bool $doSkip;
    /** @var \Pike\Db\FluentDb */
    private FluentDb $db;
    /** @var \Closure */
    private \Closure $logFn;
    /**
     * @param string $toVersion
     * @param string $currentVersion
     * @param \Pike\Db\FluentDb $db
     */
    function __construct(string $toVersion, string $currentVersion, FluentDb $db) {
        $this->doSkip = !($toVersion === "0.14.0" && ($currentVersion === "0.13.0" || $currentVersion === "0.14.0"));
        $this->db = $db;
        $this->logFn = function ($str) { /**/ };
    }
    /**
     * 
     */
    public function exec(): void {
        if ($this->doSkip) return;
        $pages = $this->db->select("\${p}Pages", "stdClass")->fields(["blocks as blocksJson", "id"])->fetchAll();
        $gbts = $this->db->select("\${p}globalBlockTrees", "stdClass")->fields(["blocks as blocksJson", "id"])->fetchAll();
        $reusables = $this->db->select("\${p}reusableBranches", "stdClass")->fields(["blockBlueprints as blockBlueprintsJson", "id"])->fetchAll();
        $this->patchPagesOrGbts($gbts, "globalBlockTrees");
        $this->patchPagesOrGbts($pages, "Pages");
        $this->patchReusables($reusables);
    }
    /**
     * 
     */
    public function rollBack(): void {
        // Can't rollBack
    }
    /**
     * 
     */
    private function patchPagesOrGbts(array $entities, string $tableName): void {
        foreach ($entities as $entitity) {
            $bef = $entitity->blocksJson;
            $tree = JsonUtils::parse($bef);
            BlockTree::traverse($tree, function ($itm) {
                if ($itm->type === "JetFormsTextareaInput" && ArrayUtils::findIndexByKey($itm->propsData, "numRows", "key") < 0)
                    $itm->propsData[] = (object) ["key" => "numRows", "value" => 0];
            });
            $entitity->blocksJson = JsonUtils::stringify($tree);
            if ($entitity->blocksJson !== $bef) {
                $numRows = $this->db->update("\${p}{$tableName}")
                    ->values((object)["blocks" => $entitity->blocksJson])
                    ->where("id=?", [$entitity->id])
                    ->execute();
                $this->logFn->__invoke("updated {$tableName} `{$entitity->id}`: {$numRows} rows changed");
            }
        }
    }
    /**
     * 
     */
    private function patchReusables(array $reusables): void {
        foreach ($reusables as $reusable) {
            $bef = $reusable->blockBlueprintsJson;
            $tree = JsonUtils::parse($bef);
            self::traverseReusables($tree, function ($itm) {
                if ($itm->blockType === "JetFormsTextareaInput" && !property_exists($itm->initialOwnData, "numRows"))
                    $itm->initialOwnData->numRows = 0;
            });
            $reusable->blockBlueprintsJson = JsonUtils::stringify($tree);
            if ($reusable->blockBlueprintsJson !== $bef) {
                $numRows = $this->db->update("\${p}reusableBranches")
                    ->values((object)["blockBlueprints" => $reusable->blockBlueprintsJson])
                    ->where("id=?", [$reusable->id])
                    ->execute();
                $this->logFn->__invoke("updated reusable `{$reusable->id}`: {$numRows} rows changed");
            }
        }
    }
    /**
     * 
     */
    private static function traverseReusables(array $reusables, \Closure $fn): void {
        foreach ($reusables as $reusable) {
            $fn($reusable);
            if ($reusable->initialChildren) self::traverseReusables($reusable->initialChildren, $fn);
        }
    }
}
