import {api} from '@sivujetti-commons-for-edit-app';
import createSendFormBehaviourConfigurerImpl from './SendFormBehaviourConfigurer.jsx';
import createStoreSubmissionToLocalDbBehaviourConfigurerImpl from './StoreSubmissionToLocalDbBehaviourConfigurer.jsx';
import createShowSentMessageBehaviourConfigurerImpl from './ShowSentMessageBehaviourConfigurer.jsx';

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
                api.inspectorPanel.getEl().scrollTo({top: 0});
            }
        } else if (this.state.Renderer && !props.behaviour) {
            this.setState({Renderer: null});
        }
    }
    /**
     * @access protected
     */
    render({behaviour, panelHeight, cssClass, endEditMode, onConfigurationChanged, blockCopy}, {Renderer}) {
        return <div class={ cssClass } style={ `top: -${panelHeight + 8}px` }>{ Renderer ? [
            <button onClick={ endEditMode } class="btn btn-sm" type="button"> &lt; </button>,
            <div class="form-horizontal pt-0">
                <Renderer { ...behaviour.data } onConfigurationChanged={ onConfigurationChanged } blockCopy={ blockCopy }/>
            </div>
        ] : null }</div>;
    }
}

/**
 * @param {Behaviour} behaviour = null
 * @param {String} leftClass = ''
 * @param {String} rightClass = ''
 * @returns {{behaviour: Behaviour|null; leftClass: String; rightClass: String;}}
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
    if (behaviourName === 'StoreSubmissionToLocalDb')
        return createStoreSubmissionToLocalDbBehaviourConfigurerImpl();
    if (behaviourName === 'ShowSentMessage')
        return createShowSentMessageBehaviourConfigurerImpl();

    return null;
}

export default ConfigureBehaviourPanel;
export {createEditPanelState, getBehaviourConfigurerImpl, customBehaviourImpls};
