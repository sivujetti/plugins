import {__, urlUtils, api} from '@sivujetti-commons-for-edit-app';
import {placeholderImageSrc} from '../../../../../frontend/edit-app/src/commons/FileUploader.jsx';

const name = 'JetGalleryGalleryImage';
const imageBlockType = api.blockTypes.get('Image');

export default {
    name,
    friendlyName: 'Gallery image (JetGallery)',
    ownPropNames: Object.keys(imageBlockType.initialData),
    initialData() {
        return {...imageBlockType.initialData};
    },
    defaultRenderer: 'plugins/JetGallery:block-gallery-image',
    icon: 'photo',
    reRender({src, altText, caption, styleClasses, id}, renderChildren) {
        return ['<a href="" class="j-', name, styleClasses ? ` ${styleClasses}` : '',
            '" data-block-type="', name,
            '" data-block="', id,
            '"><figure data-block-root>',
                '<img src="',
                    src ? urlUtils.makeAssetUrl(`public/uploads/${src}`) : placeholderImageSrc,
                    '"', ' alt="', altText , '">',
                caption ? `<figcaption>${caption}</figcaption>` : '',
            renderChildren(),
        '</figure></a>'].join('');
    },
    createSnapshot(from) {
        return Object.keys(imageBlockType.initialData).reduce((out, key) => ({...out, ...{[key]: from[key]}}), {});
    },
    editForm: imageBlockType.editForm,
};
