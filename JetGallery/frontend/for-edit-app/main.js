import {api} from '@sivujetti-commons-for-edit-app';
import GridGalleryBlockType from './GridGalleryBlockType.jsx';
import GalleryImageBlockType from './GalleryImageBlockType.jsx';

api.blockTypes.register(GridGalleryBlockType.name, () => GridGalleryBlockType);
api.blockTypes.register(GalleryImageBlockType.name, () => GalleryImageBlockType);
