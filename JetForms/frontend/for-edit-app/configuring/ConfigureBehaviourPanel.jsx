import {api} from '@sivujetti-commons-for-edit-app';
import createRunCaptchaPseudoBehaviourConfigurer from './RunCaptchaPseudoBehaviourConfigurer.jsx';
import createSendFormBehaviourConfigurerImpl from './SendFormBehaviourConfigurer.jsx';
import createShowSentMessageBehaviourConfigurerImpl from './ShowSentMessageBehaviourConfigurer.jsx';
import createStoreSubmissionToLocalDbBehaviourConfigurerImpl from './StoreSubmissionToLocalDbBehaviourConfigurer.jsx';

const customBehaviourImpls = new Map;

class ConfigureBehaviourPanel extends preact.Component {
    /**
     * @param {ConfigureBehaviourPanelProps} props
     * @access protected
     */
    componentWillReceiveProps(props) {
        if (props.behaviour && !this.state.Renderer) {
            const ir = getBehaviourConfigurerImpl(props.behaviour.name);
            const Renderer = ir ? ir.configurerCls : null;
            if (Renderer) {
                this.setState({Renderer});
                api.inspectorPanel.getOuterEl().scrollTo({top: 0});
            }
        } else if (this.state.Renderer && !props.behaviour) {
            this.setState({Renderer: null});
        }
    }
    /**
     * @access protected
     */
    render({behaviour, panelHeight, cssClass, endEditMode, onConfigurationChanged, block}, {Renderer}) {
        return <div class={ cssClass } style={ `top: -${panelHeight + 8}px` }>{ Renderer ? [
            <button onClick={ endEditMode } class="btn btn-sm" type="button"> &lt; </button>,
            <div class="form-horizontal pt-0">
                <Renderer { ...behaviour.data } onConfigurationChanged={ onConfigurationChanged } block={ block }/>
            </div>
        ] : null }</div>;
    }
}

/**
 * @param {Behaviour} behaviour = null
 * @param {string} leftClass = ''
 * @param {string} rightClass = ''
 * @returns {{behaviour: Behaviour|null; leftClass: string; rightClass: string;}}
 */
function createEditPanelState(behaviour = null, leftClass = '', rightClass = '') {
    return {behaviour, leftClass, rightClass};
}

/**
 * @param {string} behaviourName
 * @returns {BehaviourConfigurerImpl|null}
 */
function getBehaviourConfigurerImpl(behaviourName) {
    const custom = customBehaviourImpls.get(behaviourName);
    if (custom) return custom;

    if (behaviourName === 'RunCaptchaTest')
        return createRunCaptchaPseudoBehaviourConfigurer();
    if (behaviourName === 'SendMail')
        return createSendFormBehaviourConfigurerImpl();
    if (behaviourName === 'StoreSubmissionToLocalDb')
        return createStoreSubmissionToLocalDbBehaviourConfigurerImpl();
    if (behaviourName === 'ShowSentMessage')
        return createShowSentMessageBehaviourConfigurerImpl();

    return null;
}

export default ConfigureBehaviourPanel;
export {createEditPanelState, getBehaviourConfigurerImpl, customBehaviourImpls};
