# JetSliders

Does sliders.

# Installation

Temporary manual steps.

## Copy slider lib to public directory

Copy `plugins/JetSliders/frontend/dist/keen-slider.min.js` to `public/sivujetti/vendor/keen-slider.min.js` and
Copy `plugins/JetSliders/frontend/dist/jet-slider.bundle.css` to `public/sivujetti/vendor/jet-slider.bundle.css`.

## Bundle frontend

See `frontend/rollup.config.js`.

## Setup content templates

1. Execute in db ``INSERT INTO `contentTemplates` (`id`,`blockBlueprints`,`title`,`previewImgSrc`,`category`) VALUES ('-OFLMf8RZiV__nOdMoIw', '[{"blockType":"Wrapper","initialOwnData":{"dummy":""},"initialDefaultsData":{"title":"Image slider","renderer":"jsx","styleClasses":"jet-slider show-arrows show-bullets @customClass[0]"},"initialChildren":[{"blockType":"Image","initialOwnData":{"src":null,"altText":"","caption":""},"initialDefaultsData":{"title":"","renderer":"jsx","styleClasses":""},"initialChildren":[],"initialStyles":[]},{"blockType":"Image","initialOwnData":{"src":null,"altText":"","caption":""},"initialDefaultsData":{"title":"","renderer":"jsx","styleClasses":""},"initialChildren":[],"initialStyles":[]}],"initialStyles":[{"scss":".@customClass[0] {\n  > .j-Image {\n    margin: 0;\n    padding-bottom: calc(9 \/ 16 * 100%);\n    position: relative;\n    img {\n      position: absolute;\n      width: 100%;\n      height: 100%;\n    }\n  }\n  > .navigation-wrapper {\n    .arrow {\n      color: #fff;\n    }\n    .arrow--disabled.arrow--left {\n      color: #ffffff66;\n    }\n    .arrow--disabled.arrow--right {\n      color: #ffffff66;\n    }\n    .dot {\n      background: #ffffff80;\n    }\n    .dot--active {\n      background: #ffffff40;\n    }\n  }\n}","data":{"title":".slider-gallery","customizationSettings":{"varDefs":[{"varName":"@customClass[0]_3","cssProp":"padding-bottom: calc(%s * 100%);","cssSubSelector":"> .j-Image","widgetSettings":{"label":"Aspect ratio","valueType":"option","defaultThemeValue":"6 \/ 19","options":[{"label":"19:6","value":"6 \/ 19"},{"label":"4:3","value":"3 \/ 4"},{"label":"3:2","value":"2 \/ 3"},{"label":"1:1 (Neliö)","value":"1 \/ 1"},{"label":"9:16 (Pystysuora)","value":"16 \/ 9"},{"label":"21:9 (Ultrawide)","value":"9 \/ 21"}]}},{"varName":"@customClass[0]_4","cssProp":"color","cssSubSelector":"> .navigation-wrapper .arrow","widgetSettings":{"label":"Nav arrows","valueType":"color","defaultThemeValue":"#fff"}},{"varName":"@customClass[0]_5","cssProp":"color","cssSubSelector":"> .navigation-wrapper .arrow--disabled.arrow--left","widgetSettings":{"label":"Nav left arrow disabled","valueType":"color","defaultThemeValue":"#ffffff66"}},{"varName":"@customClass[0]_6","cssProp":"color","cssSubSelector":"> .navigation-wrapper .arrow--disabled.arrow--right","widgetSettings":{"label":"Nav right arrow disabled","valueType":"color","defaultThemeValue":"#ffffff66"}},{"varName":"@customClass[0]_7","cssProp":"background","cssSubSelector":"> .navigation-wrapper .dot","widgetSettings":{"label":"Nav dots","valueType":"color","defaultThemeValue":"#ffffff80"}},{"varName":"@customClass[0]_8","cssProp":"background","cssSubSelector":"> .navigation-wrapper .dot--active","widgetSettings":{"label":"Nav active dot","valueType":"color","defaultThemeValue":"#ffffff40"}}]},"associatedBlockTypes":["Wrapper"]},"scope":{"kind":"custom-class","layer":"dev-styles"}}]}]', 'Image slider', '/public/sivujetti/content-template-previews/preview-jet-sliders-image-slider.webp', 'other');``
1. Copy `plugins/JetSliders/frontend/dist/preview-jet-sliders-image-slider.webp` to `public/sivujetti/content-template-previews/preview-jet-sliders-image-slider.webp`

# License

GPLv3

# Licenses 3rd party

Library: Keen slider
License: MIT
Link: https://github.com/rcbyr/keen-slider/blob/master/LICENSE
