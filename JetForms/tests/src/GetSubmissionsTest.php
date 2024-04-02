<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Tests;

use Pike\TestUtils\MockCrypto;
use Sivujetti\JsonUtils;

final class GetSubmissionsTest extends SettingsOrSubmissionControllerTestCase {
    private static string $testSiteSecret;
    public static function setUpBeforeClass(): void {
        self::$testSiteSecret = (require TEST_CONFIG_FILE_PATH)["env"]["SITE_SECRET"];
    }
    public function testGetSubmissionsReturnsAndDecryptsDataFromDb(): void {
        $state = $this->setupTest();
        $this->insertTestStoredObjects($state);
        $this->sendGetSubmissionsRequest($state);
        $this->verifyRequestFinishedSuccesfully($state);
        $this->verifyReturnedAndDecryptedSubmissionsFromDb($state);
    }
    private function setupTest(): \TestState {
        $state = new \TestState;
        $state->testStoredObjects = [(object) [
            "objectName" => "JetForms:submissions",
            "data" => json_encode([
                "sentAt" => time() - 1,
                "sentFromPage" => "/foo",
                "sentFromBlock" => "-aaaaaaaaaaaaaaaaaaa",
                "sentFromTree" => (object) ["id" => "main", "name" => "Main"],
                "answers" => (new MockCrypto)->encrypt(JsonUtils::stringify([
                    (object) ["label" => "Name", "answer" => "Harry Potter"],
                ]), self::$testSiteSecret),
            ])
        ], (object) [
            "objectName" => "JetForms:submissions",
            "data" => json_encode([
                "sentAt" => time(),
                "sentFromPage" => "/foo",
                "sentFromBlock" => "-aaaaaaaaaaaaaaaaaaa",
                "sentFromTree" => (object) ["id" => "-bbbbbbbbbbbbbbbbbbb", "name" => "Footer"],
                "answers" => (new MockCrypto)->encrypt(JsonUtils::stringify([
                    (object) ["label" => "Email", "answer" => "harry.potter@ministfyofmagic.hm"],
                ]), self::$testSiteSecret),
            ])
        ]];
        $state->spyingResponse = null;
        return $state;
    }
    private function sendGetSubmissionsRequest(\TestState $state): void {
        $this->createAppForSettingsControllerTest($state);
        $state->spyingResponse = $state->app->sendRequest(
            $this->createApiRequest("/plugins/jet-forms/submissions", "GET"));
    }
    private function verifyReturnedAndDecryptedSubmissionsFromDb(\TestState $state): void {
        $expected1 = JsonUtils::parse($state->testStoredObjects[0]->data);
        $decryptedAnwsersJson = (new MockCrypto)->decrypt($expected1->answers, self::$testSiteSecret);
        $expected1->answers = JsonUtils::parse($decryptedAnwsersJson);
        //
        $expected2 = JsonUtils::parse($state->testStoredObjects[1]->data);
        $decryptedAnwsersJson2 = (new MockCrypto)->decrypt($expected2->answers, self::$testSiteSecret);
        $expected2->answers = JsonUtils::parse($decryptedAnwsersJson2);
        //
        $this->verifyResponseBodyEquals([$expected1, $expected2], $state->spyingResponse);
    }
}
