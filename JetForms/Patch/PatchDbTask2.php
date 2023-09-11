<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Patch;

use Pike\ArrayUtils;
use Pike\Auth\Crypto;
use Pike\Db\FluentDb;
use Pike\Interfaces\FileSystemInterface;
use Sivujetti\Block\BlockTree;
use Sivujetti\JsonUtils;
use Sivujetti\Update\UpdateProcessTaskInterface;

final class PatchDbTask2 implements UpdateProcessTaskInterface {
    /** @var bool */
    private bool $doSkip;
    /** @var \Pike\Db\FluentDb */
    private FluentDb $db;
    /** @var \Pike\Interfaces\FileSystemInterface */
    private FileSystemInterface $fs;
    /** @var \Closure */
    private \Closure $logFn;
    /**
     * @param string $toVersion
     * @param string $currentVersion
     * @param \Pike\Db\FluentDb $db
     * @param \Pike\Interfaces\FileSystemInterface $fs
     */
    function __construct(string $toVersion, string $currentVersion, FluentDb $db, FileSystemInterface $fs) {
        $this->doSkip = !($toVersion === "0.15.0" && ($currentVersion === "0.14.0" || $currentVersion === "0.15.0"));
        $this->db = $db;
        $this->fs = $fs;
        $this->logFn = function ($str) { /**/ };
    }
    /**
     */
    public function exec(): void {
        if ($this->doSkip) return;
        $pages = $this->db->select("\${p}Pages", "stdClass")->fields(["blocks as blocksJson", "id"])->fetchAll();
        $gbts = $this->db->select("\${p}globalBlockTrees", "stdClass")->fields(["blocks as blocksJson", "id"])->fetchAll();
        $reusables = $this->db->select("\${p}reusableBranches", "stdClass")->fields(["blockBlueprints as blockBlueprintsJson", "id"])->fetchAll();
        $this->patchPagesOrGbts($gbts, "globalBlockTrees");
        $this->patchPagesOrGbts($pages, "Pages");
        $this->patchReusables($reusables);
        $this->initConfigFile();
    }
    /**
     */
    public function rollBack(): void {
        // Can't rollBack
    }
    /**
     */
    private function patchPagesOrGbts(array $entities, string $tableName): void {
        foreach ($entities as $entitity) {
            $bef = $entitity->blocksJson;
            $tree = JsonUtils::parse($bef);
            BlockTree::traverse($tree, function ($itm) {
                if ($itm->type !== "JetFormsContactForm") return;
                //
                if (ArrayUtils::findIndexByKey($itm->propsData, "useCaptcha", "key") < 0)
                    $itm->propsData[] = (object) ["key" => "useCaptcha", "value" => 1];
                //
                $behavioursPropIdx = ArrayUtils::findIndexByKey($itm->propsData, "behaviours", "key");
                if (($newBehavioursJson = self::withTerminator($itm->propsData[$behavioursPropIdx]->value)) !== null)
                    $itm->propsData[$behavioursPropIdx]->value = $newBehavioursJson;
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
     */
    private function patchReusables(array $reusables): void {
        foreach ($reusables as $reusable) {
            $bef = $reusable->blockBlueprintsJson;
            $tree = JsonUtils::parse($bef);
            self::traverseReusables($tree, function ($itm) {
                if ($itm->blockType !== "JetFormsContactForm") return;
                //
                if (!property_exists($itm->initialOwnData, "useCaptcha"))
                    $itm->initialOwnData->useCaptcha = 1;
                //
                if (($newBehavioursJson = self::withTerminator($itm->initialOwnData->behaviours)) !== null)
                    $itm->initialOwnData->behaviours = $newBehavioursJson;
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
     */
    private function initConfigFile(): void {
        $filePath = dirname(__DIR__) . "/config.php";
        if (!$this->fs->isFile($filePath)) {
            $this->logFn->__invoke("config.php missing, skipping.");
            return;
        }
        $php = $this->fs->read($filePath);
        if (!$php) {
            $this->logFn->__invoke("failed to read config.php");
            return;
        }
        $randStr = substr((new Crypto)->genRandomToken(32), 0, 32);
        $status = $this->fs->write($filePath, str_replace(
            "secret\" => \"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "secret\" => \"{$randStr}",
            $php
        )) ? "initialized" : "failed to initialize";
        $this->logFn->__invoke("{$status} config.php");
    }
    /**
     */
    private static function withTerminator(string $behavioursJson): ?string {
        $behaviours = JsonUtils::parse($behavioursJson);
        if (!ArrayUtils::findByKey($behaviours, "ShowSentMessage", "name")) {
            $newBehaviours = [...$behaviours, (object) [
                "name" => "ShowSentMessage",
                "data" => (object) [
                    "at" => "beforeFirstInput",
                    "message" => "Kiitos viestistäsi.",
                ]
            ]];
            return JsonUtils::stringify($newBehaviours);
        }
        return null;
    }
    /**
     */
    private static function traverseReusables(array $reusables, \Closure $fn): void {
        foreach ($reusables as $reusable) {
            $fn($reusable);
            if ($reusable->initialChildren) self::traverseReusables($reusable->initialChildren, $fn);
        }
    }
}
