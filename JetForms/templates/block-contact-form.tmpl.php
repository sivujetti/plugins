<form action="<?= $this->url("/plugins/jet-forms/submits/{$props->id}{$this->currentPage->slug}") ?>"
    method="post"
    class="jet-form"<?php // see also public/plugin-jet-forms-bundle.js ?>
    data-form-sent-message="<?= $this->__("Thank you for your message!") ?>"
    data-form-id="<?= $props->id ?>"
    novalidate>
    <?php $i = 0; foreach (json_decode($props->fields, flags: JSON_THROW_ON_ERROR) as $f):
        // Note: No need to escape $f->* since they're pre-validated
        echo "<div class=\"form-group\">",
            "<label class=\"form-label\" for=\"{$f->name}\">{$f->label}</label>",
            match ($f->type) {
            "text" => "<input name=\"{$f->name}\" id=\"{$f->name}\" class=\"form-input\"" .
                ($f->isRequired ? " data-pristine-required" : "") .
            ">",
            "email" => "<input name=\"{$f->name}\" id=\"{$f->name}\" type=\"email\" class=\"form-input\"" .
                ($f->isRequired ? " data-pristine-required" : "") .
            ">",
            "textarea" => "<textarea name=\"{$f->name}\" id=\"{$f->name}\" class=\"form-input\"" .
                ($f->isRequired ? " data-pristine-required" : "") .
            "></textarea>",
            default => "Don't know how to render input type `{$f->type}`"
            },
        "</div>";
    ++$i; endforeach; ?>
    <input type="hidden" name="_returnTo" value="<?= is_string($props->returnTo ?? null)
        ? $this->e($props->returnTo)
        : "{$this->url($this->currentUrl)}#contact-form-sent={$props->id}"
    ?>">
    <input type="hidden" name="_csrf" value="todo">
    <button><?= $this->__("Contact us") ?></button>
</form>