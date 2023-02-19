<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Tests;

use Pike\{Injector, PhpMailerMailer};
use Pike\Auth\Crypto;
use Pike\Db\FluentDb;
use Pike\TestUtils\MockCrypto;
use SitePlugins\JetForms\{CheckboxInputBlockType, ContactFormBlockType, EmailInputBlockType,
                          SelectInputBlockType, TextareaInputBlockType, TextInputBlockType};
use Sivujetti\JsonUtils;
use Sivujetti\StoredObjects\StoredObjectsRepository;
use Sivujetti\Tests\Utils\{PluginTestCase, TestEnvBootstrapper};

final class SendContactFormTest extends PluginTestCase {
    public function testProcessSubmissionWithSendMailBehaviourSendsMailUsingDataFromAContactFormBlock(): void {
        $this->runSendFormWithSendMailBehaviour(
            inputs: fn() => [$this->blockTestUtils->makeBlockData(TextInputBlockType::NAME,
                renderer: TextInputBlockType::DEFAULT_RENDERER,
                propsData: (object) [
                    "name" => "input_1",
                    "isRequired" => 1,
                    "label" => "Name",
                    "placeholder" => "",
                ]
            )],
            postData: ["input_1" => "Bob xss >"],
            bodyTemplate: "All results:\n\n[resultsAll]",
            expectedEmailBody: "All results:\n\nName:\nBob xss &gt;",
        );
    }


    ////////////////////////////////////////////////////////////////////////////


    public function testProcessSubmissionWithSendMailBehaviourHandlesSingleSelectInput(): void {
        $this->runSendFormWithSendMailBehaviour(
            inputs: fn() => [$this->blockTestUtils->makeBlockData(SelectInputBlockType::NAME,
                renderer: TextInputBlockType::DEFAULT_RENDERER,
                propsData: (object) [
                    "name" => "input_1",
                    "label" => "Choose one",
                    "options" => json_encode([
                        ["text" => "Option 1 xss <", "value" => "option-1"],
                        ["text" => "Option 2", "value" => "option-2"],
                    ]),
                    "multiple" => 0,
                ])
            ],
            postData: ["input_1" => "option-1"],
            bodyTemplate: "[resultsAll]",
            expectedEmailBody: "Choose one:\nOption 1 xss &lt;"
        );
    }


    ////////////////////////////////////////////////////////////////////////////


    public function testProcessSubmissionWithSendMailBehaviourHandlesMultiSelectInput(): void {
        $this->runSendFormWithSendMailBehaviour(
            inputs: fn() => [$this->blockTestUtils->makeBlockData(SelectInputBlockType::NAME,
                renderer: TextInputBlockType::DEFAULT_RENDERER,
                propsData: (object) [
                    "name" => "input_1",
                    "label" => "Choose many",
                    "options" => json_encode([
                        ["text" => "Option 1 xss <", "value" => "option-1"],
                        ["text" => "Option 2", "value" => "option-2"],
                        ["text" => "Option 3", "value" => "option-3"],
                    ]),
                    "multiple" => 1,
                ])
            ],
            postData: ["input_1" => ["option-1", "option-3"]],
            bodyTemplate: "[resultsAll]\nafter",
            expectedEmailBody: "Choose many:\n" .
                "[x] Option 1 xss &lt;\n" .
                "[ ] Option 2\n" .
                "[x] Option 3\nafter"
        );
    }


    ////////////////////////////////////////////////////////////////////////////


    public function testProcessSubmissionWithStoreToLocalDbBehaviourSavesAnswersToDb(): void {
        $this->sendSendFormRequest(
            inputs: fn() => [
                $this->blockTestUtils->makeBlockData(TextInputBlockType::NAME,
                    renderer: TextInputBlockType::DEFAULT_RENDERER,
                    propsData: RenderContactFormTest::createDataForTestInputBlock("name"),
                ),
                $this->blockTestUtils->makeBlockData(EmailInputBlockType::NAME,
                    renderer: EmailInputBlockType::DEFAULT_RENDERER,
                    propsData: RenderContactFormTest::createDataForTestInputBlock("email"),
                ),
            ],
            postData: ["name" => "Harry Potter", "email" => "e@ministfyofmagic.hm"],
            behaviours: ["StoreSubmissionToLocalDb"]
        );
        $all = (new StoredObjectsRepository(new FluentDb(self::$db)))->getEntries("JetForms:submissions");
        $this->assertCount(1, $all);
        $mockEncryptedAnswers = $all[0]->data["answers"];
        $decryptedAnswers = MockCrypto::mockDecrypt($mockEncryptedAnswers, SIVUJETTI_SECRET);
        $parsed = JsonUtils::parse($decryptedAnswers);
        $this->assertEquals([
            (object) ["label" => "Test escape<", "value" => "Harry Potter"],
            (object) ["label" => "Email", "value" => "e@ministfyofmagic.hm"],
        ], $parsed);
        $this->assertEquals("/hello", $all[0]->data["sentFromPage"]);
        $actualFormBlock = $this->state->testPageData->blocks[count($this->state->testPageData->blocks)-1];
        $this->assertEquals($actualFormBlock->id, $all[0]->data["sentFromBlock"]);
        $this->assertGreaterThan(time() - 10, $all[0]->data["sentAt"]);
    }
    private function runSendFormWithSendMailBehaviour(\Closure $inputs,
                                                      array $postData,
                                                      string $bodyTemplate,
                                                      string $expectedEmailBody): void {
        $this->sendSendFormRequest($inputs, $postData, emailBodyTemplate: $bodyTemplate);
        $conf = $this->state->actualFinalSendMailArg;
        $expected = $this->state->testSendFormBehaviourData;
        $this->assertEquals($expected["fromAddress"], $conf->fromAddress);
        $this->assertEquals($expected["fromName"], $conf->fromName);
        $this->assertEquals($expected["toAddress"], $conf->toAddress);
        $this->assertEquals($expected["toName"], $conf->toName);
        $expectedSubject = str_replace("[siteName]", "Test suit&ouml; website xss &gt;", $expected["subjectTemplate"]);
        $this->assertEquals($expectedSubject, $conf->subject);
        $this->assertEquals($expectedEmailBody, $conf->body);
    }
    private function sendSendFormRequest(\Closure $inputs,
                                         array $postData,
                                         array $behaviours = ["SendMail"],
                                         string $emailBodyTemplate = ""): void {
        $response = $this
            ->setupPageTest()
            ->usePlugin("JetForms")
            ->useBlockType(ContactFormBlockType::NAME, new ContactFormBlockType)
            ->useBlockType(EmailInputBlockType::NAME, new EmailInputBlockType)
            ->useBlockType(TextareaInputBlockType::NAME, new TextareaInputBlockType)
            ->useBlockType(SelectInputBlockType::NAME, new SelectInputBlockType)
            ->useBlockType(TextInputBlockType::NAME, new TextInputBlockType)
            ->useBlockType(CheckboxInputBlockType::NAME, new CheckboxInputBlockType)
            ->withPageData(function (object $testPageData) use ($behaviours, $inputs, $emailBodyTemplate) {
                $this->state->testSendFormBehaviourData = [
                    "subjectTemplate" => "New mail from [siteName]",
                    "toAddress" => "owner@mysite.com",
                    "toName" => "Site Owner",
                    "fromAddress" => "noreply@mysite.com",
                    "fromName" => "My site",
                    "bodyTemplate" => $emailBodyTemplate,
                ];
                $testPageData->blocks[] = $this->blockTestUtils->makeBlockData(ContactFormBlockType::NAME,
                    renderer: ContactFormBlockType::DEFAULT_RENDERER,
                    propsData: (object) [
                        "behaviours" => json_encode(array_map(fn($name) => [
                            "name" => $name,
                            "data" => $name === "SendMail" ? $this->state->testSendFormBehaviourData : new \stdClass,
                        ], $behaviours))
                    ],
                    children: $inputs(),
                    id: "@auto"
                );
            })
            ->withBootModuleAlterer(function (TestEnvBootstrapper $bootModule) use ($behaviours) {
                $hasSendMailBehaviour = in_array("SendMail", $behaviours, true);
                $bootModule->useMockAlterer(function (Injector $di) use ($hasSendMailBehaviour) {
                    $di->delegate(Crypto::class, fn() => new MockCrypto);
                    if ($hasSendMailBehaviour)
                        $di->delegate(PhpMailerMailer::class, function () {
                            $stub = $this->createMock(PhpMailerMailer::class);
                            $stub->method("sendMail")
                                ->with($this->callBack(function ($actual) {
                                    $this->state->actualFinalSendMailArg = $actual;
                                    return true;
                                }))
                                ->willReturn(true);
                            return $stub;
                        });
                });
            })
            ->execute(function () use ($postData) {
                $this->dbDataHelper->insertData((object) [
                    "objectName" => "JetForms:mailSendSettings",
                    "data" => json_encode([
                        "sendingMethod" => "mail",
                        "SMTP_host" => "",
                        "SMTP_port" => "",
                        "SMTP_username" => "",
                        "SMTP_password" => "",
                        "SMTP_secureProtocol" => "",
                    ])
                ], "storedObjects");
                $pageData = $this->state->testPageData;
                $formBlockId = $pageData->blocks[count($pageData->blocks)-1]->id;
                return $this->createApiRequest("/plugins/jet-forms/submissions/{$formBlockId}{$pageData->slug}", "POST",
                    (object) array_merge($postData, ["_returnTo" => "foo"]));
            });
        $this->verifyResponseMetaEquals(200, "text/html", $response);
    }
}
