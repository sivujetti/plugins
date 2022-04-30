import createInputBlockType from './InputBlockType.jsx';

const emailInputBlockType = createInputBlockType({
    name: 'EmailInput',
    friendlyName: 'JetForms: Email input',
    type: 'email',
    icon: 'at',
});

export default emailInputBlockType;