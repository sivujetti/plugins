<div class="q-reactions"
    data-linked-to-entity-id="<?= $this->e($currentPage->id) ?>"
    data-linked-to-entity-type="<?= $this->e($currentPage->type) ?>"
    data-error-message="<?= $this->__("Something went wrong") ?>">
    <div class="q-reaction-buttons">
    <?php foreach (json_decode($props->buttons) as $button): ?>
        <button data-button-type="<?= $this->e($button->kind) ?>" title="<?= $this->__($button->verb) ?>">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather">
            <?= match ($button->kind) {
                "thumbsUp" => "<path d=\"M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3\"/>",
                "heart" => "<path d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"></path>",
                default => throw new \Pike\PikeException("Unkown button kind `{$button->kind}`", \Pike\PikeException::BAD_INPUT)
            } ?>
            </svg>
        </button>
    <?php endforeach; ?>
    </div>
</div>