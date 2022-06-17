<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Tests;

use Pike\{Injector, PhpMailerMailer};
use SitePlugins\JetForms\{CheckboxInputBlockType, ContactFormBlockType, EmailInputBlockType,
                          SelectInputBlockType, TextareaInputBlockType, TextInputBlockType};
use Sivujetti\Tests\Utils\{PluginTestCase, TestEnvBootstrapper};

final class SendContactFormTest extends PluginTestCase {
    public function testProcessSubmitSendsMailUsingDataFromAContactFormBlock(): void {
        $this->runSendFormTest(
            inputs: fn() => [$this->blockTestUtils->makeBlockData(TextInputBlockType::NAME,
                renderer: TextInputBlockType::DEFAULT_RENDERER,
                propsData: (object) [
                    "name" => "name",
                    "isRequired" => 1,
                    "label" => "Name",
                    "placeholder" => "",
                ]
            )],
            postData: ["name" => "Bob xss >"],
            bodyTemplate: "User filled: [name]",
            expectedBody: "User filled: Bob xss &gt;",
        );
    }
    public function testProcessSubmitHandlesSingleSelectInput(): void {
        $this->runSendFormTest(
            inputs: fn() => [$this->blockTestUtils->makeBlockData(SelectInputBlockType::NAME,
                renderer: TextInputBlockType::DEFAULT_RENDERER,
                propsData: (object) [
                    "name" => "chooseOne",
                    "label" => "Choose one",
                    "options" => json_encode([
                        ["text" => "Option 1 xss <", "value" => "option-1"],
                        ["text" => "Option 2", "value" => "option-2"],
                    ]),
                    "multiple" => 0,
                ])
            ],
            postData: ["chooseOne" => "option-1"],
            bodyTemplate: "User chose: [chooseOne]",
            expectedBody: "User chose: Option 1 xss &lt;"
        );
    }
    public function testProcessSubmitHandlesMultiSelectInput(): void {
        $this->runSendFormTest(
            inputs: fn() => [$this->blockTestUtils->makeBlockData(SelectInputBlockType::NAME,
                renderer: TextInputBlockType::DEFAULT_RENDERER,
                propsData: (object) [
                    "name" => "chooseMany",
                    "label" => "Choose many",
                    "options" => json_encode([
                        ["text" => "Option 1 xss <", "value" => "option-1"],
                        ["text" => "Option 2", "value" => "option-2"],
                        ["text" => "Option 3", "value" => "option-3"],
                    ]),
                    "multiple" => 1,
                ])
            ],
            postData: ["chooseMany" => ["option-1", "option-3"]],
            bodyTemplate: "User chose:\n[chooseMany]\n\n",
            expectedBody: "User chose:\n" .
                "[x] Option 1 xss &lt;\n" .
                "[ ] Option 2\n" .
                "[x] Option 3\n\n"
        );
    }
    private function runSendFormTest(\Closure $inputs,
                                     array $postData,
                                     string $bodyTemplate,
                                     string $expectedBody): void {
        $response = $this
            ->setupPageTest()
            ->usePlugin("JetForms")
            ->useBlockType(ContactFormBlockType::NAME, new ContactFormBlockType)
            ->useBlockType(EmailInputBlockType::NAME, new EmailInputBlockType)
            ->useBlockType(TextareaInputBlockType::NAME, new TextareaInputBlockType)
            ->useBlockType(SelectInputBlockType::NAME, new SelectInputBlockType)
            ->useBlockType(TextInputBlockType::NAME, new TextInputBlockType)
            ->useBlockType(CheckboxInputBlockType::NAME, new CheckboxInputBlockType)
            ->withPageData(function (object $testPageData) use ($inputs, $bodyTemplate) {
                $this->state->testSendFormBehaviourData = [
                    "subjectTemplate" => "New mail from [siteName]",
                    "toAddress" => "owner@mysite.com",
                    "toName" => "Site Owner",
                    "fromAddress" => "noreply@mysite.com",
                    "fromName" => "My site",
                    "bodyTemplate" => $bodyTemplate,
                ];
                $testPageData->blocks[] = $this->blockTestUtils->makeBlockData(ContactFormBlockType::NAME,
                    renderer: ContactFormBlockType::DEFAULT_RENDERER,
                    propsData: (object) [
                        "behaviours" => json_encode([
                            ["name" => "SendMail", "data" => $this->state->testSendFormBehaviourData],
                        ])
                    ],
                    children: $inputs(),
                    id: "@auto"
                );
            })
            ->withBootModuleAlterer(function (TestEnvBootstrapper $bootModule) {
                $bootModule->useMockAlterer(function (Injector $di) {
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
                $state = $this->state;
                $pageContainingFormSlug = $state->testPageData->slug;
                $formBlockId = $state->testPageData->blocks[count($state->testPageData->blocks)-1]->id;
                return $this->createApiRequest("/plugins/jet-forms/submits/{$formBlockId}{$pageContainingFormSlug}", "POST",
                    (object) array_merge($postData, ["_returnTo" => "foo"]));
            });
        $this->verifyResponseMetaEquals(200, "text/html", $response);
        $conf = $this->state->actualFinalSendMailArg;
        $expected = $this->state->testSendFormBehaviourData;
        $this->assertEquals($expected["fromAddress"], $conf->fromAddress);
        $this->assertEquals($expected["fromName"], $conf->fromName);
        $this->assertEquals($expected["toAddress"], $conf->toAddress);
        $this->assertEquals($expected["toName"], $conf->toName);
        $expectedSubject = str_replace("[siteName]", "Test suit&ouml; website xss &gt;", $expected["subjectTemplate"]);
        $this->assertEquals($expectedSubject, $conf->subject);
        $this->assertEquals($expectedBody, $conf->body);
    }
}
