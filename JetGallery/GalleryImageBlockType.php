<?php declare(strict_types=1);

namespace SitePlugins\JetGallery;

use Sivujetti\BlockType\{ImageBlockType};

class GalleryImageBlockType extends ImageBlockType {
    public const NAME = "JetGalleryGalleryImage";
    public const DEFAULT_RENDERER = "plugins/JetGallery:block-gallery-image";
}
