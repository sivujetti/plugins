import {__} from '@sivujetti-commons-for-edit-app';

class ShowSentMessageBehaviourConfigurer extends preact.Component {
    /**
     * @param {{at: 'beforeFirstInput'; onConfigurationChanged: (vals: {[propName: String]: any;}) => void;}} props
     * @access protected
     */
    render(_props) {
        return <select class="form-select" disabled>
            <option>Lomakkeen yläpuolella</option>
        </select>;
    }
}

export default () => ({
    configurerLabel: __('näytä käyttäjälle viesti'),
    getButtonLabel(data) { return data.at === 'beforeFirstInput' ? __('lomakkeen yläpuolella') : '?'; },
    configurerCls: ShowSentMessageBehaviourConfigurer
});
