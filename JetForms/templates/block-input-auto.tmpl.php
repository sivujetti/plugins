<?php if (($settings = ([
    "JetFormsEmailInput" => ["typeStr" => " type=\"email\"", "startTag" => "input", "closingTag" => "",
        "inputModeStr" => ""],
    "JetFormsNumberInput" => ["typeStr" => " type=\"text\"", "startTag" => "input", "closingTag" => "",
        "inputModeStr" => " inputmode=\"numeric\""],
    "JetFormsTextareaInput" => ["typeStr" => "", "startTag" => "textarea", "closingTag" => "</textarea>",
        "inputModeStr" => ""],
    "JetFormsTextInput" => ["typeStr" => " type=\"text\"", "startTag" => "input", "closingTag" => "",
        "inputModeStr" => ""],
][$props->type] ?? null))):
    echo "<div class=\"j-", $props->type,
            $props->styleClasses ? " {$this->escAttr($props->styleClasses)}" : "",
            " form-group\" data-block-type=\"", $props->type, "\" data-block=\"", $props->id, "\">",
            !$props->label
                ? ""
                : "<label class=\"form-label\" for=\"{$this->e($props->name)}\">{$this->e($props->label)}</label>",
        "<", $settings["startTag"], " name=\"", $this->e($props->name), "\" id=\"", $this->e($props->name), "\"",
            $settings["typeStr"],
            " class=\"form-input\"",
            $settings["inputModeStr"],
            $props->placeholder ? " placeholder=\"{$this->e($props->placeholder)}\"" : "",
            $props->isRequired ? " data-pristine-required" : "",
        ">", $settings["closingTag"], // @allow raw html
        $this->renderChildren($props),
    "</div>";
else:
    [$startTag, $endTag] = !(SIVUJETTI_FLAGS & SIVUJETTI_DEVMODE) ? ["<!--", "-->"] : ["<div>", "</div>"];
    echo $startTag, " JetForms/templates/block-input-auto.tmpl.php: Don't know how to render custom block type `", $this->e($props->type), "` ", $endTag;
endif; ?>