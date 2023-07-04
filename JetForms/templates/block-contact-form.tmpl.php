<form
    action="<?= $this->url(
        "/plugins/jet-forms/submissions/{$props->id}" .
        ($currentPage->slug !== "/" ? $currentPage->slug : "/-") .
        "/{$this->findBlockAndTree($currentPage->blocks, fn($b) => $b->id === $props->id)[1]->id}"
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
    <?php if ($props->useCaptcha): ?>
        <input type="hidden" name="_cChallenge" value="<?= $this->escAttr($props->__captchaChallenge ?? "") ?>">
    <?php endif; ?>
</form>