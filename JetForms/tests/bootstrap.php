<?php

/*
- `cd plugins/JetForms/`
- `"../../../backend/vendor/bin/phpunit" --display-warnings --bootstrap ./tests/bootstrap.php ./tests`
*/

$doBootstrap = require dirname(__DIR__, 3) . "/sivujetti/tests/do-bootstrap.php";
$doBootstrap(
    // Use default site path (__DIR__ . "/test-site/")
    // Use default plugins path (SIVUJETTI_BACKEND_PATH . "plugins/")
    alterPsr4Loader: function ($loader) {
        $loader->addPsr4("SitePlugins\\JetForms\\Tests\\", __DIR__ . "/src");
    }
);
