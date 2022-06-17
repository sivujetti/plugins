<?php echo "<div class=\"jet-forms-input-wrap form-group\" data-block-type=\"JetFormsSelectInput\" data-block=\"", $props->id, "\">",
    !$props->label ? "" : "<label class=\"form-label\">{$this->e($props->label)}</label>",
    "<select class=\"form-select\" name=\"", $this->e($props->name), !$props->multiple ? "\"" : "[]\" multiple", ">";
    foreach (array_merge(
        json_decode($props->options, associative: true, flags: JSON_THROW_ON_ERROR),
        [["text" => "-", "value" => "-"]]
    ) as ["value" => $value, "text" => $text]) {
        echo "<option value=\"", $this->e($value), "\">", $this->__($text), "</option>";
    }
echo "</select>",
"</div>";