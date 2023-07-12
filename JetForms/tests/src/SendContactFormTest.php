<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Tests;

use Pike\{Injector, PhpMailerMailer};
use Pike\Auth\Crypto;
use Pike\Db\FluentDb;
use Pike\TestUtils\MockCrypto;
use SitePlugins\JetForms\{CheckboxInputBlockType, ContactFormBlockType, EmailInputBlockType,
    NumberInputBlockType, RadioGroupInputBlockType, SelectInputBlockType, TextareaInputBlockType,
    TextInputBlockType};
use Sivujetti\JsonUtils;
use Sivujetti\StoredObjects\StoredObjectsRepository;
use Sivujetti\Tests\Utils\{PluginTestCase};

final class SendContactFormTest extends PluginTestCase {
    public function testProcessSubmissionWithSendMailBehaviourSendsMailUsingDataFromAContactFormBlock(): void {
        $this->runSendFormWithSendMailBehaviour(
            inputs: [$this->blockTestUtils->makeBlockData(TextInputBlockType::NAME,
                renderer: TextInputBlockType::DEFAULT_RENDERER, // Doesn't matter
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
            inputs: [$this->blockTestUtils->makeBlockData(SelectInputBlockType::NAME,
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
            inputs: [$this->blockTestUtils->makeBlockData(SelectInputBlockType::NAME,
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


    public function testProcessSubmissionWithSendMailBehaviourHandlesRadioGroupInput(): void {
        $this->runSendFormWithSendMailBehaviour(
            inputs: [$this->blockTestUtils->makeBlockData(RadioGroupInputBlockType::NAME,
                renderer: RadioGroupInputBlockType::DEFAULT_RENDERER,
                propsData: (object) [
                    "name" => "input_1",
                    "label" => "Choose single",
                    "radios" => json_encode([
                        ["text" => "Option 1 xss <", "value" => "option-1"],
                        ["text" => "Option 2", "value" => "option-2"],
                        ["text" => "Option 3", "value" => "option-3"],
                    ]),
                    "isRequired" => 0,
                ])
            ],
            postData: ["input_1" => "option-2"],
            bodyTemplate: "[resultsAll]\nafter",
            expectedEmailBody: "Choose single:\n" .
                "( ) Option 1 xss &lt;\n" .
                "(o) Option 2\n" .
                "( ) Option 3\nafter"
        );
    }


    ////////////////////////////////////////////////////////////////////////////


    public function testProcessSubmissionWithSendMailBehaviourHandlesNumberInput(): void {
        $this->runSendFormWithSendMailBehaviour(
            inputs: [$this->blockTestUtils->makeBlockData(NumberInputBlockType::NAME,
                renderer: NumberInputBlockType::DEFAULT_RENDERER,
                propsData: (object) [
                    "name" => "phone_number",
                    "label" => "Phone number",
                    "isRequired" => 1,
                    "placeholder" => "",
                ])
            ],
            postData: ["phone_number" => "123456"],
            bodyTemplate: "Results\r\n\r\n[resultsAll]\r\n\r\nsomething",
            expectedEmailBody: "Results\r\n\r\nPhone number:\n123456\r\n\r\nsomething"
        );
    }


    ////////////////////////////////////////////////////////////////////////////


    public function testProcessSubmissionUsesReplyToAddressAndName(): void {
        $inputs = [$this->blockTestUtils->makeBlockData(NumberInputBlockType::NAME,
            renderer: NumberInputBlockType::DEFAULT_RENDERER,
            propsData: (object) [
                "name" => "name_input_1",
                "label" => "Name",
                "isRequired" => 1,
                "placeholder" => "",
            ]),
            $this->blockTestUtils->makeBlockData(TextInputBlockType::NAME,
            renderer: NumberInputBlockType::DEFAULT_RENDERER,
            propsData: (object) [
                "name" => "email_input_1",
                "label" => "Email",
                "isRequired" => 1,
                "placeholder" => "",
            ]),
            $this->blockTestUtils->makeBlockData(TextareaInputBlockType::NAME,
            renderer: NumberInputBlockType::DEFAULT_RENDERER,
            propsData: (object) [
                "name" => "message",
                "isRequired" => 0,
                "label" => "",
                "placeholder" => "Message",
                "numRows" => 0,
            ])
        ];
        $postData = [
            "name_input_1" => "Foo escape<",
            "email_input_1" => "e@mail.com",
            "message" => "...",
        ];
        $behaviours = ["SendMail"];
        $setupDataFn = $this->createSetupPageDataFn(
            behaviours: $behaviours,
            inputs: $inputs,
            emailBodyTemplate: "...",
            replyToAddress: "email_input_1",
            replyToName: "name_input_1"
        );
        $this->sendSendFormRequest($setupDataFn, $postData, $behaviours);
        $this->verifyUsedReplyTos($postData);
    }
    private function verifyUsedReplyTos(array $postData): void {
        $conf = $this->state->actualFinalSendMailArg;
        $emailInputName = $this->state->testSendFormBehaviourData["replyToAddress"];
        $nameInputName = $this->state->testSendFormBehaviourData["replyToName"];
        $this->assertEquals($postData[$emailInputName], $conf->replyToAddress);
        $this->assertEquals(str_replace("<", "&lt;", $postData[$nameInputName]), $conf->replyToName);
    }


    ////////////////////////////////////////////////////////////////////////////


    public function testProcessSubmissionWithStoreToLocalDbBehaviourSavesAnswersToDb(): void {
        $behaviours = ["StoreSubmissionToLocalDb"];
        $this->sendSendFormRequest(
            $this->createSetupPageDataFn($behaviours, [
                $this->blockTestUtils->makeBlockData(TextInputBlockType::NAME,
                    renderer: TextInputBlockType::DEFAULT_RENDERER,
                    propsData: RenderContactFormTest::createDataForTestInputBlock("name"),
                ),
                $this->blockTestUtils->makeBlockData(EmailInputBlockType::NAME,
                    renderer: EmailInputBlockType::DEFAULT_RENDERER,
                    propsData: RenderContactFormTest::createDataForTestInputBlock("email"),
                ),
            ], ""),
            postData: ["name" => "Harry Potter", "email" => "e@ministfyofmagic.hm"],
            behaviours: $behaviours
        );
        $all = (new StoredObjectsRepository(new FluentDb(self::$db)))->find("JetForms:submissions")->fetchAll();
        $this->assertCount(1, $all);
        $mockEncryptedAnswers = $all[0]->data["answers"];
        $decryptedAnswers = MockCrypto::mockDecrypt($mockEncryptedAnswers, SIVUJETTI_SECRET);
        $parsed = JsonUtils::parse($decryptedAnswers);
        $this->assertEquals([
            (object) ["label" => "Test escape<", "answer" => "Harry Potter"],
            (object) ["label" => "Email", "answer" => "e@ministfyofmagic.hm"],
        ], $parsed);
        $this->assertEquals("/hello", $all[0]->data["sentFromPage"]);
        $actualFormBlock = $this->state->testPageData->blocks[count($this->state->testPageData->blocks)-1];
        $this->assertEquals($actualFormBlock->id, $all[0]->data["sentFromBlock"]);
        $this->assertEquals(["id" => "main", "name" => "Main"], $all[0]->data["sentFromTree"]);
        $this->assertTrue($all[0]->data["sentAt"] > time() - 10);
    }
    private function runSendFormWithSendMailBehaviour(array $inputs,
                                                      array $postData,
                                                      string $bodyTemplate,
                                                      string $expectedEmailBody): void {
        $behaviours = ["SendMail"];
        $setupDataFn = $this->createSetupPageDataFn($behaviours, $inputs, $bodyTemplate);
        $this->sendSendFormRequest($setupDataFn, $postData, $behaviours);
        $conf = $this->state->actualFinalSendMailArg;
        $expected = $this->state->testSendFormBehaviourData;
        $this->assertEquals($expected["fromAddress"], $conf->fromAddress);
        $this->assertEquals($expected["fromName"], $conf->fromName);
        $this->assertEquals($expected["toAddress"], $conf->toAddress);
        $this->assertEquals($expected["toName"], $conf->toName);
        $expectedSubject = str_replace("[siteName]", "Test suitö website xss &gt;", $expected["subjectTemplate"]);
        $this->assertEquals($expectedSubject, $conf->subject);
        $this->assertEquals($expectedEmailBody, $conf->body);
    }
    private function createSetupPageDataFn(array $behaviours,
                                            array $inputs,
                                            string $emailBodyTemplate,
                                            string $replyToAddress = "",
                                            string $replyToName = ""): \Closure {
        return function (object $testPageData) use ($behaviours, $inputs, $emailBodyTemplate, $replyToAddress, $replyToName) {
            $this->state->testSendFormBehaviourData = [
                "subjectTemplate" => "New mail from [siteName]",
                "toAddress" => "owner@mysite.com",
                "toName" => "Site Owner",
                "fromAddress" => "noreply@mysite.com",
                "fromName" => "My site",
                "replyToAddress" => $replyToAddress,
                "replyToName" => $replyToName,
                "bodyTemplate" => $emailBodyTemplate,
            ];
            $testPageData->blocks[] = $this->blockTestUtils->makeBlockData(ContactFormBlockType::NAME,
                renderer: ContactFormBlockType::DEFAULT_RENDERER,
                propsData: (object) [
                    "behaviours" => json_encode(array_map(fn($name) => [
                        "name" => $name,
                        "data" => $name === "SendMail" ? $this->state->testSendFormBehaviourData : new \stdClass,
                    ], $behaviours)),
                    "useCaptcha" => 0
                ],
                children: [...$inputs],
                id: "@auto"
            );
        };
    }
    private function sendSendFormRequest(\Closure $setupPageDataFn,
                                         array $postData,
                                         array $behaviours = ["SendMail"]): void {
        $response = $this
            ->setupPageTest()
            ->usePlugin("JetForms")
            ->useBlockType(ContactFormBlockType::NAME, new ContactFormBlockType)
            ->useBlockType(EmailInputBlockType::NAME, new EmailInputBlockType)
            ->useBlockType(TextareaInputBlockType::NAME, new TextareaInputBlockType)
            ->useBlockType(RadioGroupInputBlockType::NAME, new RadioGroupInputBlockType)
            ->useBlockType(SelectInputBlockType::NAME, new SelectInputBlockType)
            ->useBlockType(TextInputBlockType::NAME, new TextInputBlockType)
            ->useBlockType(CheckboxInputBlockType::NAME, new CheckboxInputBlockType)
            ->useBlockType(NumberInputBlockType::NAME, new NumberInputBlockType)
            ->withPageData($setupPageDataFn)
            ->withBootModuleAlterer(function (Injector $di) use ($behaviours) {
                $hasSendMailBehaviour = in_array("SendMail", $behaviours, true);
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
                $formBlockId = $pageData->blocks[count($pageData->blocks) - 1]->id;
                return $this->createApiRequest("/plugins/jet-forms/submissions/{$formBlockId}{$pageData->slug}/main", "POST",
                    (object) array_merge($postData, ["_returnTo" => "foo"]));
            });
        $this->verifyResponseMetaEquals(200, "text/html", $response);
    }
}
