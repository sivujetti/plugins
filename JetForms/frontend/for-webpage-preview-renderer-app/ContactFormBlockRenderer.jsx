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
                <input type="hidden" name="_returnTo" value={ `${urlUtils.makeUrl(urlUtils.currentPageSlug)}#contact-form-sent=${block.id}` }/>
                { block.useCaptcha
                    ? <input type="hidden" name="_cChallenge" value={ block.__captchaChallenge }/>
                    : null
                }
        </form>;
    }
}

export default ContactFormBlockRenderer;