<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Tests;

use Pike\Auth\Crypto;
use Pike\Db\FluentDb2;
use Pike\Interfaces\SessionInterface;
use Pike\TestUtils\MutedSpyingResponse;
use SitePlugins\JetForms\{ContactFormBlockType, JetForms, TextInputBlockType};
use Sivujetti\StoredObjects\StoredObjectsRepository;
use Sivujetti\Tests\Utils\{PluginTestCase};

final class UseJetCaptchaTest extends PluginTestCase {
    private array $logFnCalls = [];
    public static function setUpBeforeClass(): void {
        parent::setUpBeforeClass();
        if (defined("JET_FORMS_NO_FEAT_1"))
            throw new \RuntimeException("Living on the edge");
    }
    protected function setUp(): void {
        parent::setUp();
        JetForms::$logFn = function ($str) { $this->logFnCalls[] = $str; };
    }
    protected function tearDown(): void {
        parent::tearDown();
        $this->logFnCalls = [];
        JetForms::$logFn = null;
    }
    public function testSubmitRejectsRequestIfUserSpendsTooLittleTimeFillingTheForm(): void {
        $simulatedFormFillTime = 1;
        $this->sendSendFormRequest(self::createCaptchaToken($simulatedFormFillTime), 400);
        $this->assertTrue(str_ends_with($this->logFnCalls[0], " was less than required 4."), $this->logFnCalls[0]);
    }


    ////////////////////////////////////////////////////////////////////////////


    public function testSubmitFormRejectsRequestIfUserSendsTheFormImmediately(): void {
        $simulatedFormFillTime = 0;
        $this->sendSendFormRequest(self::createCaptchaToken($simulatedFormFillTime), 400);
        $this->assertEquals("[Debug] User form completion time 0 was less than required 4.",
                            $this->logFnCalls[0]);
    }


    ////////////////////////////////////////////////////////////////////////////


    public function testSubmitRejectsRequestIfUserSpendsWayTooLongTimeFillingTheForm(): void {
        $simulatedFormFillTime = 60 * 60 * 24 * 2 + 1;
        $max = 60 * 60 * 24;
        $this->sendSendFormRequest(self::createCaptchaToken($simulatedFormFillTime), 400);
        $this->assertTrue(str_ends_with($this->logFnCalls[0], " was greater than allowed {$max}."), $this->logFnCalls[0]);
    }


    ////////////////////////////////////////////////////////////////////////////


    public function testSubmitRejectsRequestIfClientResponseTokenIsNotValid(): void {
        $this->sendSendFormRequest("not valid", 400);
        $this->assertTrue(str_contains($this->logFnCalls[0], "Error: uncaught exception in captcha verification"));
    }


    ////////////////////////////////////////////////////////////////////////////


    public function testSubmitRejectsRequestIfClientResponseTokenIsMissing(): void {
        $this->sendSendFormRequest("", 400);
        $this->assertEquals("[Debug] `captchaClientResponseToken` not present", $this->logFnCalls[0]);
    }


    ////////////////////////////////////////////////////////////////////////////


    public function testSubmitRejectsRequestIfUserIpDiffers(): void {
        $differentIpThanUponRequest = self::createCaptchaToken(6, "1.2.3.4");
        $this->sendSendFormRequest($differentIpThanUponRequest, 400);
        $this->assertEquals("[Debug] \$req->attr(\"REMOTE_ADDR\") didn't equal to \$ipAddrFromToken", $this->logFnCalls[0]);
    }


    ////////////////////////////////////////////////////////////////////////////


    public function testSubmitDoesNotRejectRequestIfUserSpendsEnoughTimeFillingTheForm(): void {
        $minFillingTime = 4;
        $simulatedFormFillTime = $minFillingTime + 2;
        $this->sendSendFormRequest(self::createCaptchaToken($simulatedFormFillTime), 200);
        $this->verifySentFormSuccesfully();
    }
    private function sendSendFormRequest(string $captchaToken,
                                         int $expectedStatusCode = 400): MutedSpyingResponse {
        $postData = (object) [
            "input_1" => "dummy",
            "captchaClientResponseToken" => $captchaToken,
            "_returnTo" => "foo",
        ];
        //
        $response = $this
            ->setupPageTest()
            ->usePlugin("JetForms")
            ->useBlockType(ContactFormBlockType::NAME, new ContactFormBlockType)
            ->useBlockType(TextInputBlockType::NAME, new TextInputBlockType)
            ->withPageData(function (object $testPageData) {
                $testPageData->blocks[] = $this->blockTestUtils->makeBlockData(ContactFormBlockType::NAME,
                    propsData: (object) [
                        "behaviours" => [
                            (object) ["name" => "StoreSubmissionToLocalDb", "data" => new \stdClass,]
                        ],
                        "captchaToUse" => "jet-captcha",
                    ],
                    children: [$this->blockTestUtils->makeBlockData(TextInputBlockType::NAME,
                        propsData: (object) [
                            "name" => "input_1",
                            "isRequired" => 1,
                            "label" => "Name",
                            "placeholder" => "",
                        ]
                    )],
                    id: "@auto"
                );
            })
            ->withMock("auth", [":session" => $this->createMock(SessionInterface::class),
                                ":useAnonUser" => true])
            ->execute(function () use ($postData) {
                $pageData = $this->state->testPageData;
                $formBlockId = $pageData->blocks[count($pageData->blocks)-1]->id;
                $url = "/plugins/jet-forms/submissions/{$formBlockId}{$pageData->slug}/main";
                return $this->createApiRequest($url, "POST", $postData, serverVars: ["REMOTE_ADDR" => "::1"]);
            });
        if ($expectedStatusCode === 400) {
            $this->verifyResponseMetaEquals($expectedStatusCode, "text/plain", $response);
            $this->verifyResponseBodyEquals("Captcha (jet-captcha) verification failed.", $response);
        } else {
            $this->verifyResponseMetaEquals($expectedStatusCode, "text/html", $response);
        }
        return $response;
    }
    private function verifySentFormSuccesfully(): void {
        $all = (new StoredObjectsRepository(new FluentDb2(self::$db)))->find("JetForms:submissions")->fetchAll();
        $this->assertCount(1, $all);
    }
    private static function createCaptchaToken(int $simulatedFormFillTime, string $ip = "::1"): string {
        $payload = (time() - $simulatedFormFillTime) . "|" . $ip;
        $key = (require dirname(__DIR__, 2) . "/config.php")["secret"];
        return (new Crypto)->encrypt($payload, $key);
    }
}
