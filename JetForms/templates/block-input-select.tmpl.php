<?php echo "<div class=\"j-JetFormsSelectInput",
    $props->styleClasses ? " {$this->escAttr($props->styleClasses)}" : "",
    " form-group\" data-block-type=\"JetFormsSelectInput\" data-block=\"", $props->id, "\">",
    !$props->label
        ? ""
        : "<label class=\"form-label\" for=\"{$this->escAttr($props->name)}\">{$this->e($props->label)}</label>",
    "<select class=\"form-select\" name=\"", $this->escAttr($props->name), !$props->multiple ? "\"" : "[]\" multiple", ">";
    foreach (array_merge(
        json_decode($props->options, associative: true, flags: JSON_THROW_ON_ERROR),
        [["text" => "-", "value" => "-"]]
    ) as ["value" => $value, "text" => $text]) {
        echo "<option value=\"", $this->escAttr($value), "\">", $this->__($text), "</option>";
    }
echo "</select>",
    $this->renderChildren($props),
"</div>";