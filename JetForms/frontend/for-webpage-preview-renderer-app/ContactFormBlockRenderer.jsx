import {urlUtils} from '@sivujetti-commons-for-web-pages';

class ContactFormBlockRenderer extends preact.Component {
    /**
     * @param {BlockRendererProps} props
     * @access protected
     */
    render({block, createDefaultProps, renderChildren}) {
        return <form
            action="#"
            method="post"
            data-form-sent-message=""
            data-form-id={ block.id }
            data-form-type="contact"
            { ...createDefaultProps('jet-form') }>
            { renderChildren() }
            <input type="hidden" name="_returnTo" value={ block.returnTo || `${urlUtils.makeUrl(urlUtils.currentPageSlug)}#contact-form-sent=${block.id}` }/>
            { block.captchaToUse
                ? <input type="hidden" name="captchaToUse" value={ block.captchaToUse }/>
                : null
            }
        </form>;
    }
}

export default ContactFormBlockRenderer;