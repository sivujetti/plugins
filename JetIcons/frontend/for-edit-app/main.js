import {api} from '@sivujetti-commons-for-edit-app';
import IconBlockType from './IconBlockType.jsx';

api.blockTypes.register(IconBlockType.name, () => IconBlockType);
