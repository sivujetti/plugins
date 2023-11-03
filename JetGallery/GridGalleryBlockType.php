<?php declare(strict_types=1);

namespace SitePlugins\JetGallery;

use Sivujetti\BlockType\{BlockTypeInterface, ColumnsBlockType, PropertiesBuilder};

class GridGalleryBlockType implements BlockTypeInterface {
    public const NAME = "JetGalleryGridGallery";
    public const DEFAULT_RENDERER = "plugins/JetGallery:block-grid-gallery";
    /**
     * @inheritdoc
     */
    public function defineProperties(PropertiesBuilder $builder): \ArrayObject {
        return ColumnsBlockType::addProperties($builder)
            ->newProperty("showCaptions", $builder::DATA_TYPE_UINT)
            ->getResult();
    }
}
