# Standard style units

"Standard" stylis/scss styles for each block type of JetIcons plugin.

## JetIconsIcon

Order | Name | Derivable | Default
--- | --- | --- | ---
1 | Base template | yes | yes

### Base template

```scss
// @exportAs(color)
--color_JetIconsIcon_default1: initial;
// @exportAs(length)
--size_JetIconsIcon_default1: 24px;
// @exportAs(length)
--strokeWidth_JetIconsIcon_default1: 2px;

.icon {
  color: var(--color_JetIconsIcon_default1, currentColor);
  width: var(--size_JetIconsIcon_default1);
  height: var(--size_JetIconsIcon_default1);
  stroke-width: var(--strokeWidth_JetIconsIcon_default1);
}
```