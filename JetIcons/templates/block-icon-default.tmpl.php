<?php echo "<span class=\"j-{$props->type}" . ($props->styleClasses ? " {$this->escAttr($props->styleClasses)}" : "") .
        "\" data-block-type=\"{$props->type}" .
        "\" data-block=\"{$props->id}\">",
    ($props->iconId && $props->__cachedInlineSvg
        ? ("<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon icon-tabler icon-tabler-{$props->iconId}" . // @allow unescaped
            "\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" stroke-width=\"2\" stroke=\"currentColor\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\">" .
            $props->__cachedInlineSvg . // @allow unescaped
        "</svg>")
        : "<span title=\"{$this->__("Waits for configuration ...")}\" style=\"border: 1px dashed;display: inline-block;padding: 11px;\"></span>"
    ) .
    $this->renderChildren($props) .
"</span>";