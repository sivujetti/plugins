import createInputBlockType from './InputBlockType.jsx';

const emailInputBlockType = createInputBlockType({
    name: 'EmailInput',
    friendlyName: 'Email input',
    type: 'email',
    icon: 'box',
});

export default emailInputBlockType;