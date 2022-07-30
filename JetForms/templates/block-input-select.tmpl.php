<?php echo "<div class=\"j-JetFormsSelectInput",
    $props->styleClasses ? " {$this->escAttr($props->styleClasses)}" : "",
    $props->label ? " form-group" : "",
    "\" data-block-type=\"JetFormsSelectInput\" data-block=\"", $props->id, "\">",
    !$props->label
        ? ""
        : "<label class=\"form-label\" for=\"{$this->e($props->name)}\">{$this->e($props->label)}</label>",
    "<select class=\"form-select\" name=\"", $this->e($props->name), !$props->multiple ? "\"" : "[]\" multiple", ">";
    foreach (array_merge(
        json_decode($props->options, associative: true, flags: JSON_THROW_ON_ERROR),
        [["text" => "-", "value" => "-"]]
    ) as ["value" => $value, "text" => $text]) {
        echo "<option value=\"", $this->e($value), "\">", $this->__($text), "</option>";
    }
echo "</select>",
    $this->renderChildren($props),
"</div>";