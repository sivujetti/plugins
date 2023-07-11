<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Tests;

final class GetMailSendSettingsTest extends SettingsOrSubmissionControllerTestCase {
    public function testGetMailSendSettingsReturnsSettingsFromDb(): void {
        $state = $this->setupTest();
        $this->insertTestStoredObject($state);
        $this->sendGetMailSendSettingsRequest($state);
        $this->verifyRequestFinishedSuccesfully($state);
        $this->verifyReturnedSettingsFromDb($state);
    }
    private function setupTest(): \TestState {
        $state = new \TestState;
        $state->testStoredObject = (object) [
            "objectName" => "JetForms:mailSendSettings",
            "data" => json_encode([
                "sendingMethod" => "",
                "SMTP_host" => "",
                "SMTP_port" => "",
                "SMTP_username" => "",
                "SMTP_password" => "",
                "SMTP_secureProtocol" => "",
            ])
        ];
        $state->spyingResponse = null;
        return $state;
    }
    private function sendGetMailSendSettingsRequest(\TestState $state): void {
        $this->createAppForSettingsControllerTest($state);
        $state->spyingResponse = $state->app->sendRequest(
            $this->createApiRequest("/plugins/jet-forms/settings/mailSendSettings", "GET"));
    }
    private function verifyReturnedSettingsFromDb(\TestState $state): void {
        $expected = json_decode($state->testStoredObject->data, associative: true);
        $this->verifyResponseBodyEquals($expected, $state->spyingResponse);
    }
}
