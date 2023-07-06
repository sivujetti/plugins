import {__} from '@sivujetti-commons-for-edit-app';

class StoreSubmissionToLocalDbBehaviourConfigurer extends preact.Component {
    /**
     * @param {{onConfigurationChanged: (vals: {[propName: String]: any;}) => void;}} props
     * @access protected
     */
    render(_props) {
        return <p>Nothing to configure.</p>;
    }
}

export default () => ({
    configurerLabel: __('tallenna täytetyt tiedot tietokantaan'),
    getButtonLabel(_data) { return ''; },
    configurerCls: StoreSubmissionToLocalDbBehaviourConfigurer
});
