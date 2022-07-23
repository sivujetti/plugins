<?php declare(strict_types=1);

namespace SitePlugins\JetIcons;

use Pike\ArrayUtils;
use Sivujetti\Auth\ACL;
use Sivujetti\BlockType\{BlockTypeInterface, PropertiesBuilder};

final class IconBlockType implements BlockTypeInterface {
    public const NAME = "JetIconsIcon";
    public const DEFAULT_RENDERER = "plugins/JetIcons:block-icon-default";
    /**
     * @inheritdoc
     */
    public function defineProperties(PropertiesBuilder $builder): \ArrayObject {
        return $builder
            ->newProperty("iconId")
                ->dataType($builder::DATA_TYPE_TEXT, canBeEditedBy: ACL::ROLE_ADMIN|ACL::ROLE_ADMIN_EDITOR|ACL::ROLE_EDITOR|ACL::ROLE_AUTHOR)
            ->getResult();
    }
}
