<?php declare(strict_types=1);

namespace SitePlugins\QReactions\Tests;

use Pike\TestUtils\MutedSpyingResponse;
use SitePlugins\QReactions\{ReactionButtonsBlockType};
use Sivujetti\Tests\Utils\{PluginTestCase};

class RenderReactionButtonsTest extends PluginTestCase {
    private object $testReactionButtonsBlockData;
    public function testRenderPageResultContainsReactionButtons(): void {
        $response = $this
            ->setupRenderPageTest()
            ->usePlugin("QReactions")
            ->useBlockType(ReactionButtonsBlockType::NAME, new ReactionButtonsBlockType)
            ->withPageData(function (object $testPageData) {
                $testPageData->blocks[] = $this->blockTestUtils->makeBlockData(ReactionButtonsBlockType::NAME,
                    renderer: ReactionButtonsBlockType::DEFAULT_RENDERER,
                    propsData: self::createDataForTestReactionButtonsBlock(),
                );
                $this->testReactionButtonsBlockData = $testPageData->blocks[count($testPageData->blocks) - 1];
            })
            ->execute();
        $this->verifyResponseMetaEquals(200, "text/html", $response);
        $this->verifyPageContaintsReactionButtons($response);
    }
    private function verifyPageContaintsReactionButtons(MutedSpyingResponse $response): void {
        $buttons = json_decode($this->testReactionButtonsBlockData->buttons);
        $expectedLikeIcon = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather\">\r\n" .
            "            <path d=\"M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3\"/>            </svg>";
        $expected = "<div class=\"q-reaction-buttons\"\r\n" .
        "    data-linked-to-entity-id=\"1\"\r\n" .
        "    data-linked-to-entity-type=\"Pages\"\r\n" .
        "    data-error-message=\"Something went wrong\">\r\n" .
        "    <div data-block-root>\r\n" .
        "            <button data-button-type=\"{$buttons[0]->kind}\" title=\"{$buttons[0]->verb}\">\r\n" .
        "            {$expectedLikeIcon}\r\n" .
        "        </button>\r\n" .
        "        </div>\r\n" .
        "</div>";
        $this->assertStringContainsString($expected, $response->getActualBody());
    }
    private static function createDataForTestReactionButtonsBlock(): object {
        return (object) [
            "showReactionCount" => 0,
            "buttons" => json_encode([
                ["kind" => "thumbsUp", "verb" => "Like"],
            ])
        ];
    }
}