import {__} from '@sivujetti-commons-for-edit-app';

class ShowSentMessageBehaviourConfigurer extends preact.Component {
    /**
     * @param {Object} props
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
