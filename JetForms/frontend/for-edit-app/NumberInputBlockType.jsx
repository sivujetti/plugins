import createInputBlockType from './InputBlockType.jsx';

const numberInputBlockType = createInputBlockType({
    name: 'NumberInput',
    friendlyName: 'Number input (JetForms)',
    type: 'input',
    icon: 'number-1',
    inputMode: 'numeric',
});

export default numberInputBlockType;