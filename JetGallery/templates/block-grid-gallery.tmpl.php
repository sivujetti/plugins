<div class="j-<?=
        $props->type, " j-Columns jet-gallery num-cols-", $this->e($props->numColumns),
        ($props->takeFullWidth ? "" : " inline"),
        (!$props->styleClasses ? "" : " {$this->escAttr($props->styleClasses)}")
    ?>"
    data-block-type="<?= \SitePlugins\JetGallery\GridGalleryBlockType::NAME ?>"
    data-block="<?= $props->id ?>"
    data-use-captions="<?= $props->showCaptions ? "yes" : "no" ?>">
    <?= $this->renderChildren($props)
?></div>