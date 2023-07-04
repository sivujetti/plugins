<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Pike\Auth\Crypto;
use Pike\{Injector, Request};
use Sivujetti\Block\Entities\Block;
use Sivujetti\BlockType\{BlockTypeInterface, PropertiesBuilder, RenderAwareBlockTypeInterface};
use Sivujetti\ValidationUtils;

final class ContactFormBlockType implements BlockTypeInterface, RenderAwareBlockTypeInterface {
    public const NAME = "JetFormsContactForm";
    public const DEFAULT_RENDERER = "plugins/JetForms:block-contact-form";
    /**
     * @inheritdoc
     */
    public function defineProperties(PropertiesBuilder $builder): \ArrayObject {
        return $builder
            ->newProperty("behaviours")->dataType($builder::DATA_TYPE_TEXT, validationRules: [
                ["maxLength", ValidationUtils::HARD_LONG_TEXT_MAX_LEN]
            ])
            ->newProperty("useCaptcha")->dataType($builder::DATA_TYPE_UINT)
            ->getResult();
    }
    /**
     * @inheritdoc
     */
    public function onBeforeRender(Block $block,
                                   BlockTypeInterface $blockType,
                                   Injector $di): void {
        if (!$block->useCaptcha)
            return;
        $di->execute([$this, "doPerformBeforeRender"], [
            ":block" => $block,
        ]);
    }
    /**
     * @param \Sivujetti\Block\Entities\Block $block
     * @param \Pike\Request $req
     * @param \Pike\Auth\Crypto $crypto
     */
    public function doPerformBeforeRender(Block $block,
                                          Request $req,
                                          Crypto $crypto): void {
        if ($req->queryVar("in-edit") !== null)
            return;
        $key = self::getSecret();
        $block->__captchaChallenge = $crypto->encrypt(strval(time()), $key);
    }
    /**
     * @return ?string
     */
    public static function getSecret(): ?string {
        $arr = require __DIR__ . "/config.php";
        return $arr["secret"] ?? null;
    }
}
