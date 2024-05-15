import {api} from '@sivujetti-commons-for-edit-app';
import CheckboxInputBlockType from './block-types/CheckboxInputBlockType.jsx';
import ContactFormBlockType from './block-types/ContactFormBlockType.jsx';
import EditAppLeftColumnSection from './EditAppLeftColumnSection.jsx';
import EmailInputBlockType from './block-types/EmailInputBlockType.jsx';
import NumberInputBlockType from './block-types/NumberInputBlockType.jsx';
import RadioGroupInputBlockType from './block-types/RadioGroupInputBlockType.jsx';
import SelectInputBlockType from './block-types/SelectInputBlockType.jsx';
import TextareaInputBlockType from './block-types/TextareaInputBlockType.jsx';
import TextInputBlockType from './block-types/TextInputBlockType.jsx';

if (api.user.getRole() <= api.user.ROLE_EDITOR) {
    api.menuPanel.registerSection('plugin:jetForms', EditAppLeftColumnSection);
}
api.blockTypes.register(ContactFormBlockType.name, () => ContactFormBlockType);
api.blockTypes.register(TextInputBlockType.name, () => TextInputBlockType);
api.blockTypes.register(TextareaInputBlockType.name, () => TextareaInputBlockType);
api.blockTypes.register(EmailInputBlockType.name, () => EmailInputBlockType);
api.blockTypes.register(SelectInputBlockType.name, () => SelectInputBlockType);
api.blockTypes.register(CheckboxInputBlockType.name, () => CheckboxInputBlockType);
api.blockTypes.register(RadioGroupInputBlockType.name, () => RadioGroupInputBlockType);
api.blockTypes.register(NumberInputBlockType.name, () => NumberInputBlockType);

setTimeout(() => {
    const el = document.createElement('style');
    el.setAttribute('data-injected-by', 'jet-forms-plugin');
    el.innerHTML = (
`.drag-handle {
    background: transparent;
    border: none;
    cursor: grab;
    color: var(--color-fg-dimmed);
}
.table .formatted-answers {
    height: 2.7rem;
    white-space: pre;
    display: inline-flex;
    align-items: center;
    position: relative;
}
.table .formatted-answers a {
    position: absolute;
    padding: .1rem .1rem .1rem .2rem;
    background: #fff;
    bottom: -.1rem;
    right: 0;
    text-decoration: underline;
}
.table.table-striped .tr:nth-of-type(odd) .formatted-answers a {
    background: var(--color-table-row-odd);
}
`
    );
    document.head.appendChild(el);
}, 900);
