import {__, Tabs} from '@sivujetti-commons-for-edit-app';

const supportServerBaseUrl = 'https://www.sivujetti.org/';
const supportServerAssetBaseUrl = supportServerBaseUrl;

class RenderArticleDialog extends preact.Component {
    /**
     * @access protected
     */
    render({article}) {
        return <form onSubmit={ this.closePopup.bind(this) } class="sjorg-support-article text-prose">
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
 * @param {Block} block
 * @returns {preact.VNode}
 */
function renderSection(block) {
    const Tag = block.type === 'Wrapper' ? 'div' : 'section';
    return <Tag class={ block.styleClasses }>{ block.children.map(renderBlock) }</Tag>;
}

/**
 * @param {Block} block
 * @returns {preact.VNode}
 */
function renderBlock(block) {
    if (block.type === 'Text')
        return renderHtml(block.html, block.styleClasses);
    else if (block.type === 'Image')
        return <img src={ `${supportServerAssetBaseUrl}public/uploads/${block.src}` } class={ block.styleClasses } title=""/>;
    else if (block.type === 'Section' || block.type === 'Wrapper')
        return renderSection(block);
    else if (block.type === 'Code') {
        if (block.code.startsWith('<ul class="tab'))
            return <div class="color-dimmed3" style="margin: -1rem 0px 1.4rem;"><Tabs
                links={ extractTabLinks(block.code).map(el => el.textContent) }
                onTabChanged={ toIdx => handleTabChanged(toIdx, 0) }
                className="text-small"/>
            </div>;
        return renderHtml(block.code, block.styleClasses);
    } else if (block.type === 'Paragraph')
        return <p dangerouslySetInnerHTML={ {__html: block.text} } class={ block.styleClasses }></p>;
    else if (block.type === 'Heading') {
        const T = `h${block.level}`;
        return <T class={ block.styleClasses }>{ block.text }</T>;
    }
}

/**
 * @param {string} html
 * @param {string} styleClasses
 * @returns {preact.VNode}
 */
function renderHtml(html, styleClasses) {
    return <div dangerouslySetInnerHTML={ {__html: html} } class={ styleClasses }></div>;
}

/**
 * @param {string} html
 * @returns {Array<HTMLAnchorElement>}
 */
function extractTabLinks(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return Array.from(temp.querySelectorAll('li.tab-item a'));
}

/**
 * @param {number} toIdx
 * @param {number} tabGroup
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
