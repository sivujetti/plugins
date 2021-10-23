<?php declare(strict_types=1);

namespace SitePlugins\QReactions;

use Sivujetti\BlockType\{BlockTypeInterface, PropertiesBuilder};

final class ReactionButtonsBlockType implements BlockTypeInterface {
    public const NAME = "QReactionsReactionButtons";
    /**
     * @inheritdoc
     */
    public function defineProperties(PropertiesBuilder $builder): \ArrayObject {
        return $builder
            ->newProperty("showReactionCount", $builder::DATA_TYPE_UINT)
            ->newProperty("buttons", $builder::DATA_TYPE_TEXT)
            ->getResult();
    }
}
