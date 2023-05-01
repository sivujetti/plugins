import {api} from '@sivujetti-commons-for-edit-app';
import ContactFormBlockType from './ContactFormBlockType.jsx';
import CheckboxInputBlockType from './CheckboxInputBlockType.jsx';
import EmailInputBlockType from './EmailInputBlockType.jsx';
import NumberInputBlockType from './NumberInputBlockType.jsx';
import RadioGroupInputBlockType from './RadioGroupInputBlockType.jsx';
import SelectInputBlockType from './SelectInputBlockType.jsx';
import TextareaInputBlockType from './TextareaInputBlockType.jsx';
import TextInputBlockType from './TextInputBlockType.jsx';
import EditAppLeftColumnSection from './EditAppLeftColumnSection.jsx';

if (api.user.can('doAnything')) {
    api.mainPanel.registerSection('plugin:jetForms', EditAppLeftColumnSection);
}
api.blockTypes.register(ContactFormBlockType.name, () => ContactFormBlockType);
api.blockTypes.register(TextInputBlockType.name, () => TextInputBlockType);
api.blockTypes.register(EmailInputBlockType.name, () => EmailInputBlockType);
api.blockTypes.register(SelectInputBlockType.name, () => SelectInputBlockType);
api.blockTypes.register(TextareaInputBlockType.name, () => TextareaInputBlockType);
api.blockTypes.register(CheckboxInputBlockType.name, () => CheckboxInputBlockType);
api.blockTypes.register(RadioGroupInputBlockType.name, () => RadioGroupInputBlockType);
api.blockTypes.register(NumberInputBlockType.name, () => NumberInputBlockType);

setTimeout(() => {
    const el = document.createElement('style');
    el.setAttribute('data-injected-by', 'jet-forms-plugin');
    el.innerHTML = (
`ul.table-list > li {
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
