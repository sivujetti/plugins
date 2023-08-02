import {__} from '@sivujetti-commons-for-edit-app';
import createInputBlockType from './InputBlockType.jsx';

const numberInputBlockType = createInputBlockType({
    name: 'NumberInput',
    friendlyName: 'Number input (JetForms)',
    defaultPlaceholder: __('Number'),
    type: 'input',
    icon: 'number-1',
    inputMode: 'numeric',
});

export default numberInputBlockType;