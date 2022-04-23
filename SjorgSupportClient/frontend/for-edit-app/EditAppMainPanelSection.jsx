import {__, env, http, Icon, floatingDialog} from '@sivujetti-commons-for-edit-app';
import LoadingSpinner from '../../../../../frontend/edit-app/src/commons/LoadingSpinner.jsx';
import RenderArticleDialog, {supportServerIndexUrl} from './RenderArticleDialog.jsx';

/**
 * SjorgSupporClient's main main menu section.
 */
class EditAppMainPanelSection extends preact.Component {
    /**
     * @param {Object} props
     */
    constructor(props) {
        super(props);
        this.state = {isCollapsed: true, featuredArticles: undefined};
    }
    /**
     * @access protected
     */
    render(_, {isCollapsed, featuredArticles}) {
        let content = null;
        if (featuredArticles === undefined)
            content = null;
        else if (featuredArticles === null)
            content = <LoadingSpinner className="pb-2"/>;
        else
            content = featuredArticles.map((art, i) =>
                <div class={ i > 0 ? 'mt-1' : '' }>
                    <a
                        href={ `#${art.slug}` }
                        onClick={ e => this.openArticleToPopup(e, art) }>
                        { art.title }
                    </a>
                </div>
            );
        return <section class={ `panel-section${isCollapsed ? '' : ' open'}` }>
            <button class="d-flex col-12 flex-centered pr-2" onClick={ this.toggleIsCollapsed.bind(this) }>
                <Icon iconId="lifebuoy" className="size-sm mr-2 color-purple"/>
                <span class="pl-1 color-default">{ __('Support') }</span>
                <Icon iconId="chevron-right" className="col-ml-auto size-xs"/>
            </button>
            <div>
                { content }
                <div><a
                    href="https://www.sivujetti.org/tuki"
                    onClick={ e => (e.preventDefault(), alert('This feature is currently disabled.')) }
                    class="with-icon mt-1">
                    <Icon iconId="question-mark" className="colored size-sm mr-2"/>
                    { __('Contact support') }
                </a></div>
            </div>
        </section>;
    }
    /**
     * @access private
     */
    toggleIsCollapsed() {
        const newState = {isCollapsed: !this.state.isCollapsed};
        if (newState.isCollapsed === false && this.state.featuredArticles === undefined) {
            newState.featuredArticles = null;
            http.fetchFn(`${supportServerIndexUrl}plugins/sjorg-support-server/articles/featured`,
                         {method: 'GET'})
                .then(resp => resp.json())
                .then(arts => this.setState({featuredArticles: arts}))
                .catch(env.window.console.error);
        }
        this.setState(newState);
    }
    /**
     * @param {Event} e
     * @param {Page} article
     * @access private
     */
    openArticleToPopup(e, article) {
        e.preventDefault();
        floatingDialog.open(RenderArticleDialog, {
            title: __(article.title),
        }, {
            floatingDialog,
            article,
        });
    }
}

export default EditAppMainPanelSection;
