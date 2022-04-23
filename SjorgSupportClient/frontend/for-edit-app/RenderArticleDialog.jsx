import {__, Icon} from '@sivujetti-commons-for-edit-app';

const supportServerAssetUrl = 'https://www.sivujetti.org/';
const supportServerIndexUrl = supportServerAssetUrl;

let accordionCounter = 0;

class RenderArticleDialog extends preact.Component {
    /**
     * @access protected
     */
    render({article}) {
        return <form onSubmit={ this.closePopup.bind(this) } class="sjorg-support-article">
            <div>{ article.blocks.map(block =>
                (block.cssClass || '').indexOf('accordion') < 0
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
    return <section>{ block.children.map(renderBlock) }</section>;
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
        return <p dangerouslySetInnerHTML={ {__html: block.text} } class={ block.cssClass }></p>;
    else if (block.type === 'Heading')
        return <h1 class={ block.cssClass }>{ block.text }</h1>;
    else if (block.type === 'RichText')
        return <div dangerouslySetInnerHTML={ {__html: block.html} } class={ block.cssClass }></div>;
    else if (block.type === 'Image')
        return <img src={ `${supportServerAssetUrl}${block.src}` } class={ block.cssClass } title="todo"/>;
}

export default RenderArticleDialog;
export {supportServerIndexUrl};
