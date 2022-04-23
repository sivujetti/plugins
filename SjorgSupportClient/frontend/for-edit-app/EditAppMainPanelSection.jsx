import {__, Icon} from '@sivujetti-commons-for-edit-app';

/**
 * SjorgSupporClient's main main menu section.
 */
class EditAppMainPanelSection extends preact.Component {
    /**
     * @param {Object} props
     */
    constructor(props) {
        super(props);
        this.state = {isCollapsed: true};
    }
    /**
     * @access protected
     */
    render(_, {isCollapsed}) {
        return <section class={ `panel-section${isCollapsed ? '' : ' open'}` }>
            <button class="d-flex col-12 flex-centered pr-2" onClick={ this.toggleIsCollapsed.bind(this) }>
                <Icon iconId="lifebuoy" className="size-sm mr-2 color-purple"/>
                <span class="pl-1 color-default">{ __('Support') }</span>
                <Icon iconId="chevron-right" className="col-ml-auto size-xs"/>
            </button>
            <div>
                todo
            </div>
        </section>;
    }
    /**
     * @access private
     */
    toggleIsCollapsed() {
        this.setState({isCollapsed: !this.state.isCollapsed});
    }
}

export default EditAppMainPanelSection;
