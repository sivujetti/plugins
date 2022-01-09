import createInputBlockType from './InputBlockType.jsx';

const textInputBlockType = createInputBlockType({
    name: 'TextInput',
    friendlyName: 'Short text input',
    type: 'text',
    icon: 'box',
});

export default textInputBlockType;