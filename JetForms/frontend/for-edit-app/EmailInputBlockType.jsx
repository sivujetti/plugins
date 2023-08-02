import {__} from '@sivujetti-commons-for-edit-app';
import createInputBlockType from './InputBlockType.jsx';

const emailInputBlockType = createInputBlockType({
    name: 'EmailInput',
    friendlyName: 'Email input (JetForms)',
    defaultPlaceholder: __('Email'),
    type: 'email',
    icon: 'at',
});

export default emailInputBlockType;