# JetForms

Does forms.

# Installation

Temporary manual steps.

## Copy validation lib to public directory

Copy `plugins/JetForms/frontend/pristine/pristine.min.js` to `public/sivujetti/vendor/pristine.min.js`.

## Create pass-through file

`SIVUJETTI_BACKEND_PATH . "assets/jet-forms-block-contact-form.tmpl.php"`:

```php
<?php require SIVUJETTI_PLUGINS_PATH . "JetForms/templates/block-contact-form.tmpl.php" ?>
```

## Bundle frontend

See `frontend/rollup.config.js`.

## Configure

Add to `site/Site.php`:

```php
<?php declare(strict_types=1);

namespace MySite;

use Pike\PhpMailerMailer;
use SitePlugins\JetForms\JetForms;
...
    public function __construct(UserSiteAPI $api) {
        ...
        if (class_exists("SitePlugins\JetForms\JetForms", false))
            $api->on(JetForms::ON_MAILER_CONFIGURE, function (PhpMailerMailer $mailer) {
                $mailer->isMail();
                // or
                // $mailer->isSMTP();
                // $mailer->Host = 'smtp.foo.com';
                // ... etc.
            });
...
```

# Developing

## Run backend tests

- `cd plugins/JetForms/`
- `"../../../backend/vendor/bin/phpunit" --bootstrap ./tests/bootstrap.php ./tests`

# License

GPLv3