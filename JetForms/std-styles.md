# For theme.css

```css
.j-JetFormsContactForm.sent-and-processed .sent-message {
  font-weight: bold;
  margin-bottom: 1rem;
}
.j-JetFormsContactForm [class^="j-JetForms"] {
  margin-bottom: 0.4rem;
}
.pristine-error {
  margin-top: 0;
}
```

## For db.themes.styleChunkBundlesAll[0]

```css
:root {
  /* ... */
  --jet-inputs-font-size: 0.8rem;
  --jet-inputs-text-color: #333;
  --jet-inputs-bg-normal-color: #fff;
  --jet-inputs-border-width: 1px;
  --jet-inputs-border-normal-color: #ddd;
  --jet-inputs-border-focus-color: #ccc;
  /* --jet-inputs-checkbox-selected-color: var(--spectre-primary-color); omit */
  /* --jet-inputs-focus-shadow-color: var(--spectre-primary-shadow-color); omit */
  --jet-inputs-border-radius: 4px;
  --jet-inputs-padding-y: 0.4rem;
  --jet-inputs-padding-x: 0.5rem;
  --jet-inputs-placeholder-color: #c3c3c3;
}
```

### JetFormsCheckboxInput

Order | Name | Derivable | Default
--- | --- | --- | ---
1 | Default | yes | yes

#### Default

```scss
// @exportAs(length)
--fontSize_JetFormsCheckboxInput_default1: 0.8rem;
// @exportAs(color)
--text_JetFormsCheckboxInput_default1: invalid;
// @exportAs(color)
--background_JetFormsCheckboxInput_default1: #17034a;
// @exportAs(color)
--outlineFocus_JetFormsCheckboxInput_default1: #7f7f7f00;
// @exportAs(color)
--error_JetFormsCheckboxInput_default1: #eb8d5a;
// @exportAs(length)
--paddingTop_JetFormsCheckboxInput_default1: 0.1rem;
// @exportAs(length)
--paddingRight_JetFormsCheckboxInput_default1: 0.4rem;
// @exportAs(length)
--paddingBottom_JetFormsCheckboxInput_default1: 0.1rem;
// @exportAs(length)
--paddingLeft_JetFormsCheckboxInput_default1: 1.2rem;

color: var(--text_JetFormsCheckboxInput_default1, var(--textDefault));

.form-checkbox, .form-switch {
  padding-top: var(--paddingTop_JetFormsCheckboxInput_default1);
  padding-right: var(--paddingRight_JetFormsCheckboxInput_default1);
  padding-bottom: var(--paddingBottom_JetFormsCheckboxInput_default1);
  padding-left: var(--paddingLeft_JetFormsCheckboxInput_default1);
  font-size: var(--fontSize_JetFormsCheckboxInput_default1);

  input:focus + .form-icon {
    box-shadow: 0 0 0 .1rem var(--outlineFocus_JetFormsCheckboxInput_default1);
  }
  input:checked+.form-icon,
  input:checked+.form-icon, .form-switch input:checked+.form-icon {
    background: var(--background_JetFormsCheckboxInput_default1);
    border-color: var(--background_JetFormsCheckboxInput_default1);
  }
}

.pristine-error {
  color: var(--error_JetFormsCheckboxInput_default1);
  margin-top: 0;
}
```
