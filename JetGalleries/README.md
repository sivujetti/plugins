# JetGalleries

Image galleries and beyond.

# Installation

## Copy lighbox lib to public directory

Copy `plugins/JetGalleries/frontend/dist/photoswipe/photoswipe-lightbox.umd.min.js` to `public/sivujetti/vendor/photoswipe-lightbox.umd.min.js`.
Copy `plugins/JetGalleries/frontend/dist/photoswipe/photoswipe.umd.min.js` to `public/sivujetti/vendor/photoswipe.umd.min.js`.
Copy `plugins/JetGalleries/frontend/dist/photoswipe/photoswipe.css` to `public/sivujetti/vendor/photoswipe.css`.

## Bundle frontend

See `frontend/rollup.config.js`.

## Setup content templates

1. Execute in db ``INSERT INTO `contentTemplates` (`id`,`blockBlueprints`,`title`,`previewImgSrc`,`category`) VALUES ('-OFLMcm6Umtxkg81jwPv', '[{"blockType":"Columns","initialOwnData":{"numColumns":null,"takeFullWidth":null},"initialDefaultsData":{"title":"Grid image gallery","renderer":"jsx","styleClasses":"jet-gallery @customClass[0]"},"initialChildren":[{"blockType":"Image","initialOwnData":{"src":null,"altText":"","caption":""},"initialDefaultsData":{"title":"","renderer":"jsx","styleClasses":""},"initialChildren":[],"initialStyles":[]},{"blockType":"Image","initialOwnData":{"src":null,"altText":"","caption":""},"initialDefaultsData":{"title":"","renderer":"jsx","styleClasses":""},"initialChildren":[],"initialStyles":[]},{"blockType":"Image","initialOwnData":{"src":null,"altText":"","caption":""},"initialDefaultsData":{"title":"","renderer":"jsx","styleClasses":""},"initialChildren":[],"initialStyles":[]}],"initialStyles":[{"scss":".@customClass[0] {\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  align-items: center;\n  column-gap: 0.4rem;\n  row-gap: 0.4rem;\n  &.jet-slider {\n    gap: 0;\n  }\n  > .j-Image, > a {\n    padding-bottom: calc(9 \/ 16 * 100%);\n    position: relative;\n    img {\n      position: absolute;\n      width: 100%;\n      height: 100%;\n    }\n  }\n}","data":{"title":".grid-gallery","customizationSettings":{"varDefs":[{"varName":"@customClass[0]_3","cssProp":"grid-template-columns: repeat(%s, minmax(0, 1fr));","cssSubSelector":null,"widgetSettings":{"label":"Columns","valueType":"option","defaultThemeValue":"repeat(3, minmax(0, 1fr))","options":[{"label":"1","value":"repeat(1, minmax(0, 1fr))"},{"label":"2","value":"repeat(2, minmax(0, 1fr))"},{"label":"3","value":"repeat(3, minmax(0, 1fr))"},{"label":"4","value":"repeat(4, minmax(0, 1fr))"},{"label":"5","value":"repeat(5, minmax(0, 1fr))"},{"label":"6","value":"repeat(6, minmax(0, 1fr))"}]}},{"varName":"@customClass[0]_1","cssProp":"min-height","cssSubSelector":"> .j-Image, > a","widgetSettings":{"label":"Min height","valueType":"length"}},{"varName":"@customClass[0]_2","cssProp":"padding-bottom: calc(%s * 100%);","cssSubSelector":"> .j-Image, > a","widgetSettings":{"label":"Aspect ratio","valueType":"option","defaultThemeValue":"6 \/ 19","options":[{"label":"19:6","value":"6 \/ 19"},{"label":"4:3","value":"3 \/ 4"},{"label":"3:2","value":"2 \/ 3"},{"label":"1:1 (Neliö)","value":"1 \/ 1"},{"label":"9:16 (Pystysuora)","value":"16 \/ 9"},{"label":"21:9 (Ultrawide)","value":"9 \/ 21"}]}}]},"associatedBlockTypes":["Columns"]},"scope":{"kind":"custom-class","layer":"dev-styles"}}]}]', 'Grid image gallery', '/public/sivujetti/content-template-previews/preview-jet-galleries-grid-gallery.webp', 'other');``
1. Copy `plugins/JetGalleries/frontend/dist/preview-jet-galleries-grid-gallery.webp` to `public/sivujetti/content-template-previews/preview-jet-galleries-grid-gallery.webp`

# Docs

How to's.

## Frontend api

```
todo window.addEventListener('JetGalleries:load', {
    const gallery = window.JetGalleries.getCurrentPageGalleries()[0]
});
```

```
interface JetGalleries  {
    getCurrentPageGalleries(): Array<JetGalleryController>;
}
interface JetGalleryController {
    getLightbox(): Object;
}
```

# License

GPLv3