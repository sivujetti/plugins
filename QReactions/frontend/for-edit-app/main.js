import {api} from '@sivujetti-commons-for-edit-app';
import ReactionButtonsBlockType from './ReactionButtonsBlockType.jsx';

api.blockTypes.register(ReactionButtonsBlockType.name, () => ReactionButtonsBlockType);
