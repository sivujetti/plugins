import createInputBlockType from './InputBlockType.jsx';

const emailInputBlockType = createInputBlockType({
    name: 'EmailInput',
    friendlyName: 'Email input (JetForms)',
    type: 'email',
    icon: 'at',
});

export default emailInputBlockType;