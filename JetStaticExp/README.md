# JetStaticExp

Generates static sites.

# Developing

## Bundle frontend

See `frontend/rollup.config.js`

## Run backend tests

- `cd plugins/JetStaticExp/`
- `"../../../backend/vendor/bin/phpunit" --display-warnings --bootstrap ./tests/bootstrap.php ./tests`

# Docs

How to's.

## Temp

- Log into the site
- Run in developer tools `sivujettiCommonsEditApp.http.post('/plugins/jet-static-exp/exports/export', {pages: ['/yhteys'], targetHost: 'https://goo.com', targetBaseUrl: '/', targetQueryVar: ''}).then(r=>r.json()).catch(console.error)`

# License

GPLv3