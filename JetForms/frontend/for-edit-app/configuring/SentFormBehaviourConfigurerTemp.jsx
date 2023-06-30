import {__} from '@sivujetti-commons-for-edit-app';
import SendFormBehaviourConfigurer from './SendFormBehaviourConfigurer.jsx';

export default () => ({
    configurerLabel: __('lähetä lomakkeen tiedot sähköpostiosoitteeseen'),
    getButtonLabel(data) { return 'foo@bar.com'; },
    configurerCls: SendFormBehaviourConfigurer,
});
