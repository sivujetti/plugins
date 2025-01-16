<?php declare(strict_types=1);

namespace SitePlugins\JetStaticExp\Tests;

use Pike\Auth\Crypto;
use Pike\{FileSystem, Injector};
use Pike\TestUtils\{MockCrypto};
use Sivujetti\{JsonUtils, Template};
use Sivujetti\Tests\Utils\{PluginTestCase, TestEnvBootstrapper};
use Sivujetti\Update\ZipPackageStream;

final class ExportSiteTest extends PluginTestCase {
    protected function setUp(): void {
        parent::setUp();
        $this->usePlugin("JetStaticExp");
    }
    protected function tearDown(): void {
        parent::tearDown();
        if ($this->state->actuallyWrittenZipFilePath)
            unlink($this->state->actuallyWrittenZipFilePath);
    }
    public function testExportSiteGeneratesZipIncludingPages(): void {
        $state = $this->setupTest();
        $this->insertTestPageDataToDb($state);
        $this->sendExportSiteRequest($state);
        $this->verifyRequestFinishedSuccesfully($state);
        $expectedZipUrlRegexp = "/^\\/public\\/.+\\.zip\$/";
        $this->verifyReturnedZipDetails($state, $expectedZipUrlRegexp);
        $this->verifyWroteRenderedPagesToZip($state, $state->returnedZipUrl);
    }
    private function setupTest(): \TestState {
        $stateRef = $this->state;
        $stateRef->testPageData = $this->pageTestUtils->makeTestPageData();
        $stateRef->testInput = (object) [
            "pages" => [$stateRef->testPageData->slug],
            "files" => [],
            "targetHost" => "https://foo.com",
            "targetBaseUrl" => "/",
            "addDicoveredPublicAssets" => false,
        ];
        $stateRef->returnedZipUrl = null;
        $stateRef->actuallyWrittenZipFilePath = null;
        return $stateRef;
    }
    private function sendExportSiteRequest(\TestState $state): void {
        $this->createAppForExportSiteTest($state);
        $state->spyingResponse = $state->app->sendRequest(
            $this->createApiRequest("/plugins/jet-static-exp/exports/export", "POST",
                $state->testInput));
    }
    private function verifyReturnedZipDetails(\TestState $state, string $expectedZipUrlRegexp): void {
        $actual = JsonUtils::parse($state->spyingResponse->getActualBody());
        $this->assertEquals("ok", $actual->ok);
        $this->assertMatchesRegularExpression($expectedZipUrlRegexp, $actual->resultFileUrl);
        $state->returnedZipUrl = $actual->resultFileUrl;
    }
    private function verifyWroteRenderedPagesToZip(\TestState $state, string $testZipUrl): void {
        $actuallyWrittenZipFilePath = SIVUJETTI_INDEX_PATH . $testZipUrl;
        $this->assertFileExists($actuallyWrittenZipFilePath);
        $state->actuallyWrittenZipFilePath = $actuallyWrittenZipFilePath;
        $zip = new ZipPackageStream(new FileSystem);
        $zip->open($actuallyWrittenZipFilePath);
        $slug1NoSlash = ltrim($state->testInput->pages[0], "/");
        $axtualPage1Html = $zip->read("{$slug1NoSlash}/index.html");
        $this->assertStringContainsString("<title>" . Template::e($state->testPageData->title),
                                          $axtualPage1Html);
    }
    private function createAppForExportSiteTest(\TestState $state) {
        return $this->makeTestSivujettiApp($state, function (TestEnvBootstrapper $bootModule) {
            $bootModule->useMockAlterer(function (Injector $di) {
                $di->delegate(Crypto::class, fn() => new MockCrypto);
            });
        });
    }
}
