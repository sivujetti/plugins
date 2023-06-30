import {__} from '@sivujetti-commons-for-edit-app';

class ShowSentMessageBehaviourConfigurer extends preact.Component {
    /**
     * @param {{at: 'beforeFirstInput'; onConfigurationChanged: (vals: {[propName: String]: any;}) => void;}} props
     * @access protected
     */
    render(props) {
        return <p>{ JSON.stringify(props) }</p>;
    }
}

export default () => ({
    configurerLabel: __('näytä käyttäjälle viesti'),
    getButtonLabel(data) { return data.at === 'beforeFirstInput' ? __('lomakkeen yläpuolella') : '?'; },
    configurerCls: ShowSentMessageBehaviourConfigurer
});
