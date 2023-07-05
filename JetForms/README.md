# JetForms

Does forms.

# Installation

Temporary manual steps.

## Setup the database

```

INSERT INTO `storedObjects` (`objectName`,`data`) VALUES ('JetForms:mailSendSettings','{"sendingMethod":"mail","SMTP_host":null,"SMTP_port":null,"SMTP_username":null,"SMTP_password":null,"SMTP_secureProtocol":null}');
```

## Copy validation lib to public directory

Copy `plugins/JetForms/frontend/pristine/pristine.min.js` to `public/sivujetti/vendor/pristine.min.js`.

## Bundle frontend

See `frontend/rollup.config.js`.

## Fine-tune mailer configuration (optional)

Add to `site/Site.php`:

```php
<?php declare(strict_types=1);

namespace MySite;

use PHPMailer\PHPMailer\PHPMailer;
use SitePlugins\JetForms\JetForms;

/**
 * @psalm-import-type JetFormsMailSendSettings from \SitePlugins\JetForms\JetForms
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
             * @psalm-param JetFormsMailSendSettings $alreadyAppliedSettings
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
- `"../../../backend/vendor/bin/phpunit" --bootstrap ./tests/bootstrap.php ./tests`

# Docs

How to's.

## Frontend api

`const form = window.JetForms[0]`

```
interface JetForm {
    getEl(): HTMLFormElement;
    setIsSubmitting(isSubmitting: Boolean) void;
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
(function ({api, signals}) {
    signals.on('edit-app-plugins-loaded', () => {
        api.blockTypes.get('JetFormsContactForm').configurePropsWith(props => ({
            ...props,
            ...{useCaptcha: 0},
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