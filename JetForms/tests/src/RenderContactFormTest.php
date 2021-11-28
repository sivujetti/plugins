<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Tests;

use Pike\TestUtils\MutedSpyingResponse;
use SitePlugins\JetForms\ContactFormBlockType;
use Sivujetti\Tests\Utils\PluginTestCase;

class RenderContactFormTest extends PluginTestCase {
    public function testRenderPageResultConstinasContactForm(): void {
        $response = $this
            ->setupRenderPageTest()
            ->usePlugin("JetForms")
            ->useBlockType(ContactFormBlockType::NAME, new ContactFormBlockType)
            ->withPageData(function (object $testPageData) {
                $testPageData->blocks[] = $this->blockTestUtils->makeBlockData(ContactFormBlockType::NAME,
                    renderer: ContactFormBlockType::DEFAULT_RENDERER,
                    propsData: self::createDataForTestContactFormBlock(),
                );
            })
            ->execute();
        $this->verifyResponseMetaEquals(200, "text/html", $response);
        $this->verifyPageContaintsContactForm($response);
    }
    private function verifyPageContaintsContactForm(MutedSpyingResponse $response): void {
        $expected = "<form action=\"/sivujetti/plugins/jet-forms/submits/-bbbbbbbbbbbbbbbbbbb/hello\"\r\n" .
        "    method=\"post\"\r\n" .
        "    class=\"jet-form\"    data-form-sent-message=\"Thank you for your message!\"\r\n" .
        "    data-form-id=\"-bbbbbbbbbbbbbbbbbbb\"\r\n" .
        "    novalidate>\r\n" .
        "    <div class=\"form-group\"><label class=\"form-label\" for=\"name\">Name</label><input name=\"name\" id=\"name\" class=\"form-input\" data-pristine-required></div>    <input type=\"hidden\" name=\"_returnTo\" value=\"/sivujetti/hello#contact-form-sent=-bbbbbbbbbbbbbbbbbbb\">\r\n" .
        "    <input type=\"hidden\" name=\"_csrf\" value=\"todo\">\r\n" .
        "    <button>Contact us</button>\r\n" .
        "</form>";
        $this->assertStringContainsString($expected, $response->getActualBody());
    }
    private static function createDataForTestContactFormBlock(): object {
        return (object) [
            "fields" => json_encode([
                ["name" => "name", "label" => "Name", "type" => "text", "isRequired" => true],
            ]),
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
}