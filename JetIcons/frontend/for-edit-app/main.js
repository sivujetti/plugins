import {api} from '@sivujetti-commons-for-edit-app';
import IconBlockType from './IconBlockType.jsx';

api.blockTypes.register(IconBlockType.name, () => IconBlockType);

api.blockStyles.registerDefaultVars(IconBlockType.name, varNameToLabel => [
    {type: 'length', wrap: '', value: null,
        varName: 'size', label: varNameToLabel('size'), default: '1.2rem', args: [], __idx: -1},
    {type: 'color', wrap: '', value: null,
        varName: 'color', label: varNameToLabel('color'), default: '#111111ff', args: [], __idx: -1},
    {type: 'length', wrap: '', value: null,
        varName: 'strokeWidth', label: varNameToLabel('strokeWidth'), default: '2px', args: [], __idx: -1},
]);
