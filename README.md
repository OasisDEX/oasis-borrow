# Oasis.app [![codecov](https://codecov.io/gh/OasisDEX/oasis-borrow/branch/dev/graph/badge.svg?token=KMXTAUFL48)](https://codecov.io/gh/OasisDEX/oasis-borrow)

- TypeScript
- Next.js
- Eslint with TypeSTRICT
- Prettier

## Envs


## Running

### Frontend

```sh
yarn
yarn start
```

If you want to serve the web server over HTTPS (required for Ledger) use:
```sh
HTTPS=true yarn start
```

### Paths/routes

Pages:

- `/` - Loads Landing Page
- `/trade` - Redirect to a default pair
- `/trade/[base]/[quote]` - Loads trading interface
- `/account` - Loads account information
- `/terms` - Loads terms of service ( mocked page)
- `/faq` - FAQ

API routes:

- `/api/health [GET]`
- `/api/auth/challenge [POST]`
- `/api/auth/signin [POST]`
- `/api/tos/me [GET]`
- `/api/tos/sign [POST]`

### Backend dependencies

```sh
# this will block terminal window so please use another one
./scripts/dev.sh
```

## Password protection

If `NODE_ENV !== 'development'` password protection using `http-auth` will kick in. Username is `admin` and password is
`arran!@#`

## Development

### Test Wyre on localhost

Get [`ngrok`](https://ngrok.com/) for tunneling localhost instance to external domain

Autorize ngrok:
```
./ngrok authtoken 1d7IBiJAeUGzEaL9CeJs4Ak2SMN_nMQkztaDB9VFuNNsiubY
```

Launch ngrok tunneling:
```
ngrok http 3000 -subdomain=oasis-app
```

Webhooks will receive Wyre requests and save it into local db.


### Frontend

#### Storybook

```sh
yarn storybook
```

### Backend

### Wyre dev-mode helpers

Get orders for connected wallet address:
```
showOrders()
```

Change order state:
```
changeOrder('ORDER_ID', 'STATE')
```
Possible states: `PROCESSING`, `COMPLETE`, `FAILED`

E.g. ``changeOrder('TF_ZNLH8HTAXFM', 'COMPLETE')``

#### Prisma

We use [Prisma Client](https://github.com/prisma/prisma-client-js) for type-safe database communication.

To regenerate schema based on the current state of a database run:

```
yarn prisma:introspect
```

To generate client based on schema run (it runs automatically after postinstall):

```
yarn prisma:generate
```

#### Migrations

We use raw SQLs for migrations. They are stored in `server/database/migrations`. We use
[`postgres-migrations`](https://www.npmjs.com/package/postgres-migrations).

```
yarn migrate
```


## i18n - Internationalisation

Configuration file `i18n.ts` located in root directory allows to define available languages, default language, translation namespaces
and language detection methods.

Currently supported language detection method and they precedence:
1. `landing-page-language-detection` - Custom detection based on root path with language param, e.g `/en` .
Used for landing page. Not possible to use with subdirectories like `/en/dashboard`
2. `querystring` - Applicable to any url with `lang` query string param, e.g. `/dashboard?lang=es`
3. `cookie` - Language param is set by other methods and stored in browser cookies. Any url without lang url param or query param
will use this method to determine user language if cookie is already set.
4. `header` - Applicable if none of the above method was applied. Language is determined by `Accept-Language` header,
 which reflects user's default language set in a browser.

Translation json files are located in `/public/locales/`, in corresponding directories.

Component that is using i18n should instantiate translation method via hook (optionally passing corresponding translation namespace):

`const { t } = useTranslation('dashboard')`

From this point translation engine can be used by passing key to `t` method:

`<Heading>{t('buy')}</Heading>`

Key needs to exist in every translation json for every language (and namespace).

For detailed i18next documentation please visit [i18n docs](https://www.i18next.com/)
