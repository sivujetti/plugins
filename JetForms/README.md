# JetForms

Does forms.

# Installation

Temporary manual steps.

## Setup the database

```

INSERT INTO `storedObjects` (`objectName`,`data`) VALUES ('JetForms:mailSendSettings','{"sendingMethod":"mail","SMTP_host":null,"SMTP_port":null,"SMTP_username":null,"SMTP_password":null,"SMTP_secureProtocol":null}');
```

## Copy validation lib to public directory

Copy `plugins/JetForms/frontend/dist/pristine/pristine.min.js` to `public/sivujetti/vendor/pristine.min.js`.

## Bundle frontend

See `frontend/rollup.config.js`.


## Setup content templates

1. Execute in db ``INSERT INTO `contentTemplates` (`id`,`blockBlueprints`,`title`,`previewImgSrc`,`category`) VALUES '-OAqOZXjtJXRgb-Fdi4a', '[{"blockType":"JetFormsContactForm","initialOwnData":{"behaviours":[{"name":"SendMail","data":{"subjectTemplate":"Uusi yhteydenotto sivustolla [siteName]","toAddress":"sivuston-omistaja@mail.com","toName":"","fromAddress":"no-reply@sivuston-nimi.com","fromName":"","bodyTemplate":"Uusi yhteydenotto sivustolla [siteName].\n\n[resultsAll]\n\n------------\n(Lähetetty JetFormsilla)\n"}},{"name":"ShowSentMessage","data":{"at":"beforeFirstInput","message":"Kiitos viestistäsi."}}],"captchaToUse":"jet-captcha"},"initialDefaultsData":{"title":"Contact form","renderer":"jsx","styleClasses":"@customClass[0]"},"initialChildren":[{"blockType":"Columns","initialOwnData":{"numColumns":null,"takeFullWidth":null},"initialDefaultsData":{"title":"","renderer":"jsx","styleClasses":""},"initialChildren":[{"blockType":"JetFormsTextInput","initialOwnData":{"name":"input_1","label":"","isRequired":0,"placeholder":"Name"},"initialDefaultsData":{"title":"","renderer":"jsx","styleClasses":""},"initialChildren":[],"initialStyles":[]},{"blockType":"JetFormsEmailInput","initialOwnData":{"name":"input_2","label":"","isRequired":0,"placeholder":"Email"},"initialDefaultsData":{"title":"","renderer":"jsx","styleClasses":""},"initialChildren":[],"initialStyles":[]}],"initialStyles":[]},{"blockType":"JetFormsTextareaInput","initialOwnData":{"name":"input_3","label":"","isRequired":1,"placeholder":"Message","numRows":"4"},"initialDefaultsData":{"title":"","renderer":"jsx","styleClasses":""},"initialChildren":[],"initialStyles":[]},{"blockType":"Button","initialOwnData":{"html":"Send","linkTo":"\/","tagType":"submit"},"initialDefaultsData":{"title":"","renderer":"jsx","styleClasses":"btn-primary"},"initialChildren":[],"initialStyles":[]}],"initialStyles":[{"scss":".@customClass[0] {\n  > .j-Columns {\n    grid-auto-flow: column;\n    row-gap: 0;\n  }\n  @media (max-width: 480px) {\n    > .j-Columns {\n      grid-auto-flow: initial;\n    }\n  }\n}","data":{"title":".contact-form","customizationSettings":{"varDefs":[{"varName":"@customClass[0]_1","cssProp":"max-width","cssSubSelector":null,"widgetSettings":{"label":"Max width","valueType":"length","initialUnit":"px"}},{"varName":"@customClass[0]_2","cssProp":"margin-inline","cssSubSelector":null,"widgetSettings":{"label":"Align ↔","valueType":"option","defaultThemeValue":"0 0","options":[{"label":"Default","value":"0 0"},{"label":"Center","value":"auto auto"},{"label":"Right","value":"auto 0"}]}}]},"associatedBlockTypes":["JetFormsContactForm"]},"scope":{"kind":"custom-class","layer":"dev-styles"}}]}]', 'Contact form', '/public/sivujetti/content-template-previews/preview-jet-forms-contact-form.webp', 'other');``
1. Copy `plugins/JetForms/frontend/dist/preview-jet-forms-contact-form.webp` to `public/sivujetti/content-template-previews/preview-jet-forms-contact-form.webp`

## Fine-tune mailer configuration (optional)

Add to `site/Site.php`:

```php
<?php declare(strict_types=1);

namespace MySite;

use PHPMailer\PHPMailer\PHPMailer;
use SitePlugins\JetForms\JetForms;

/**
 * @phpstan-import-type JetFormsMailSendSettings from \SitePlugins\JetForms\JetForms
 */
class Site implements UserSiteInterface {
...
    public function __construct(UserSiteAPI $api) {
        ...
        $api->on($api::ON_ROUTE_CONTROLLER_BEFORE_EXEC, function () use ($api) {
            /** @var \SitePlugins\JetForms\JetForms */
            $jetForms = $api->getPlugin("JetForms");
            if ($jetForms === null) return;

            $api->on($jetForms::ON_MAILER_CONFIGURE,
            /**
             * @param \PHPMailer\PHPMailer\PHPMailer $mailer
             * @param JetFormsMailSendSettings $alreadyAppliedSettings
             */
            function (PHPMailer $mailer, array $alreadyAppliedSettings) {
                // You can mutate $mailer here with some custom stuff.
                // Note that $mailer is already configured with $alreadyAppliedSettings at this point.
            });
        });
...
```

# Developing

## Run backend tests

- `cd plugins/JetForms/`
- `"../../../backend/vendor/bin/phpunit" --display-warnings --bootstrap ./tests/bootstrap.php ./tests`

# Docs

How to's.

## Frontend api

`const form = window.JetForms[0]`

```
interface JetFormController {
    getEl(): HTMLFormElement;
    setIsSubmitting(isSubmitting: boolean) void;
    setOnSubmit(fn: (e: Event) => void): void;
}
```

## How to register custom script to handle submissions

```
const form = env.window.JetForms[0];
form.getEl().removeAttribute('action');
form.onSubmit(e => {
    e.preventDefault();
    /* Do something */
});
```

## How to disable captca for all new forms

Create file `public/my-site-edit-app-extensions-bundle.js`:

```
(function ({api, events}) {
    events.on('edit-app-plugins-loaded', () => {
        api.blockTypes.get('JetFormsContactForm').configurePropsWith(props => ({
            ...props,
            ...{captchaToUse: null},
        }));
    });
})(sivujettiCommonsEditApp);

```

Edit `site/Site.php`:

```php
<?php declare(strict_types=1);

namespace MySite;

use Sivujetti\UserSite\{UserSiteAPI, UserSiteInterface};

class Site implements UserSiteInterface {
    /**
     * @param \Sivujetti\UserSite\UserSiteAPI $api
     */
    public function __construct(UserSiteAPI $api) {
        ...
        $api->on($api::ON_ROUTE_CONTROLLER_BEFORE_EXEC, function () use ($api) {
            $api->enqueueEditAppJsFile("my-site-edit-app-extensions-bundle.js");
        });
    }
}

```

# License

GPLv3

# Licenses 3rd party

Library: Pristine
License: MIT
Link: https://github.com/sha256/Pristine/blob/master/LICENSE
