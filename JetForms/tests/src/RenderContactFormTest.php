<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Tests;

use Pike\TestUtils\MutedSpyingResponse;
use SitePlugins\JetForms\{ContactFormBlockType, EmailInputBlockType, TextareaInputBlockType,
                          TextInputBlockType};
use Sivujetti\Block\Entities\Block;
use Sivujetti\Tests\Utils\{BlockTestUtils, PluginTestCase};

class RenderContactFormTest extends PluginTestCase {
    private object $testContactFormBlockData;
    public function testRenderPageResultConstinasContactForm(): void {
        $response = $this
            ->setupRenderPageTest()
            ->usePlugin("JetForms")
            ->useBlockType(ContactFormBlockType::NAME, new ContactFormBlockType)
            ->useBlockType(EmailInputBlockType::NAME, new EmailInputBlockType)
            ->useBlockType(TextareaInputBlockType::NAME, new TextareaInputBlockType)
            ->useBlockType(TextInputBlockType::NAME, new TextInputBlockType)
            ->withPageData(function (object $testPageData) {
                $testPageData->blocks[] = $this->blockTestUtils->makeBlockData(ContactFormBlockType::NAME,
                    renderer: ContactFormBlockType::DEFAULT_RENDERER,
                    propsData: self::createDataForTestContactFormBlock(),
                    children: [
                        $this->blockTestUtils->makeBlockData(EmailInputBlockType::NAME,
                            renderer: EmailInputBlockType::DEFAULT_RENDERER,
                            propsData: self::createDataForTestInputBlock("email"),
                        ),
                        $this->blockTestUtils->makeBlockData(TextInputBlockType::NAME,
                            renderer: TextInputBlockType::DEFAULT_RENDERER,
                            propsData: self::createDataForTestInputBlock("name"),
                        ),
                        $this->blockTestUtils->makeBlockData(TextareaInputBlockType::NAME,
                            renderer: TextareaInputBlockType::DEFAULT_RENDERER,
                            propsData: self::createDataForTestInputBlock("message"),
                        ),
                        $this->blockTestUtils->makeBlockData(Block::TYPE_BUTTON,
                            propsData: (object) ["html" => "Send", "linkTo" => "", "tagType" => "submit", "cssClass" => ""],
                        )
                    ]
                );
                $this->testContactFormBlockData = $testPageData->blocks[count($testPageData->blocks) - 1];
            })
            ->execute();
        $this->verifyResponseMetaEquals(200, "text/html", $response);
        $this->verifyPageContaintsContactForm($response);
    }
    private function verifyPageContaintsContactForm(MutedSpyingResponse $response): void {
        [$testEmailInputBlock, $testTextInputBlock, $testTextareaInputBlock, $testButtonBlock] = $this->testContactFormBlockData->children;
        $expected = "<form\r\n" .
        "    action=\"/sivujetti/plugins/jet-forms/submits/-bbbbbbbbbbbbbbbbbbb/hello\"\r\n" .
        "    method=\"post\"\r\n" .
        "    class=\"jet-form\"    data-form-sent-message=\"Thank you for your message!\"\r\n" .
        "    data-form-id=\"-bbbbbbbbbbbbbbbbbbb\"\r\n" .
        "    novalidate>\r\n" .
        BlockTestUtils::decorateWithRef($testEmailInputBlock,
            "<input name=\"email\" id=\"email\" type=\"email\" class=\"form-input\" placeholder=\"Email\" data-pristine-required>"
        ) . BlockTestUtils::decorateWithRef($testTextInputBlock,
            "<div class=\"form-group\">" .
                "<label class=\"form-label\" for=\"name\">Test escape&lt;</label>" .
                "<input name=\"name\" id=\"name\" type=\"text\" class=\"form-input\" data-pristine-required>" .
            "</div>"
        ) . BlockTestUtils::decorateWithRef($testTextareaInputBlock,
            "<textarea name=\"message\" id=\"message\" type=\"textarea\" class=\"form-input\" placeholder=\"Message\"></textarea>"
        ) . BlockTestUtils::decorateWithRef($testButtonBlock,
            $this->blockTestUtils->getExpectedButtonBlockOutput($testButtonBlock)
        ) .
        "    <input type=\"hidden\" name=\"_returnTo\" value=\"/sivujetti/hello#contact-form-sent=-bbbbbbbbbbbbbbbbbbb\">\r\n" .
        "    <input type=\"hidden\" name=\"_csrf\" value=\"todo\">\r\n" .
        "</form>";
        $this->assertStringContainsString($expected, $response->getActualBody());
    }
    private static function createDataForTestContactFormBlock(): object {
        return (object) [
            "behaviours" => json_encode([
                ["name" => "SendForm", "data" => [
                    "subjectTemplate" => "",
                    "toAddress" => "",
                    "fromAddress" => "",
                    "bodyTemplate" => "",
                ]],
            ])
        ];
    }
    private static function createDataForTestInputBlock(string $which): object {
        return match ($which) {
            "email" => (object) [
                "name" => "email",
                "isRequired" => 1,
                "label" => "",
                "placeholder" => "Email",
            ],
            "name" => (object) [
                "name" => "name",
                "isRequired" => 1,
                "label" => "Test escape<",
                "placeholder" => "",
            ],
            "message" => (object) [
                "name" => "message",
                "isRequired" => 0,
                "label" => "",
                "placeholder" => "Message",
            ],
            "default" => ""
        };
    }
}