<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Tests;

use Pike\TestUtils\MockCrypto;

final class UpdateMailSendSettingsTest extends SendSettingsControllerTestCase {
    public function testUpdateMailSendSettingsOverwritesSettingsToDb(): void {
        $state = $this->setupTest();
        $this->insertTestStoredObject($state);
        $this->sendUpdateMailSendSettingsRequest($state);
        $this->verifyRequestFinishedSuccesfully($state);
        $this->verifyOverwroteSettingsToDb($state);
    }
    private function setupTest(): \TestState {
        $state = new \TestState;
        $state->testStoredObject = (object) [
            "objectName" => "JetForms:mailSendSettings",
            "data" => json_encode([
                "sendingMethod" => "mail",
                "SMTP_host" => "",
                "SMTP_port" => "",
                "SMTP_username" => "",
                "SMTP_password" => "",
                "SMTP_secureProtocol" => "",
            ])
        ];
        $state->testInput = (object) [
            "sendingMethod" => "smtp",
            "SMTP_host" => "mail.foo.com",
            "SMTP_port" => "765",
            "SMTP_username" => "439t8jg4oijrk",
            "SMTP_password" => "24305d9u2m30u9",
            "SMTP_secureProtocol" => "tls",
            "junk" => "data",
        ];
        $state->spyingResponse = null;
        return $state;
    }
    private function sendUpdateMailSendSettingsRequest(\TestState $state): void {
        $this->createAppForSettingsControllerTest($state);
        $state->spyingResponse = $state->app->sendRequest(
            $this->createApiRequest("/plugins/jet-forms/settings/mailSendSettings", "PUT",
                $state->testInput));
    }
    private function verifyOverwroteSettingsToDb(\TestState $state): void {
        $actual = $this->dbDataHelper->getRow("storedObjects", "objectName=?", ["JetForms:mailSendSettings"]);
        $this->verifyResponseBodyEquals([
            "sendingMethod" => $state->testInput->sendingMethod,
            "SMTP_host" => $state->testInput->SMTP_host,
            "SMTP_port" => $state->testInput->SMTP_port,
            "SMTP_username" => $state->testInput->SMTP_username,
            "SMTP_password" => MockCrypto::mockEncrypt($state->testInput->SMTP_password, SIVUJETTI_SECRET),
            "SMTP_secureProtocol" => $state->testInput->SMTP_secureProtocol,
        ], $actual["data"]);
    }
}
