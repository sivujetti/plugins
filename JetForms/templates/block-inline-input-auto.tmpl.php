<?php if ($props->type === "JetFormsCheckboxInput"):
    echo "<div class=\"form-group\">",
        "<label class=\"form-checkbox\">",
            "<input name=\"", $this->e($props->name), "\" type=\"checkbox\">",
            "<i class=\"form-icon\"></i> ", $this->e($props->label),
        "</label>",
    "</div>";
else:
    [$startTag, $endTag] = !(SIVUJETTI_FLAGS & SIVUJETTI_DEVMODE) ? ["<!--", "-->"] : ["<div>", "</div>"];
    echo "{$startTag} JetForms/templates/block-inline-input-auto.tmpl.php: Don't know how to render custom block type `{$props->type}` {$endTag}";
endif; ?>