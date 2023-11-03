<a href="<?= \Sivujetti\BlockType\ImageBlockType::createSrc($this, $props->src, "#") ?>"
    class="j-<?= $props->type, ($props->styleClasses ? " {$this->escAttr($props->styleClasses)}" : "") ?>"
    data-block-type="<?= $props->type ?>"
    data-block="<?= $props->id ?>">
    <figure data-block-root>
        <img src="<?= \Sivujetti\BlockType\ImageBlockType::createSrc($this, $props->src) ?>"
            alt="<?= $props->altText ? $this->escAttr($props->altText) : "" ?>">
        <?=
            ($props->caption ? "<figcaption>{$this->e($props->caption)}</figcaption>" : ""),
            $this->renderChildren($props)
        ?>
    </figure>
</a>