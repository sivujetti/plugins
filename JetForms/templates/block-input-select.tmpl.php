<?php // @deprecated, see ../SelectInputBlockType->render()
echo "<div class=\"j-JetFormsSelectInput form-group",
    $props->styleClasses ? " {$this->escAttr($props->styleClasses)}" : "",
    "\" data-block-type=\"JetFormsSelectInput\" data-block=\"", $props->id, "\">",
    !$props->label
        ? ""
        : "<label class=\"form-label\" for=\"{$this->escAttr($props->name)}\">{$this->e($props->label)}</label>",
    "<select class=\"form-select\" name=\"", $this->escAttr($props->name), !$props->multiple ? "\"" : "[]\" multiple", ">";
    foreach ([
        ...$props->options,
        (object) ["text" => "-", "value" => "-"]
    ] as $def) {
        echo "<option value=\"", $this->escAttr($def->value), "\">", $this->__($def->text), "</option>";
    }
echo "</select>",
    $this->renderChildren($props),
"</div>";