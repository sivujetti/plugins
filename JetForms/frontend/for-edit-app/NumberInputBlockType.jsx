import createInputBlockType from './InputBlockType.jsx';

const numberInputBlockType = createInputBlockType({
    name: 'NumberInput',
    friendlyName: 'JetForms: Number input',
    type: 'input',
    icon: 'number-1',
    inputMode: 'numeric',
});

export default numberInputBlockType;