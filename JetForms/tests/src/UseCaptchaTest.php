<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Tests;

use Pike\Auth\Crypto;
use Pike\Db\FluentDb;
use Pike\Interfaces\SessionInterface;
use SitePlugins\JetForms\{ContactFormBlockType, TextInputBlockType};
use Sivujetti\StoredObjects\StoredObjectsRepository;
use Sivujetti\Tests\Utils\{PluginTestCase};

final class UseCaptchaTest extends PluginTestCase {
    public static function setUpBeforeClass(): void {
        parent::setUpBeforeClass();
        if (defined("JET_FORMS_NO_FEAT_1"))
            throw new \RuntimeException("Living on the edge");
    }
    public function testSubmitFormRejectsRequestIfUserSendsTheFormImmediately(): void {
        $this->expectExceptionMessage("Captcha challenge failed");
        $simulatedFormFillTime = 0;
        $this->sendSendFormRequest(self::createCaptchaToken($simulatedFormFillTime));
    }


    ////////////////////////////////////////////////////////////////////////////


    public function testSubmitDoesNotRejectsRequestIfUserSpendsTooLittleTimeFillingTheForm(): void {
        $this->expectExceptionMessage("Captcha challenge failed");
        $simulatedFormFillTime = 1;
        $this->sendSendFormRequest(self::createCaptchaToken($simulatedFormFillTime));
    }


    ////////////////////////////////////////////////////////////////////////////


    public function testSubmitDoesNotRejectsRequestIfUserSpendsWayTooLongTimeFillingTheForm(): void {
        $this->expectExceptionMessage("Captcha challenge failed");
        $simulatedFormFillTime = 60 * 60 * 24 * 2 + 1;
        $this->sendSendFormRequest(self::createCaptchaToken($simulatedFormFillTime));
    }


    ////////////////////////////////////////////////////////////////////////////


    public function testSubmitDoesNotRejectsIfChallengeTokenIsNotValid(): void {
        $this->expectExceptionMessage("Captcha challenge failed");
        $this->sendSendFormRequest("not valid");
    }


    ////////////////////////////////////////////////////////////////////////////


    public function testSubmitDoesNotRejectsIfChallengeTokenIsMissing(): void {
        $this->expectExceptionMessage("Captcha challenge failed");
        $this->sendSendFormRequest("");
    }


    ////////////////////////////////////////////////////////////////////////////


    public function testSubmitDoesNotRejectsRequestIfUserSpendsEnoughTimeFillingTheForm(): void {
        $minFillingTime = 10;
        $simulatedFormFillTime = $minFillingTime + 2;
        $this->sendSendFormRequest(self::createCaptchaToken($simulatedFormFillTime));
        $this->verifySentFormSuccesfully();
    }
    private function sendSendFormRequest(string $captchaToken): void {
        $postData = (object) [
            "input_1" => "dummy",
            "_cChallenge" => $captchaToken,
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
                    renderer: ContactFormBlockType::DEFAULT_RENDERER,
                    propsData: (object) [
                        "behaviours" => json_encode([
                            ["name" => "StoreSubmissionToLocalDb", "data" => new \stdClass,]
                        ]),
                        "useCaptcha" => 1,
                    ],
                    children: [$this->blockTestUtils->makeBlockData(TextInputBlockType::NAME,
                        renderer: TextInputBlockType::DEFAULT_RENDERER, // Doesn't matter
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
                return $this->createApiRequest($url, "POST", $postData);
            });
        $this->verifyResponseMetaEquals(200, "text/html", $response);
    }
    private function verifySentFormSuccesfully(): void {
        $all = (new StoredObjectsRepository(new FluentDb(self::$db)))->find("JetForms:submissions")->fetchAll();
        $this->assertCount(1, $all);
    }
    private static function createCaptchaToken(int $simulatedFormFillTime): string {
        return (new Crypto)->encrypt(
            strval(time() - $simulatedFormFillTime),
            (require dirname(__DIR__, 2) . "/config.php")["secret"]
        );
    }
}
