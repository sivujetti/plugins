import {__} from '@sivujetti-commons-for-edit-app';
import createInputBlockType from './common/InputBlockType.jsx';

const numberInputBlockType = createInputBlockType({
    name: 'NumberInput',
    friendlyName: 'Number input (JetForms)',
    defaultPlaceholder: __('Number'),
    icon: 'number-1',
});

export default numberInputBlockType;