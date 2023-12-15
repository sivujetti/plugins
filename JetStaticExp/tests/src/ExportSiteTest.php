<?php declare(strict_types=1);

namespace SitePlugins\JetStaticExp\Tests;

use Pike\Auth\Crypto;
use Pike\{FileSystem, Injector};
use Pike\TestUtils\{MockCrypto};
use Sivujetti\Template;
use Sivujetti\Tests\Utils\{PluginTestCase, TestEnvBootstrapper};
use Sivujetti\Update\ZipPackageStream;

final class ExportSiteTest extends PluginTestCase {
    protected function setUp(): void {
        parent::setUp();
        $this->usePlugin("JetStaticExp");
    }
    protected function tearDown(): void {
        parent::tearDown();
        $testZipPath = SIVUJETTI_INDEX_PATH . "public/" . (new MockCrypto)->genRandomToken(16) . ".zip";
        if (is_file($testZipPath))
            unlink($testZipPath);
    }
    public function testExportSiteGeneratesZipIncludingPages(): void {
        $state = $this->setupTest();
        $this->insertTestPageDataToDb($state);
        $this->sendExportSiteRequest($state);
        $this->verifyRequestFinishedSuccesfully($state);
        $expectedRelZipPath = "public/" . (new MockCrypto)->genRandomToken(16) . ".zip";
        $this->verifyReturnedZipDetails($state, $expectedRelZipPath);
        $this->verifyWroteRenderedPagesToZip($state, $expectedRelZipPath);
    }
    private function setupTest(): \TestState {
        $stateRef = $this->state;
        $stateRef->testPageData = $this->pageTestUtils->makeTestPageData();
        $stateRef->testInput = (object) [
            "pages" => [$stateRef->testPageData->slug],
            "files" => [],
            "targetHost" => "https://foo.com",
            "targetBaseUrl" => "/",
            "targetQueryVar" => "",
        ];
        return $stateRef;
    }
    private function sendExportSiteRequest(\TestState $state): void {
        $this->createAppForExportSiteTest($state);
        $state->spyingResponse = $state->app->sendRequest(
            $this->createApiRequest("/plugins/jet-static-exp/exports/export", "POST",
                $state->testInput));
    }
    private function verifyReturnedZipDetails(\TestState $state, string $expectedRelZipPath): void {
        $this->verifyResponseBodyEquals([
            "ok" => "ok",
            "resultFileUrl" => "/{$expectedRelZipPath}",
        ], $state->spyingResponse);
    }
    private function verifyWroteRenderedPagesToZip(\TestState $state, string $testZipPath): void {
        $actuallyWrittenZipFilePath = SIVUJETTI_INDEX_PATH . $testZipPath;
        $this->assertFileExists($actuallyWrittenZipFilePath);
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
