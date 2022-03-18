<?php if (($settings = ([
    "JetFormsEmailInput" => ["type" => "email", "startTag" => "input", "closingTag" => ""],
    "JetFormsTextareaInput" => ["type" => "textarea", "startTag" => "textarea", "closingTag" => "</textarea>"],
    "JetFormsTextInput" => ["type" => "text", "startTag" => "input", "closingTag" => ""],
][$props->type] ?? null))):
    [$wrapStart, $wrapEnd] = !$props->label
        ? [
        "",
        ""
    ] : [
        "<div class=\"form-group\"><label class=\"form-label\" for=\"{$this->e($props->name)}\">{$this->e($props->label)}</label>",
        "</div>"
    ];
    echo $wrapStart,
        "<",$settings["startTag"]," name=\"",$this->e($props->name),"\" id=\"",$this->e($props->name),
            "\" type=\"",$settings["type"],"\" class=\"form-input\"",
            $props->placeholder ? " placeholder=\"{$this->e($props->placeholder)}\"" : "",
            $props->isRequired ? " data-pristine-required" : "",
        ">", $settings["closingTag"], // @allow raw html
    $wrapEnd;
else:
    [$startTag, $endTag] = !(SIVUJETTI_FLAGS & SIVUJETTI_DEVMODE) ? ["<!--", "-->"] : ["<div>", "</div>"];
    echo "{$startTag} JetForms/templates/block-input-auto.tmpl.php: Don't know how to render custom block type `{$props->type}` {$endTag}";
endif; ?>