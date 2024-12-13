/*
This file is transpiled into 'public/plugin-jet-galleries-webpage-preview-renderer-app-bundle.js'.
*/

import {api} from '@sivujetti-webpage-preview-renderer-app';

api.export('ReRenderingWebPage', class GalleryAwareReRenderingWebPage extends api.import('ReRenderingWebPage') {
    createRendererCls(Cls, block) {
        const Cls2 = super.createRendererCls(Cls, block);
        if (block.styleClasses.indexOf('jet-gallery') > -1)
            return class Gallerified extends Cls2 {
                // elRef;
                /**
                 * @access protected
                 */
                componentWillMount() {
                    if (super.componentWillMount) super.componentWillMount();
                    this.elRef = preact.createRef();
                }
                /**
                 * @access protected
                 */
                componentDidMount() {
                    if (super.componentDidMount) super.componentDidMount();
                    if (!window.JetGalleries.isActivated(this.elRef.current))
                        window.JetGalleries.activateGallery(this.elRef.current);
                }
                /**
                 * @access protected
                 */
                render(props, state, context) {
                    return super.render({...props, createDefaultProps: (...args) => ({
                        ...props.createDefaultProps(...args),
                        ref: this.elRef,
                    })}, state, context);
                }
            };
        return Cls2;
    }
});
