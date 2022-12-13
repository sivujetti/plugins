import {__, Icon} from '@sivujetti-commons-for-edit-app';

const supportServerBaseUrl = 'https://www.sivujetti.org/early-access/';
const supportServerAssetBaseUrl = supportServerBaseUrl;

let accordionCounter = 0;

class RenderArticleDialog extends preact.Component {
    /**
     * @access protected
     */
    render({article}) {
        return <form onSubmit={ this.closePopup.bind(this) } class="sjorg-support-article">
            <div>{ article.blocks.map(block =>
                (block.styleClasses || '').indexOf('accordion') < 0
                    ? renderNormalSection(block)
                    : renderAccordionSection(block)
            ) }</div>
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
function renderNormalSection(block) {
    return <section class={ block.styleClasses }>{ block.children.map(renderBlock) }</section>;
}

/**
 * @param {RawBlock} block
 * @returns {preact.Component}
 */
function renderAccordionSection(block) {
    const heading = block.children[0];
    const nth = ++accordionCounter;
    return <div class="accordion">
        <input id={ `accordion-${nth}` } type="radio" name="accordion-radio" hidden/>
        <label class="accordion-header accordionCounter-hand pl-0 color-dimmed" htmlFor={ `accordion-${nth}` }>
            <Icon iconId="chevron-right" className="mr-1 icon"/>
            { heading.text }
        </label>
        <div class="accordion-body pt-2">
            { block.children.slice(1).map(renderBlock) }
        </div>
    </div>;
}

/**
 * @param {RawBlock} block
 * @returns {preact.Component}
 */
function renderBlock(block) {
    if (block.type === 'Paragraph')
        return <p dangerouslySetInnerHTML={ {__html: block.text} } class={ block.styleClasses }></p>;
    else if (block.type === 'Heading') {
        const T = `h${block.level}`;
        return <T class={ block.styleClasses }>{ block.text }</T>;
    }
    else if (block.type === 'RichText')
        return <div dangerouslySetInnerHTML={ {__html: block.html} } class={ block.styleClasses }></div>;
    else if (block.type === 'Image')
        return <img src={ `${supportServerAssetBaseUrl}public/uploads/${block.src}` } class={ block.styleClasses } title=""/>;
}

export default RenderArticleDialog;
export {supportServerBaseUrl};
