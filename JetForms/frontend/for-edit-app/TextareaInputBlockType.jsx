import createInputBlockType from './InputBlockType.jsx';

const textareaInputBlockType = createInputBlockType({
    name: 'TextareaInput',
    friendlyName: 'JetForms: Long text input',
    type: 'textarea',
    icon: 'box',
});

export default textareaInputBlockType;