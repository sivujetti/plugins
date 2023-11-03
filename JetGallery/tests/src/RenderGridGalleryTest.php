<?php declare(strict_types=1);

namespace SitePlugins\JetGallery\Tests;

use DiDom\Document;
use Pike\TestUtils\MutedSpyingResponse;
use SitePlugins\JetGallery\{GalleryImageBlockType, GridGalleryBlockType};
use Sivujetti\BlockType\ImageBlockType;
use Sivujetti\Page\WebPageAwareTemplate;
use Sivujetti\Tests\Utils\{PluginTestCase};

final class RenderGridGalleryTest extends PluginTestCase {
    public function testRenderPageResultContainsGridGallery(): void {
        $response = $this
            ->setupRenderPageTest()
            ->usePlugin("JetGallery")
            ->useBlockType(GridGalleryBlockType::NAME, new GridGalleryBlockType)
            ->useBlockType(GalleryImageBlockType::NAME, new GalleryImageBlockType)
            ->withPageData(function (object $testPageData) {
                $testPageData->blocks[] = $this->blockTestUtils->makeBlockData(GridGalleryBlockType::NAME,
                    renderer: GridGalleryBlockType::DEFAULT_RENDERER,
                    propsData: self::createDataForTestGridGalleryBlock(),
                    children: [
                        $this->blockTestUtils->makeBlockData(GalleryImageBlockType::NAME,
                            renderer: GalleryImageBlockType::DEFAULT_RENDERER,
                            propsData: self::createDataForTesGalleryImage(),
                        ),
                        $this->blockTestUtils->makeBlockData(GalleryImageBlockType::NAME,
                            renderer: GalleryImageBlockType::DEFAULT_RENDERER,
                            propsData: self::createDataForTesGalleryImage(),
                        ),
                    ]
                );
            })
            ->execute();
        $this->verifyResponseMetaEquals(200, "text/html", $response);
        $this->verifyPageContaintsGridGallery($response);
    }
    private function verifyPageContaintsGridGallery(MutedSpyingResponse $response): void {
        $dom = new Document(preg_replace("/&([#A-Za-z0-9]+);/", "%\$1;", $response->getActualBody()));
        /* <div class="j-JetGalleryGridGallery...>
            <a href="/sivujetti/public/uploads...></a>
            ...
        </div> */
        $outermostEl = $dom->first(".jet-gallery");
        $this->assertNotNull($outermostEl);
        $this->assertEquals("no", $outermostEl->getAttribute("data-use-captions"));
        $all = $outermostEl->children();
        /* <a href="/sivujetti/public/uploads/vivid-blurred-colorful-background-compr.jpg" ...>
            <figure data-block-root>
                <img ...>
            </figure>
        </a> */
        $linkEl1 = $all[1];
        $this->assertEquals("a", $linkEl1->tagName());
        $this->assertEquals("#", $linkEl1->getAttribute("href"));
        //
        $imgEl1 = $linkEl1->first("figure img");
        $this->assertNotNull($imgEl1);
        $this->assertEquals(ImageBlockType::createSrc(new WebPageAwareTemplate(""), ""),
                            $imgEl1->getAttribute("src"));
    }
    public static function createDataForTestGridGalleryBlock(): object {
        return (object) [
            "showCaptions" => 0,
            "numColumns" => 2,
            "takeFullWidth" => 1,
        ];
    }
    public static function createDataForTesGalleryImage(): object {
        return (object) [
            "src" => null,
            "altText" => "",
            "caption" => "",
        ];
    }
}