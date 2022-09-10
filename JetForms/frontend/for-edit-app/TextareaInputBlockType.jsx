import createInputBlockType from './InputBlockType.jsx';

const textareaInputBlockType = createInputBlockType({
    name: 'TextareaInput',
    friendlyName: 'Long text input (JetForms)',
    type: 'textarea',
    icon: 'writing',
});

export default textareaInputBlockType;