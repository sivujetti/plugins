<form
    action="<?= $this->url("/plugins/jet-forms/submits/{$props->id}{$currentPage->slug}") ?>"
    method="post"
    class="jet-form"<?php // see also public/plugin-jet-forms-bundle.js ?>
    data-form-sent-message="<?= $this->__("Thank you for your message!") ?>"
    data-form-id="<?= $props->id ?>"
    data-block-type="<?= $this->e(\SitePlugins\JetForms\ContactFormBlockType::NAME) ?>"
    data-block="<?= $this->e($props->id) ?>"
    novalidate>
    <?= $this->renderChildren($props) ?>
    <input type="hidden" name="_returnTo" value="<?= is_string($props->returnTo ?? null)
        ? $this->e($props->returnTo)
        : "{$this->url($currentUrl)}#contact-form-sent={$props->id}"
    ?>">
    <input type="hidden" name="_csrf" value="todo">
</form>