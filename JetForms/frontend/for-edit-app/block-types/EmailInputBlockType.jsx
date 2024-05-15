import {__} from '@sivujetti-commons-for-edit-app';
import createInputBlockType from './common/InputBlockType.jsx';

const emailInputBlockType = createInputBlockType({
    name: 'EmailInput',
    friendlyName: 'Email input (JetForms)',
    defaultPlaceholder: __('Email'),
    icon: 'at',
});

export default emailInputBlockType;