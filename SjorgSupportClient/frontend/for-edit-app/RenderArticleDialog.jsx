import {__} from '@sivujetti-commons-for-edit-app';
import Tabs from '../../../../../frontend/edit-app/src/commons/Tabs.jsx';

const supportServerBaseUrl = 'https://www.sivujetti.org/early-access/';
const supportServerAssetBaseUrl = supportServerBaseUrl;

class RenderArticleDialog extends preact.Component {
    /**
     * @access protected
     */
    render({article}) {
        return <form onSubmit={ this.closePopup.bind(this) } class="sjorg-support-article">
            <div>{ article.blocks.map(renderSection) }</div>
            <button class="btn btn-primary mt-8">Ok</button>
        </form>;
    }
    /**
     * @access private
     */
    closePopup(e) {
        e.preventDefault();
        this.props.floatingDialog.close();
    }
}

/**
 * @param {RawBlock} block
 * @returns {preact.Component}
 */
function renderSection(block) {
    return <section class={ block.styleClasses }>{ block.children.map(renderBlock) }</section>;
}

/**
 * @param {RawBlock} block
 * @returns {preact.Component}
 */
function renderBlock(block) {
    if (block.type === 'Text' || block.type === 'RichText')
        return <div dangerouslySetInnerHTML={ {__html: block.html} } class={ block.styleClasses }></div>;
    else if (block.type === 'Image')
        return <img src={ `${supportServerAssetBaseUrl}public/uploads/${block.src}` } class={ block.styleClasses } title=""/>;
    else if (block.type === 'Section')
        return renderSection(block);
    else if (block.type === 'Code' && block.code.startsWith('<ul class="tab'))
        return <div class="color-dimmed3" style="margin: -1rem 0px 1.4rem;"><Tabs
            links={ extractTabLinks(block.code).map(el => el.textContent) }
            onTabChanged={ toIdx => handleTabChanged(toIdx, 0) }
            className="text-small"/>
        </div>;
    else if (block.type === 'Paragraph')
        return <p dangerouslySetInnerHTML={ {__html: block.text} } class={ block.styleClasses }></p>;
    else if (block.type === 'Heading') {
        const T = `h${block.level}`;
        return <T class={ block.styleClasses }>{ block.text }</T>;
    }
}

/**
 * @param {String} html
 * @returns {Array<HTMLAnchorElement>}
 */
function extractTabLinks(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return Array.from(temp.querySelectorAll('li.tab-item a'));
}

/**
 * @param {Number} toIdx
 * @param {Number} tabGroup
 */
function handleTabChanged(toIdx, tabGroup) {
    if (tabGroup !== 0) throw new Error('Not implemented');
    const tabLiEls = Array.from(document.querySelectorAll('.sjorg-support-article li.tab-item'));
    if (tabLiEls[toIdx].classList.contains('active')) return;
    tabLiEls.forEach(el => el.classList.remove('active'));
    tabLiEls[toIdx].classList.add('active');
    const tablContentEls = Array.from(document.querySelectorAll('.sjorg-support-article .tab-content'));
    tablContentEls.forEach(el => el.classList.add('d-none'));
    tablContentEls[toIdx].classList.remove('d-none');
}

export default RenderArticleDialog;
export {supportServerBaseUrl};
