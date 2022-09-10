import createInputBlockType from './InputBlockType.jsx';

const textInputBlockType = createInputBlockType({
    name: 'TextInput',
    friendlyName: 'Short text input (JetForms)',
    type: 'text',
    icon: 'letter-t',
});

export default textInputBlockType;