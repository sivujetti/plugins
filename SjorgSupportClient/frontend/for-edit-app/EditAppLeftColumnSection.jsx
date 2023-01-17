import {__, env, http, Icon, LoadingSpinner, floatingDialog} from '@sivujetti-commons-for-edit-app';
import RenderArticleDialog, {supportServerBaseUrl} from './RenderArticleDialog.jsx';

/**
 * SjorgSupporClient's main main menu section.
 */
class EditAppLeftColumnSection extends preact.Component {
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
            content = <LoadingSpinner className="mb-1"/>;
        else
            content = featuredArticles.map(art =>
                <div class="mt-1">
                    <a
                        href={ `#${art.slug}` }
                        onClick={ e => this.openArticleToPopup(e, art) }>
                        { art.title }
                    </a>
                </div>
            );
        return <section class={ `panel-section${isCollapsed ? '' : ' open'}` }>
            <button
                class="flex-centered pr-2 pl-1 section-title col-12"
                onClick={ this.toggleIsCollapsed.bind(this) }
                type="button">
                <Icon iconId="lifebuoy" className="p-absolute size-sm mr-2 color-purple"/>
                <span class="pl-1 d-block col-12 color-default">
                    { __('Support') }
                    <span class="text-ellipsis text-tiny col-12">{ __('Instructions') }</span>
                </span>
                <Icon iconId="chevron-right" className="p-absolute size-xs"/>
            </button>
            <div>
                { content }
                <div class="pt-2"><a
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
            http.get(`${supportServerBaseUrl}plugins/sjorg-support-server/articles/featured`, {headers: {}})
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

export default EditAppLeftColumnSection;
