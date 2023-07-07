import {__} from '@sivujetti-commons-for-edit-app';
import SendFormBehaviourConfigurer from './SendFormBehaviourConfigurer.jsx';

export default () => ({
    configurerLabel: __('lähetä täytetyt tiedot sähköpostiosoitteeseen'),
    getButtonLabel({toAddress}) { return toAddress; },
    configurerCls: SendFormBehaviourConfigurer,
});
