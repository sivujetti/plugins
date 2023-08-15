# Standard style units

"Standard" stylis/scss styles for each block type of JetForms plugin.

## JetFormsContactForm

Order | Name | Derivable | Default
--- | --- | --- | ---
1 | Base template | yes | yes

### Base template

```scss
// @exportAs(length)
--gap_JetFormsContactForm_default1: 0.4rem;

&.sent-and-processed {
  .sent-message {
    font-weight: bold;
    margin-bottom: 1rem;
  }
}

[class^="j-JetForms"] {
  margin-bottom: var(--gap_JetFormsContactForm_default1);
}
```

## JetFormsEmailInput

Order | Name | Derivable | Default
--- | --- | --- | ---
1 | Base template | yes | yes

### Base template

```scss
// @exportAs(length)
--fontSize_JetFormsEmailInput_default1: 0.8rem;
// @exportAs(length)
--paddingYInput_JetFormsEmailInput_default1: 0.4rem;
// @exportAs(length)
--paddingXInput_JetFormsEmailInput_default1: 0.5rem;
// @exportAs(color)
--background_JetFormsEmailInput_default1: #ffffff00;
// @exportAs(color)
--borderNormal_JetFormsEmailInput_default1: #00000022;
// @exportAs(color)
--borderFocus_JetFormsEmailInput_default1: #00000033;
// @exportAs(color)
--outlineFocus_JetFormsEmailInput_default1: #7f7f7f33;
// @exportAs(length)
--radius_JetFormsEmailInput_default1: 4px;
// @exportAs(color)
--text_JetFormsEmailInput_default1: #333;
// @exportAs(color)
--placeholder_JetFormsEmailInput_default1: #00000044;
// @exportAs(color)
--error_JetFormsEmailInput_default1: #eb8d5a;

color: var(--text_JetFormsEmailInput_default1, var(--textDefault));

input {
  height: initial;
  padding-top: var(--paddingYInput_JetFormsEmailInput_default1);
  padding-right: var(--paddingXInput_JetFormsEmailInput_default1);
  padding-bottom: var(--paddingYInput_JetFormsEmailInput_default1);
  padding-left: var(--paddingXInput_JetFormsEmailInput_default1);
  font-size: var(--fontSize_JetFormsEmailInput_default1);
  background-color: var(--background_JetFormsEmailInput_default1);
  border-color: var(--borderNormal_JetFormsEmailInput_default1);
  border-radius: var(--radius_JetFormsEmailInput_default1);
  color: inherit;
  &:focus {
    border-color: var(--borderFocus_JetFormsEmailInput_default1);
    box-shadow: 0 0 0 0.1rem var(--outlineFocus_JetFormsEmailInput_default1);
  }
  &::placeholder {
    color: var(--placeholder_JetFormsEmailInput_default1);
  }
}

.pristine-error {
  color: var(--error_JetFormsEmailInput_default1);
  margin-top: 0;
}
```

## JetFormsSelectInput

Order | Name | Derivable | Default
--- | --- | --- | ---
1 | Base template | yes | yes

### Base template

```scss
// @exportAs(length)
--fontSize_JetFormsSelectInput_default1: 0.8rem;
// @exportAs(length)
--paddingYInput_JetFormsSelectInput_default1: 0.4rem;
// @exportAs(length)
--paddingXInput_JetFormsSelectInput_default1: 0.5rem;
// @exportAs(color)
--background_JetFormsSelectInput_default1: #ffffff00;
// @exportAs(color)
--borderNormal_JetFormsSelectInput_default1: #00000022;
// @exportAs(color)
--borderFocus_JetFormsSelectInput_default1: #00000033;
// @exportAs(color)
--outlineFocus_JetFormsSelectInput_default1: #7f7f7f33;
// @exportAs(length)
--radius_JetFormsSelectInput_default1: 4px;
// @exportAs(color)
--text_JetFormsSelectInput_default1: #333;
// @exportAs(color)
--placeholder_JetFormsSelectInput_default1: #00000044;
// @exportAs(color)
--error_JetFormsSelectInput_default1: #eb8d5a;

color: var(--text_JetFormsSelectInput_default1, var(--textDefault));

select {
  height: unset;
  padding-top: var(--paddingYInput_JetFormsSelectInput_default1);
  padding-right: var(--paddingXInput_JetFormsSelectInput_default1);
  padding-bottom: var(--paddingYInput_JetFormsSelectInput_default1);
  padding-left: var(--paddingXInput_JetFormsSelectInput_default1);
  font-size: var(--fontSize_JetFormsSelectInput_default1);
  background-color: var(--background_JetFormsSelectInput_default1);
  border-color: var(--borderNormal_JetFormsSelectInput_default1);
  border-radius: var(--radius_JetFormsSelectInput_default1);
  color: inherit;
  &:focus {
    border-color: var(--borderFocus_JetFormsSelectInput_default1);
    box-shadow: 0 0 0 0.1rem var(--outlineFocus_JetFormsSelectInput_default1);
  }
  &::placeholder {
    color: var(--placeholder_JetFormsSelectInput_default1);
  }
}

.pristine-error {
  color: var(--error_JetFormsSelectInput_default1);
  margin-top: 0;
}
```

## JetFormsTextInput

Order | Name | Derivable | Default
--- | --- | --- | ---
1 | Default | yes | yes

### Default

```scss
// @exportAs(length)
--fontSize_JetFormsTextInput_default1: 0.8rem;
// @exportAs(length)
--paddingYInput_JetFormsTextInput_default1: 0.4rem;
// @exportAs(length)
--paddingXInput_JetFormsTextInput_default1: 0.5rem;
// @exportAs(color)
--background_JetFormsTextInput_default1: #ffffff00;
// @exportAs(color)
--borderNormal_JetFormsTextInput_default1: #00000022;
// @exportAs(color)
--borderFocus_JetFormsTextInput_default1: #00000033;
// @exportAs(color)
--outlineFocus_JetFormsTextInput_default1: #7f7f7f33;
// @exportAs(length)
--radius_JetFormsTextInput_default1: 4px;
// @exportAs(color)
--text_JetFormsTextInput_default1: #333;
// @exportAs(color)
--placeholder_JetFormsTextInput_default1: #00000044;
// @exportAs(color)
--error_JetFormsTextInput_default1: #eb8d5a;

color: var(--text_JetFormsTextInput_default1, var(--textDefault));

input {
  height: initial;
  padding-top: var(--paddingYInput_JetFormsTextInput_default1);
  padding-right: var(--paddingXInput_JetFormsTextInput_default1);
  padding-bottom: var(--paddingYInput_JetFormsTextInput_default1);
  padding-left: var(--paddingXInput_JetFormsTextInput_default1);
  font-size: var(--fontSize_JetFormsTextInput_default1);
  background-color: var(--background_JetFormsTextInput_default1);
  border-color: var(--borderNormal_JetFormsTextInput_default1);
  border-radius: var(--radius_JetFormsTextInput_default1);
  color: inherit;
  &:focus {
    border-color: var(--borderFocus_JetFormsTextInput_default1);
    box-shadow: 0 0 0 0.1rem var(--outlineFocus_JetFormsTextInput_default1);
  }
  &::placeholder {
    color: var(--placeholder_JetFormsTextInput_default1);
  }
}

.pristine-error {
  color: var(--error_JetFormsTextInput_default1);
  margin-top: 0;
}
```

## JetFormsTextareaInput

Order | Name | Derivable | Default
--- | --- | --- | ---
1 | Default | yes | yes

### Default

```scss
// @exportAs(length)
--fontSize_JetFormsTextareaInput_default1: 0.8rem;
// @exportAs(length)
--paddingYInput_JetFormsTextareaInput_default1: 0.4rem;
// @exportAs(length)
--paddingXInput_JetFormsTextareaInput_default1: 0.5rem;
// @exportAs(color)
--background_JetFormsTextareaInput_default1: #ffffff00;
// @exportAs(color)
--borderNormal_JetFormsTextareaInput_default1: #00000022;
// @exportAs(color)
--borderFocus_JetFormsTextareaInput_default1: #00000033;
// @exportAs(color)
--outlineFocus_JetFormsTextareaInput_default1: #7f7f7f33;
// @exportAs(length)
--radius_JetFormsTextareaInput_default1: 4px;
// @exportAs(color)
--text_JetFormsTextareaInput_default1: #333;
// @exportAs(color)
--placeholder_JetFormsTextareaInput_default1: #00000044;
// @exportAs(color)
--error_JetFormsTextareaInput_default1: #eb8d5a;

color: var(--text_JetFormsTextareaInput_default1, var(--textDefault));

textarea {
  padding-top: var(--paddingYInput_JetFormsTextareaInput_default1);
  padding-right: var(--paddingXInput_JetFormsTextareaInput_default1);
  padding-bottom: var(--paddingYInput_JetFormsTextareaInput_default1);
  padding-left: var(--paddingXInput_JetFormsTextareaInput_default1);
  font-size: var(--fontSize_JetFormsTextareaInput_default1);
  background-color: var(--background_JetFormsTextareaInput_default1);
  border-color: var(--borderNormal_JetFormsTextareaInput_default1);
  border-radius: var(--radius_JetFormsTextareaInput_default1);
  color: inherit;
  &:focus {
    border-color: var(--borderFocus_JetFormsTextareaInput_default1);
    box-shadow: 0 0 0 0.1rem var(--outlineFocus_JetFormsTextareaInput_default1);
  }
  &::placeholder {
    color: var(--placeholder_JetFormsTextareaInput_default1);
  }
}

.pristine-error {
  color: var(--error_JetFormsTextareaInput_default1);
  margin-top: 0;
}
```

## JetFormsCheckboxInput

Order | Name | Derivable | Default
--- | --- | --- | ---
1 | Default | yes | yes

### Default

```scss
// @exportAs(length)
--fontSize_JetFormsCheckboxInput_default1: 0.8rem;
// @exportAs(color)
--text_JetFormsCheckboxInput_default1: #333;
// @exportAs(color)
--outlineFocus_JetFormsCheckboxInput_default1: #2f4b5c33;
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
}

.pristine-error {
  color: var(--error_JetFormsCheckboxInput_default1);
  margin-top: 0;
}
```

## JetFormsRadioGroupInput

Order | Name | Derivable | Default
--- | --- | --- | ---
1 | Default | yes | yes

### Default

```scss
// @exportAs(length)
--fontSize_JetFormsRadioGroupInput_default1: 0.8rem;
// @exportAs(color)
--textOptions_JetFormsRadioGroupInput_default1: #333;
// @exportAs(color)
--text_JetFormsRadioGroupInput_default1: #333;
// @exportAs(color)
--outlineFocus_JetFormsRadioGroupInput_default1: #2f4b5c33;
// @exportAs(color)
--error_JetFormsRadioGroupInput_default1: #eb8d5a;
// @exportAs(length)
--paddingTop_JetFormsRadioGroupInput_default1: 0.1rem;
// @exportAs(length)
--paddingRight_JetFormsRadioGroupInput_default1: 0.4rem;
// @exportAs(length)
--paddingBottom_JetFormsRadioGroupInput_default1: 0.1rem;
// @exportAs(length)
--paddingLeft_JetFormsRadioGroupInput_default1: 1.2rem;

color: var(--text_JetFormsRadioGroupInput_default1, var(--textDefault));

.form-radio {
  padding-top: var(--paddingTop_JetFormsRadioGroupInput_default1);
  padding-right: var(--paddingRight_JetFormsRadioGroupInput_default1);
  padding-bottom: var(--paddingBottom_JetFormsRadioGroupInput_default1);
  padding-left: var(--paddingLeft_JetFormsRadioGroupInput_default1);
  font-size: var(--fontSize_JetFormsRadioGroupInput_default1);
  color: var(--textOptions_JetFormsRadioGroupInput_default1, var(--textDefault));

  input:focus + .form-icon {
    box-shadow: 0 0 0 .1rem var(--outlineFocus_JetFormsRadioGroupInput_default1);
  }
}

.pristine-error {
  color: var(--error_JetFormsRadioGroupInput_default1);
  margin-top: 0;
}
```

## JetFormsNumberInput

Order | Name | Derivable | Default
--- | --- | --- | ---
1 | Default | yes | yes

### Default

```scss
// @exportAs(length)
--fontSize_JetFormsNumberInput_default1: 0.8rem;
// @exportAs(length)
--paddingYInput_JetFormsNumberInput_default1: 0.4rem;
// @exportAs(length)
--paddingXInput_JetFormsNumberInput_default1: 0.5rem;
// @exportAs(color)
--background_JetFormsNumberInput_default1: #ffffff00;
// @exportAs(color)
--borderNormal_JetFormsNumberInput_default1: #00000022;
// @exportAs(color)
--borderFocus_JetFormsNumberInput_default1: #00000033;
// @exportAs(color)
--outlineFocus_JetFormsNumberInput_default1: #7f7f7f33;
// @exportAs(length)
--radius_JetFormsNumberInput_default1: 4px;
// @exportAs(color)
--text_JetFormsNumberInput_default1: #333;
// @exportAs(color)
--placeholder_JetFormsNumberInput_default1: #00000044;
// @exportAs(color)
--error_JetFormsNumberInput_default1: #eb8d5a;

color: var(--text_JetFormsNumberInput_default1, var(--NumberDefault));

input {
  height: initial;
  padding-top: var(--paddingYInput_JetFormsNumberInput_default1);
  padding-right: var(--paddingXInput_JetFormsNumberInput_default1);
  padding-bottom: var(--paddingYInput_JetFormsNumberInput_default1);
  padding-left: var(--paddingXInput_JetFormsNumberInput_default1);
  font-size: var(--fontSize_JetFormsNumberInput_default1);
  background-color: var(--background_JetFormsNumberInput_default1);
  border-color: var(--borderNormal_JetFormsNumberInput_default1);
  border-radius: var(--radius_JetFormsNumberInput_default1);
  color: inherit;
  &:focus {
    border-color: var(--borderFocus_JetFormsNumberInput_default1);
    box-shadow: 0 0 0 0.1rem var(--outlineFocus_JetFormsNumberInput_default1);
  }
  &::placeholder {
    color: var(--placeholder_JetFormsNumberInput_default1);
  }
}

.pristine-error {
  color: var(--error_JetFormsNumberInput_default1);
  margin-top: 0;
}
```
