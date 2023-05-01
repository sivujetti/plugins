<?= "<div class=\"j-JetFormsRadioGroupInput",
    $props->styleClasses ? " {$this->escAttr($props->styleClasses)}" : "",
    " form-group\" data-block-type=\"JetFormsRadioGroupInput\" data-block=\"", $props->id, "\">",
    "<label class=\"form-label\">{$this->e($props->label)}</label>";
    foreach (\Sivujetti\JsonUtils::parse($props->radios) as $radio) {
        echo "<label class=\"form-radio\">",
            "<input name=\"", $props->name, "\" value=\"", $this->escAttr($radio->value), "\" type=\"radio\"", $props->isRequired ? " data-pristine-required" : "", ">",
            "<i class=\"form-icon\"></i> ", $this->e($radio->text),
        "</label>";
    }
    echo $this->renderChildren($props),
"</div>";