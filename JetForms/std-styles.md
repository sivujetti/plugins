# Standard style units

"Standard" stylis/scss styles for each block type of JetForms plugin.

## JetFormsContactForm

Order | Name | Derivable | Default
--- | --- | --- | ---
1 | Default | yes | yes

### Default

```scss
// @exportAs(length)
--gap_JetFormsContactForm_default1: 0.4rem;

[class^="j-JetForms"] {
  margin-bottom: var(--gap_JetFormsContactForm_default1);
}
```

## JetFormsEmailInput

Order | Name | Derivable | Default
--- | --- | --- | ---
1 | Default | yes | yes

### Default

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
--border_JetFormsEmailInput_default1: #00000022;
// @exportAs(length)
--radius_JetFormsEmailInput_default1: 4px;
// @exportAs(color)
--text_JetFormsEmailInput_default1: #333;
// @exportAs(color)
--placeholder_JetFormsEmailInput_default1: #00000044;

color: var(--text_JetFormsEmailInput_default1, var(--textDefault));

input {
  height: initial;
  padding: var(--paddingYInput_JetFormsEmailInput_default1) var(--paddingXInput_JetFormsEmailInput_default1);
  font-size: var(--fontSize_JetFormsEmailInput_default1);
  background-color: var(--background_JetFormsEmailInput_default1);
  border-color: var(--border_JetFormsEmailInput_default1);
  border-radius: var(--radius_JetFormsEmailInput_default1);
  &::placeholder {
    color: var(--placeholder_JetFormsEmailInput_default1);
  }
}
```

## JetFormsSelectInput

Order | Name | Derivable | Default
--- | --- | --- | ---
1 | Default | yes | yes

### Default

```scss
// @exportAs(length)
--fontSize_JetFormsSelectInput_default: 0.8rem;
// @exportAs(length)
--paddingYInput_JetFormsSelectInput_default: 0.4rem;
// @exportAs(length)
--paddingXInput_JetFormsSelectInput_default: 0.5rem;
// @exportAs(color)
--background_JetFormsSelectInput_default: #ffffff00;
// @exportAs(color)
--border_JetFormsSelectInput_default: #00000022;
// @exportAs(length)
--radius_JetFormsSelectInput_default: 4px;
// @exportAs(color)
--text_JetFormsSelectInput_default: #333;
// @exportAs(color)
--placeholder_JetFormsSelectInput_default: #00000044;

color: var(--text_JetFormsSelectInput_default, var(--textDefault));

select {
  height: unset;
  padding: var(--paddingYInput_JetFormsSelectInput_default) var(--paddingXInput_JetFormsSelectInput_default);
  font-size: var(--fontSize_JetFormsSelectInput_default);
  background-color: var(--background_JetFormsSelectInput_default);
  border-color: var(--border_JetFormsSelectInput_default);
  border-radius: var(--radius_JetFormsSelectInput_default);
  &::placeholder {
    color: var(--placeholder_JetFormsSelectInput_default);
  }
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
--border_JetFormsTextInput_default1: #00000022;
// @exportAs(length)
--radius_JetFormsTextInput_default1: 4px;
// @exportAs(color)
--text_JetFormsTextInput_default1: #333;
// @exportAs(color)
--placeholder_JetFormsTextInput_default1: #00000044;

color: var(--text_JetFormsTextInput_default1, var(--textDefault));

input {
  height: initial;
  padding: var(--paddingYInput_JetFormsTextInput_default1) var(--paddingXInput_JetFormsTextInput_default1);
  font-size: var(--fontSize_JetFormsTextInput_default1);
  background-color: var(--background_JetFormsTextInput_default1);
  border-color: var(--border_JetFormsTextInput_default1);
  border-radius: var(--radius_JetFormsTextInput_default1);
  &::placeholder {
    color: var(--placeholder_JetFormsTextInput_default1);
  }
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
--border_JetFormsTextareaInput_default1: #00000022;
// @exportAs(length)
--radius_JetFormsTextareaInput_default1: 4px;
// @exportAs(color)
--text_JetFormsTextareaInput_default1: #333;
// @exportAs(color)
--placeholder_JetFormsTextareaInput_default1: #00000044;

color: var(--text_JetFormsTextareaInput_default1, var(--textDefault));

textarea {
  padding: var(--paddingYInput_JetFormsTextareaInput_default1) var(--paddingXInput_JetFormsTextareaInput_default1);
  font-size: var(--fontSize_JetFormsTextareaInput_default1);
  background-color: var(--background_JetFormsTextareaInput_default1);
  border-color: var(--border_JetFormsTextareaInput_default1);
  border-radius: var(--radius_JetFormsTextareaInput_default1);
  &::placeholder {
    color: var(--placeholder_JetFormsTextareaInput_default1);
  }
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
// @exportAs(length)
--paddingTop_JetFormsCheckboxInput_default1: 0.1rem;
// @exportAs(length)
--paddingRight_JetFormsCheckboxInput_default1: 0.4rem;
// @exportAs(length)
--paddingBottom_JetFormsCheckboxInput_default1: 0.1rem;
// @exportAs(length)
--paddingLeft_JetFormsCheckboxInput_default1: 1.2rem;
// @exportAs(color)
--text_JetFormsCheckboxInput_default1: #333;

color: var(--text_JetFormsCheckboxInput_default1, var(--textDefault));

.form-checkbox, .form-switch {
  padding: var(--paddingTop_JetFormsCheckboxInput_default1) var(--paddingRight_JetFormsCheckboxInput_default1) var(--paddingBottom_JetFormsCheckboxInput_default1) var(--paddingLeft_JetFormsCheckboxInput_default1);
  font-size: var(--fontSize_JetFormsCheckboxInput_default1);
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
// @exportAs(length)
--paddingTop_JetFormsRadioGroupInput_default1: 0.1rem;
// @exportAs(length)
--paddingRight_JetFormsRadioGroupInput_default1: 0.4rem;
// @exportAs(length)
--paddingBottom_JetFormsRadioGroupInput_default1: 0.1rem;
// @exportAs(length)
--paddingLeft_JetFormsRadioGroupInput_default1: 1.2rem;

// @exportAs(color)
--textOptions_JetFormsRadioGroupInput_default1: #333;
// @exportAs(color)
--text_JetFormsRadioGroupInput_default1: #333;

color: var(--text_JetFormsRadioGroupInput_default1, var(--textDefault));

.form-radio {
  padding: var(--paddingTop_JetFormsRadioGroupInput_default1) var(--paddingRight_JetFormsRadioGroupInput_default1) var(--paddingBottom_JetFormsRadioGroupInput_default1) var(--paddingLeft_JetFormsRadioGroupInput_default1);
  font-size: var(--fontSize_JetFormsRadioGroupInput_default1);
  color: var(--textOptions_JetFormsRadioGroupInput_default1, var(--textDefault));
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
--border_JetFormsNumberInput_default1: #00000022;
// @exportAs(length)
--radius_JetFormsNumberInput_default1: 4px;
// @exportAs(color)
--text_JetFormsNumberInput_default1: #333;
// @exportAs(color)
--placeholder_JetFormsNumberInput_default1: #00000044;

color: var(--text_JetFormsNumberInput_default1, var(--NumberDefault));

input {
  height: initial;
  padding: var(--paddingYInput_JetFormsNumberInput_default1) var(--paddingXInput_JetFormsNumberInput_default1);
  font-size: var(--fontSize_JetFormsNumberInput_default1);
  background-color: var(--background_JetFormsNumberInput_default1);
  border-color: var(--border_JetFormsNumberInput_default1);
  border-radius: var(--radius_JetFormsNumberInput_default1);
  &::placeholder {
    color: var(--placeholder_JetFormsNumberInput_default1);
  }
}
```
