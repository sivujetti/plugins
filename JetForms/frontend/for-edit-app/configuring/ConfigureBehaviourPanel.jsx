import {api} from '@sivujetti-commons-for-edit-app';
import createSendFormBehaviourConfigurerImpl from './SentFormBehaviourConfigurerTemp.jsx';
import createShowSentMessageBehaviourConfigurerImpl from './ShowSentMessageBehaviourConfigurer.jsx';

const customBehaviourImpls = new Map;

class ConfigureBehaviourPanel extends preact.Component {
    /**
     * @param {{behaviour: Behaviour; cssClass: String; onConfigurationChanged: (vals: {[propName: String]: any;}) => void; endEditMode: () => void; panelHeight: Number;}} props
     * @access protected
     */
    componentWillReceiveProps(props) {
        if (props.behaviour && !this.state.Renderer) {
            const ir = getBehaviourConfigurerImpl(props.behaviour.name);
            const Renderer = ir ? ir.configurerCls : null;
            if (Renderer) {
                this.setState({Renderer});
                api.inspectorPanel.getEl().scrollTo({top: 0});
            }
        } else if (this.state.Renderer && !props.behaviour) {
            this.setState({Renderer: null});
        }
    }
    /**
     * @access protected
     */
    render({behaviour, panelHeight, cssClass, endEditMode, onConfigurationChanged}, {Renderer}) {
        return <div class={ cssClass } style={ `top: -${panelHeight + 8}px` }>{ Renderer ? [
            <button onClick={ endEditMode } class="btn btn-sm" type="button"> &lt; </button>,
            <div class="form-horizontal pt-0">
                <Renderer { ...behaviour.data } onConfigurationChanged={ onConfigurationChanged }/>
            </div>
        ] : null }</div>;
    }
}

/**
 * @param {Behaviour} behaviour = null
 * @param {String} leftClass = ''
 * @param {String} rightClass = ''
 * @returns {{behaviour: null; leftClass: String; rightClass: String;}}
 */
function createEditPanelState(behaviour = null, leftClass = '', rightClass = '') {
    return {behaviour, leftClass, rightClass};
}

/**
 * @param {String} behaviourName
 * @returns {BehaviourConfigurerImpl|null}
 */
function getBehaviourConfigurerImpl(behaviourName) {
    const custom = customBehaviourImpls.get(behaviourName);
    if (custom) return custom;

    if (behaviourName === 'SendMail')
        return createSendFormBehaviourConfigurerImpl();
    if (behaviourName === 'ShowSentMessage')
        return createShowSentMessageBehaviourConfigurerImpl();

    return null;
}

/**
 * @typedef Behaviour
 * @prop {String} name Example 'SendMail' or 'ShowSentMessage'
 * @prop {{[key: String]: any;}} data
 *
 * @typedef BehaviourConfigurerImpl
 * @prop {String} configurerLabel Example: 'näytä käyttäjälle viesti'
 * @prop {(data: {[key: String]: any;}) => String} getButtonLabel
 * @prop {preact.ComponentConstructor} configurerCls
 */

export default ConfigureBehaviourPanel;
export {createEditPanelState, getBehaviourConfigurerImpl, customBehaviourImpls};
