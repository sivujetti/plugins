import {api} from '@sivujetti-commons-for-edit-app';
import ContactFormBlockType from './ContactFormBlockType.jsx';
import CheckboxInputBlockType from './CheckboxInputBlockType.jsx';
import EmailInputBlockType from './EmailInputBlockType.jsx';
import NumberInputBlockType from './NumberInputBlockType.jsx';
import SelectInputBlockType from './SelectInputBlockType.jsx';
import TextareaInputBlockType from './TextareaInputBlockType.jsx';
import TextInputBlockType from './TextInputBlockType.jsx';
import EditAppMainPanelSection from './EditAppMainPanelSection.jsx';

if (api.user.can('doAnything')) {
    api.mainPanel.registerSection('plugin:jetForms', EditAppMainPanelSection);
}
api.blockTypes.register(CheckboxInputBlockType.name, () => CheckboxInputBlockType);
api.blockTypes.register(ContactFormBlockType.name, () => ContactFormBlockType);
api.blockTypes.register(EmailInputBlockType.name, () => EmailInputBlockType);
api.blockTypes.register(NumberInputBlockType.name, () => NumberInputBlockType);
api.blockTypes.register(SelectInputBlockType.name, () => SelectInputBlockType);
api.blockTypes.register(TextareaInputBlockType.name, () => TextareaInputBlockType);
api.blockTypes.register(TextInputBlockType.name, () => TextInputBlockType);

setTimeout(() => {
    const el = document.createElement('style');
    el.setAttribute('data-injected-by', 'jet-forms-plugin');
    el.innerHTML = (
`h4, .h4 {
    font: 800 1rem/1rem "Fira Sans";
}
.button-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 1.4rem;
}
.button-options label {
    border-radius: 9px;
    border: 2px solid transparent;
    padding-top: .8rem;
}
.button-options label.selected {
    border: 2px solid var(--color-accent);
}
.button-options .form-icon {
    left: initial;
    right: 1rem;
    top: .8rem;
}
ul.table-list > li {
    border-bottom: 1px solid rgba(var(--components-color-fb-default),.14);
    margin: 0;
    padding: .4rem 0;
    display: flex;
    align-items: center;
}
.drag-handle {
    background: transparent;
    border: none;
    cursor: grab;
    color: var(--color-fg-dimmed);
}`
    );
    document.head.appendChild(el);
}, 900);
