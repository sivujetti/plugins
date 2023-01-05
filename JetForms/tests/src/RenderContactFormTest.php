<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Tests;

use Laminas\Dom\Query;
use Pike\TestUtils\MutedSpyingResponse;
use SitePlugins\JetForms\{CheckboxInputBlockType, ContactFormBlockType, EmailInputBlockType,
    NumberInputBlockType, SelectInputBlockType, TextareaInputBlockType, TextInputBlockType};
use Sivujetti\Block\Entities\Block;
use Sivujetti\Template;
use Sivujetti\Tests\Utils\{PluginTestCase};

final class RenderContactFormTest extends PluginTestCase {
    public function testRenderPageResultContainsContactForm(): void {
        $response = $this
            ->setupRenderPageTest()
            ->usePlugin("JetForms")
            ->useBlockType(CheckboxInputBlockType::NAME, new CheckboxInputBlockType)
            ->useBlockType(ContactFormBlockType::NAME, new ContactFormBlockType)
            ->useBlockType(EmailInputBlockType::NAME, new EmailInputBlockType)
            ->useBlockType(NumberInputBlockType::NAME, new NumberInputBlockType)
            ->useBlockType(SelectInputBlockType::NAME, new SelectInputBlockType)
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
                        $this->blockTestUtils->makeBlockData(SelectInputBlockType::NAME,
                            renderer: SelectInputBlockType::DEFAULT_RENDERER,
                            propsData: self::createDataForTestInputBlock("wizardLevel"),
                        ),
                        $this->blockTestUtils->makeBlockData(NumberInputBlockType::NAME,
                            renderer: NumberInputBlockType::DEFAULT_RENDERER,
                            propsData: self::createDataForTestInputBlock("age"),
                        ),
                        $this->blockTestUtils->makeBlockData(CheckboxInputBlockType::NAME,
                            renderer: CheckboxInputBlockType::DEFAULT_RENDERER,
                            propsData: self::createDataForTestInputBlock("wantsReply"),
                        ),
                        $this->blockTestUtils->makeBlockData(Block::TYPE_BUTTON,
                            propsData: (object) ["html" => "Send", "linkTo" => "", "tagType" => "submit", "cssClass" => ""],
                        )
                    ]
                );
            })
            ->execute();
        $this->verifyResponseMetaEquals(200, "text/html", $response);
        $this->verifyPageContaintsContactForm($response);
    }
    private function verifyPageContaintsContactForm(MutedSpyingResponse $response): void {
        $dom = new Query(preg_replace("/&([#A-Za-z0-9]+);/", "%\$1;", $response->getActualBody()), 'UTF-8');
        /** @var ?\DOMElement */
        $formEl = $dom->execute(".jet-form")[0] ?? null;
        $this->assertNotNull($formEl);
        $this->assertEquals(Template::makeUrl("/plugins/jet-forms/submits/-bbbbbbbbbbbbbbbbbbb/hello"),
                            $formEl->getAttribute("action"));
        $this->assertEquals("post", $formEl->getAttribute("method"));
        $this->assertEquals("Thank you for your message!", $formEl->getAttribute("data-form-sent-message"));
        $this->assertEquals("-bbbbbbbbbbbbbbbbbbb", $formEl->getAttribute("data-form-id"));
        $this->assertEquals("contact", $formEl->getAttribute("data-form-type"));
        $all = $formEl->childNodes;
        // <div ... class="j-JetFormsEmailInput">
        //     <input name="email" id="email" type="email" class="form-input" placeholder="Email" data-pristine-required>
        // </div>
        $emailInputOuter = $all[2];
        $this->assertEquals("j-JetFormsEmailInput form-group", $emailInputOuter->getAttribute("class"));
        $emailInputEl = $emailInputOuter->childNodes[0];
        $this->assertEquals("email", $emailInputEl->getAttribute("name"));
        $this->assertEquals("email", $emailInputEl->getAttribute("id"));
        $this->assertEquals("email", $emailInputEl->getAttribute("type"));
        $this->assertEquals("form-input", $emailInputEl->getAttribute("class"));
        $this->assertEquals("Email", $emailInputEl->getAttribute("placeholder"));
        $this->assertEquals("", $emailInputEl->getAttribute("data-pristine-required"));
        // <div class="j-JetFormsTextInput form-group" ...>
        //     <label class="form-label" for="name">Test escape&lt;</label>
        //     <input name="name" id="name" type="text" class="form-input" data-pristine-required>
        // </div>
        $textInputOuter = $all[3];
        $this->assertEquals("j-JetFormsTextInput form-group", $textInputOuter->getAttribute("class"));
        [$labelEl, $inputEl] = $textInputOuter->childNodes;
        $this->assertEquals("form-label", $labelEl->getAttribute("class"));
        $this->assertEquals("name", $labelEl->getAttribute("for"));
        $this->assertEquals("Test escape%lt;", $labelEl->nodeValue);
        $this->assertEquals("name", $inputEl->getAttribute("name"));
        $this->assertEquals("name", $inputEl->getAttribute("id"));
        $this->assertEquals("text", $inputEl->getAttribute("type"));
        $this->assertEquals("form-input", $inputEl->getAttribute("class"));
        $this->assertEquals("", $inputEl->getAttribute("data-pristine-required"));
        // <div class="j-JetFormsTextareaInput" ...>
        //    <textarea name="message" id="message" type="textarea" class="form-input" placeholder="Message"></textarea>
        // </div>
        $textareaOuter = $all[4];
        $this->assertEquals("j-JetFormsTextareaInput form-group", $textareaOuter->getAttribute("class"));
        $textareaEl = $textareaOuter->childNodes[0];
        $this->assertEquals("message", $textareaEl->getAttribute("name"));
        $this->assertEquals("message", $textareaEl->getAttribute("id"));
        $this->assertEquals("textarea", $textareaEl->getAttribute("type"));
        $this->assertEquals("form-input", $textareaEl->getAttribute("class"));
        $this->assertEquals("Message", $textareaEl->getAttribute("placeholder"));
        // <div class="j-JetFormsSelectInput" ...>
        //     <select class="form-select" name="wizardLevel">
        //         <option value="value">text</option>
        //         ...
        //         <option value="-">-</option>
        //     </select>
        // </div>
        $selectElOuter = $all[5];
        $this->assertEquals("j-JetFormsSelectInput form-group", $selectElOuter->getAttribute("class"));
        $selectEl = $selectElOuter->childNodes[0];
        $this->assertEquals("wizardLevel", $selectEl->getAttribute("name"));
        $optionEls = $selectEl->getElementsByTagName("option");
        $this->assertCount(4, $optionEls);
        $optsData = json_decode(self::createDataForTestInputBlock("wizardLevel")->options);
        $this->assertEquals($optsData[0]->value, $optionEls[0]->getAttribute("value"));
        $this->assertEquals($optsData[1]->value, $optionEls[1]->getAttribute("value"));
        $this->assertEquals($optsData[2]->value, $optionEls[2]->getAttribute("value"));
        $this->assertEquals("-", $optionEls[3]->getAttribute("value"));
        $this->assertEquals($optsData[0]->text, $optionEls[0]->nodeValue);
        $this->assertEquals($optsData[1]->text, $optionEls[1]->nodeValue);
        $this->assertEquals($optsData[2]->text, $optionEls[2]->nodeValue);
        $this->assertEquals("-", $optionEls[3]->nodeValue);
        // <div class="j-JetFormsNumberInput form-group" ...>
        //     <label class="form-label" for="age">Age</label>
        //     <input name="age" id="age" type="text" class="form-input" inputmode="numeric">
        // </div>
        $numberInputOuter = $all[6];
        $this->assertEquals("j-JetFormsNumberInput form-group", $numberInputOuter->getAttribute("class"));
        [$labelEl, $inputEl] = $numberInputOuter->childNodes;
        $this->assertEquals("form-label", $labelEl->getAttribute("class"));
        $this->assertEquals("age", $labelEl->getAttribute("for"));
        $this->assertEquals("Age escape%gt;", $labelEl->nodeValue);
        $this->assertEquals("age", $inputEl->getAttribute("name"));
        $this->assertEquals("age", $inputEl->getAttribute("id"));
        $this->assertEquals("text", $inputEl->getAttribute("type"));
        $this->assertEquals("numeric", $inputEl->getAttribute("inputmode"));
        $this->assertEquals("form-input", $inputEl->getAttribute("class"));
        // <div class="j-JetFormsCheckboxInput form-group ...>
        //     <label class="form-checkbox">
        //         <input name="wantsReply" type="checkbox">
        //         <i class="form-icon"></i> Test escape&gt;
        //    </label>
        // </div>
        $checkboxInputOuter = $all[7];
        $this->assertEquals("j-JetFormsCheckboxInput form-group", $checkboxInputOuter->getAttribute("class"));
        $labelEl = $checkboxInputOuter->childNodes[0];
        $this->assertEquals("form-checkbox", $labelEl->getAttribute("class"));
        [$inputEl, $iconEl, $textNode] = $labelEl->childNodes;
        $this->assertEquals("wantsReply", $inputEl->getAttribute("name"));
        $this->assertEquals("checkbox", $inputEl->getAttribute("type"));
        $this->assertEquals("form-icon", $iconEl->getAttribute("class"));
        $this->assertEquals(" Test escape%gt;", rtrim($textNode->nodeValue));
        // <button class="j-Button btn" type="submit" ...>Send</button>
        $buttonEl = $all[8];
        $this->assertTrue(str_starts_with($buttonEl->getAttribute("class"), "j-Button"));
        $this->assertEquals("submit", $buttonEl->getAttribute("type"));
        $this->assertEquals("Send", $buttonEl->nodeValue);
        // <input type="hidden" name="_returnTo" value="/sivujetti/hello#contact-form-sent=-bbbbbbbbbbbbbbbbbbb">
        $returnToInput = $all[11];
        $this->assertEquals("hidden", $returnToInput->getAttribute("type"));
        $this->assertEquals("_returnTo", $returnToInput->getAttribute("name"));
        $this->assertEquals(Template::makeUrl("/hello")."#contact-form-sent=-bbbbbbbbbbbbbbbbbbb",
                            $returnToInput->getAttribute("value"));
        // <input type="hidden" name="_csrf" value="todo">
        $returnToInput = $all[12];
        $this->assertEquals("hidden", $returnToInput->getAttribute("type"));
        $this->assertEquals("_csrf", $returnToInput->getAttribute("name"));
        $this->assertEquals("todo", $returnToInput->getAttribute("value"));
    }
    public static function createDataForTestContactFormBlock(): object {
        return (object) [
            "behaviours" => json_encode([
                ["name" => "SendMail", "data" => [
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
            "wizardLevel" => (object) [
                "name" => "wizardLevel",
                "label" => "",
                "options" => json_encode([
                    ["text" => "Squib", "value" => "squib"],
                    ["text" => "Harry Potter", "value" => "harry-potter"],
                    ["text" => "Supreme Mugwump", "value" => "mugwump"],
                ]),
                "multiple" => 0,
            ],
            "age" => (object) [
                "name" => "age",
                "isRequired" => 0,
                "label" => "Age escape>",
                "placeholder" => "",
            ],
            "wantsReply" => (object) [
                "name" => "wantsReply",
                "isRequired" => 0,
                "label" => "Test escape>",
            ],
            "default" => ""
        };
    }
}