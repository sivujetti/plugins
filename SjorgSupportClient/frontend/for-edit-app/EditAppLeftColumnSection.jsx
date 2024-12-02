import {
    __,
    env,
    floatingDialog,
    http,
    Icon,
    LoadingSpinner,
    MenuSection,
    urlUtils,
} from '@sivujetti-commons-for-edit-app';
import RenderArticleDialog, {supportServerBaseUrl} from './RenderArticleDialog.jsx';

/**
 * SjorgSupporClient's main main menu section.
 */
class EditAppLeftColumnSection extends  preact.Component {
    /**
     * @param {Object} props
     */
    constructor(props) {
        super(props);
        this.state = {featuredArticles: undefined};
    }
    /**
     * @access protected
     */
    render(_, {featuredArticles}) {
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
                        onClick={ e => openArticleToPopup(e, art) }>
                        { art.title }
                    </a>
                </div>
            );
        return <MenuSection
            title={ __('Support') }
            subtitle={ __('Instructions') }
            iconId="lifebuoy"
            colorClass="color-purple"
            onIsCollapsedChanged={ this.handleIsCollapsedChanged.bind(this)}>
            { content }
            <div class="pt-2"><a
                href="https://www.sivujetti.org/tuki"
                onClick={ e => (e.preventDefault(), alert('This feature is currently disabled.')) }
                class="with-icon mt-1">
                <Icon iconId="question-mark" className="colored size-xs mr-2"/>
                { __('Contact support') }
            </a></div>
        </MenuSection>;
    }
    /**
     * @param {boolean} to
     * @access private
     */
    async handleIsCollapsedChanged(to) {
        const doLoad = !to && this.state.featuredArticles === undefined;
        if (!doLoad) return;

        this.setState({featuredArticles: null});
        try {
            const arts = await http.get(
                urlUtils.withCacheBustStr(`${supportServerBaseUrl}plugins/sjorg-support-server/articles/featured`) +
                    '&sivujetti-version=0.16.0',
                {headers: {}, ...createCacheSetting()}
            );
            this.setState({featuredArticles: arts});
        } catch (err) {
            env.window.console.error(err);
        }
    }
}

/**
 * @returns {{cache: RequestCache;}}
 */
function createCacheSetting() {
    if (localStorage.sivujettiSjorgSupportArticleCacheBusted === '1')
        return {};
    localStorage.sivujettiSjorgSupportArticleCacheBusted = '1';
    return {cache: 'no-store'};
}

/**
 * @param {Event} e
 * @param {Page} article
 */
function openArticleToPopup(e, article) {
    e.preventDefault();
    floatingDialog.open(RenderArticleDialog, {
        title: __(article.title),
    }, {
        floatingDialog,
        article,
    });
}

export default EditAppLeftColumnSection;
