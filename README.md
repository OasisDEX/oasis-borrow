[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![codecov](https://codecov.io/gh/OasisDEX/oasis-borrow/branch/main/graph/badge.svg?token=KMXTAUFL48)](https://app.codecov.io/gh/OasisDEX/oasis-borrow/branch/main)

<br> <br>

<div align="center">
  <img src="https://raw.githubusercontent.com/OasisDEX/oasis-borrow/57f15f27fad34b05f94398eec8eec33bcf4ffee8/public/static/img/logo_footer.svg" width="500" height="500">
</div>
<br>
<br>

| Environment | URL                                            | Branch |                                     Build Status                                     |
| ----------- | ---------------------------------------------- | :----: | :----------------------------------------------------------------------------------: |
| Production  | [oasis.app](https://oasis.app)                 | `main` | ![](https://github.com/github/docs/actions/workflows/main.yml/badge.svg?branch=main) |
| Staging     | [staging.oasis.app](https://staging.oasis.app) | `dev`  | ![](https://github.com/github/docs/actions/workflows/main.yml/badge.svg?branch=dev)  |

<br>

# Oasis.app

[Oasis.app](https://oasis.app) is the most popular user-interface to interact with the
[Maker protocol](https://docs.makerdao.com/). It enables users to generate Dai, the most used and
decentralized stablecoin, using a variety of crypto assets as collateral.

<br>

### Getting Started

Clone the repository

```sh
git clone https://github.com/OasisDEX/oasis-borrow.git
```

Navigate to the project folder and install all dependencies

```sh
yarn
```

To create a local development instance we must first spin up the database prior to starting the web
server.

```sh
# Open one terminal and run:
./scripts/dev.sh
```

Monitor the logs and wait for the migrations to complete. This should be evident by a log message
`Migrations DONE`

In a second terminal we can then begin the web server instance over http or https (https is required
for testing hardware wallets):

\*Note: Make sure you have everything setup correctly according to the configuration explain
[here](#Configuration)

```sh
yarn start

# Optionally
HTTPS=true yarn start
```

The application will be viewable on <http://localhost:3000> or <https://localhost:3443> respectively

<br>

### Run staging site locally

You can run the current staging site, (found at <https://staging.oasis.app>) alongside the database, by running:

```sh
./scripts/dev-with-staging.sh
```

It will pull an additional docker container with the current staging site and will make it available at <http://0.0.0.0:3000>

### Storybook

We utilise storybook for visualising some of our UI components in isolation. This makes development
easier for UI work as next.js is very compute heavy when re-rendering changes in development mode.

```sh
yarn storybook
```

Stories should be viewable at <http://localhost:6006> A live version of storybook on parity with the
staging environment can be found by navigating to <https://storybook.oasis.app>.

For specific deployments, users can navigate to
[https://storybook.oasis.app/<COMMIT_HASH>/index.html](https://storybook.oasis.app/<COMMIT_HASH>/index.html])
where the `<COMMIT_HASH>` is the shortened commit hash of the branch/commit that has been pushed.

<br>

### Configuration

The application consists of two parts

- `next.js`

- custom `express` server

There is the `next.config.js` which contains the configuration for `next.js`. This configuration is
created during build time thus The env variables that are used in this file will be evaluated during
_build time_.

Some of the values that are used you can check in the `.env` file.

#### List of the `build-time` env vars

- `COMMIT_SHA` - The value is used together with `SHOW_BUILD_INFO`. Main usages is to display a
  commit in the footer. This targets build deployments to staging environments so that the team can
  see which version the UI reflects. The value could be a branch name or specific commit.

- `API_HOST` - The value is used to construct links based on root domain.

- `MIXPANEL_ENV` - The value could be either `production` or anything else you'd like to use to
  denote that it's NOT production. The difference is where the events are sent. For "development"
  environments the events will be displayed in the dev console within the browser. If the env is set
  to `production` then all the events will be actually sent to Mixpanel.

- `MIXPANEL_KEY` - The value will be used for `production` environments. This is the project key
  that is generated from Mixpanel.

- `ADROLL_PIX_ID` - The value will be used for `production` environments. This is the project key
  that is generated from AdRoll Pixel.

- `ADROLL_ADV_ID` - The value will be used for `production` environments. This is the project key
  that is generated from AdRoll Pixel.

- `USE_TERMS_OF_SERVICE` - In order to use some functionalities the user should read and accept
  Terms of Service. For development purposes, this feature can be disabled. You can disable this
  feature if you'd like to remove that functionality at all. The values are either `0` (disabled) or
  `1` (enabled).

- `SHOW_BUILD_INFO` - The value will determine whether an information about the build is diplayed in
  the footer. Currently we display only the build time and commit from which it is built. This
  targets deployments to staging environments so that the tam can see which version the UI reflects.
  The value is either `0` (disabled) or `1` (enabled)

- `INFURA_PROJECT_ID` - This is used in cases where the user hasn't authorized the application to
  access their wallet ( hasn't connected their wallet - `read-only` mode) or when the application is
  accessed with a specific provider injected.

- `ETHERSCAN_API_KEY` - The value is used to create the corresponding etherscan endpoint. For each
  transaction, there is a url that leads to that TX details in etherscan.

- `SENTRY_RELEASE` - The release in sentry.io.  Used by sentry.io to generate and upload source maps for a given release at build time, and tie those source maps to errors sent to sentry at run time.

- `SENTRY_AUTH_TOKEN` - auth token used by sentry.io to upload source maps.

As mentioned previously, there is also the custom express server part which uses the env variables
at _run time_

#### List of the `run-time` env vars

- `INFURA_PROJECT_ID_BACKEND` - This is used mainly together with the
  `<build_time>.USE_TERM_OF_SERVICE`. It is related with Argent internals. On the backend we need to
  connect to a node in order to verify the wallet that is signing the Terms of Service.

- `CHALLENGE_JWT_SECRET` - Could be any value. This is used on the server to sign JWT message.

- `USER_JWT_SECRET` - Could be any value different from `CHALLENGE_JWT_SECRET`. This is used when
  the user signs the Terms of Service.

- `MAILCHIMP_ENDPOINT` - Mailchimp endpoint with audience ID used to integrate Mailchimp newsletter.

- `MAILCHIMP_API_KEY` - Mailchimp API Key used to integrate Mailchimp newsletter.

- `SENTRY_RELEASE` - The release in sentry.io.  Used by sentry.io to generate and upload source maps for a given release at build time, and tie those source maps to errors sent to sentry at run time.

- `NEXT_PUBLIC_SENTRY_ENV` - The environment that sentry events are tagged as.  `production` | `staging` | `pullrequest` | `development`

_Note: Make sure that you call the process that build the project with the `build-time` vars and
make sure that you call the proces that runs the application with the `run-time` vars._

<br>

### Hardhat

In addition, we make use of hardhat in order to test the application in a controlled mainnet-like
environment. More details can be found [here](./HARDHAT.md)

<br>

### Docker Containers

Current we have two containers:

- `postgres-oasis-borrow` - This container contains Postgre database

- `multiply-proxy-actions` - This container contains all contracts related to multiply functionality deployed to a hardhat instance

#### Docker Containers Usage

Once you are in the project directory, please execute the following command:

```bash
docker-compose -f ./scripts/docker-compose.yml up
```

Alternative to that is to do the following steps:

```bash
cd ./scripts
docker-compose up
```

By executing one of the following commands you will run both containers at the same time. The process won't exit so you will be able to see the output in real time.

#### Docker Containers Configuration

If you open `docker-compose.yml` file under the `./scripts` folder, you will see that there are some environmental variables.
For the Postgres container, you won't have the need to change them that often. Also the names are pretty explanatory

The configuration params for `multiply-proxy-actions` container are as follows:

- `ALCHEMY_NODE` - The node that is used to read/sync data from the blockchain.
- `ETHERSCAN_API` - Etherscan API Key that is used to get information for a transaction
- `PRIV_KEY_MAINNET` - The private key of the first wallet address from the signer that is used
- `TENDERLY_USERNAME` - This is the username in tenderly. It is advised to create your own registration and use your own username. Register [here](https://tenderly.co/).
- `TENDERLY_PROJECT` - Once you have an account there is a default project - `project`. You can create other project names as well.
- `USE_DUMMY` - By defailt this value is `0`. If it is set to `1` then instead of the real 1inch Exchange implementation being used, you will use the DummyExchange implementation.
- `BLOCK_NUMBER` - There is a hardcoded number currently used - `13008355`. If you want to fork from a different one, please use this parameter.

<br>

## Multiply feature

We have added multiply functionality, where generated DAI is immediately used to swap for more collateral. This utilizes the multiply proxy actions smart contract.
The documentation for those contracts can be found [here](https://docs.google.com/document/d/1hCYIiWDc_Zm4oJasRfSZqiTk2xXpt1k7OXa52Lqd45I).

## Contributing

Contributions are welcome. Feel free to open issues or PR's to improve Oasis Borrow. We are always
open to suggestions on how best to improve the application to give the optimal user experience.

Please ensure that the tests pass, typechecks and conforms to the linting rules. The most convenient
way to do this is by calling:

```sh
yarn test:fix
```

<br>

## License

Copyright (C) 2021 Oazo Apps Limited, Licensed under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance with the License. You may obtain a copy
of the License at

> [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is
distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
implied. See the License for the specific language governing permissions and limitations under the
License.
