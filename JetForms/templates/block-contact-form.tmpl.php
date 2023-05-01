<form
    action="<?= $this->url(
        "/plugins/jet-forms/submissions/{$props->id}" .
        ($currentPage->slug !== "/" ? $currentPage->slug : "/-") .
        ("/" . (
            \Sivujetti\Block\BlockTree::findBlock($currentPage->blocks, fn($b) =>
                $b->type === "GlobalBlockReference" &&
                \Sivujetti\Block\BlockTree::findBlock($b->__globalBlockTree->blocks, fn($b2) => $b2->id === $props->id),
            ) ?? (object) [
                "__globalBlockTree" => (object) ["id" => "main"]
            ]
        )->__globalBlockTree->id)
    ) ?>"
    method="post"
    class="j-<?= \SitePlugins\JetForms\ContactFormBlockType::NAME ?> jet-form<?= /* see also public/plugin-jet-forms-bundle.js */ $props->styleClasses ? " {$this->escAttr($props->styleClasses)}" : "" ?>"
    data-form-sent-message="<?= $this->__("Thank you for your message!") ?>"
    data-form-id="<?= $props->id ?>"
    data-form-type="contact"
    data-block-type="<?= \SitePlugins\JetForms\ContactFormBlockType::NAME ?>"
    data-block="<?= $props->id ?>">
    <?= $this->renderChildren($props) ?>
    <input type="hidden" name="_returnTo" value="<?= is_string($props->returnTo ?? null)
        ? $this->e($props->returnTo)
        : "{$this->url($currentUrl)}#contact-form-sent={$props->id}"
    ?>">
</form>