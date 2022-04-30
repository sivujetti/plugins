<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Tests;

use Pike\Auth\Crypto;
use Pike\Injector;
use Pike\TestUtils\{DbTestCase, HttpTestUtils, MockCrypto};
use Sivujetti\Tests\Utils\{DbDataHelper, HttpApiTestTrait, TestEnvBootstrapper};

abstract class SendSettingsControllerTestCase extends DbTestCase {
    use HttpTestUtils;
    use HttpApiTestTrait;
    protected DbDataHelper $dbDataHelper;
    protected function setUp(): void {
        parent::setUp();
        $this->dbDataHelper = new DbDataHelper(self::$db);
        $this->dbDataHelper->insertData((object) ["name" => "JetForms", "isActive" => true], "plugins");
    }
    public static function getDbConfig(): array {
        return require TEST_CONFIG_FILE_PATH;
    }
    protected function insertTestStoredObject(\TestState $state): void {
        $this->dbDataHelper->insertData($state->testStoredObject,
                                        "storedObjects");
    }
    protected function createAppForSettingsControllerTest(\TestState $state) {
        return $this->makeTestSivujettiApp($state, function (TestEnvBootstrapper $bootModule) {
            $bootModule->useMockAlterer(function (Injector $di) {
                $di->delegate(Crypto::class, fn() => new MockCrypto);
            });
        });
    }
}
