[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![codecov](https://codecov.io/gh/OasisDEX/oasis-borrow/branch/main/graph/badge.svg?token=KMXTAUFL48)](https://app.codecov.io/gh/OasisDEX/oasis-borrow/branch/main)

<br> <br>

<div align="center">
  <img src="https://github.com/OasisDEX/oasis-borrow/blob/pm/readme-updates/public/static/img/new-logo.svg" width="500" height="500">
</div>
<br>
<br>

| Environment | URL                                                          | Branch |                                     Build Status                                     |
| ----------- | ------------------------------------------------------------ | :----: | :----------------------------------------------------------------------------------: |
| Production  | [oasis.app/borrow](https://oasis.app/borrow)                 | `main` | ![](https://github.com/github/docs/actions/workflows/main.yml/badge.svg?branch=main) |
| Staging     | [staging.oasis.app/borrow](https://staging.oasis.app/borrow) | `dev`  | ![](https://github.com/github/docs/actions/workflows/main.yml/badge.svg?branch=dev)  |

<br>

# Oasis Borrow

[Oasis Borrow](https://oasis.app/borrow) is the most popular user-interface to interact with the
[Maker protocol](https://docs.makerdao.com/). It enables users to generate Dai, the most used and
decentralized stablecoin, using a variety of crypto assets as collateral.

<br>

### Getting Started

In order to start developing locally, clone the repository

```sh
git clone https://github.com/OasisDEX/oasis-borrow.git
```

Navigate to the project folder and install all dependencies

```sh
yarn
```

To create up a local development instance we must first spin up the database prior before starting
the web server.

```sh
# Open one terminal and run:
./scripts/dev.sh
```

Monitor the logs and wait for the migrations to complete. This should be evident by a log equivalent
to `Migrations DONE`

In a second terminal we can then serve the web server instance over http or https (https is required
for some wallets):

```sh
yarn start

# Optionally
HTTPS=true yarn start
```

Site is viewable on http://localhost:3000 or https://localhost:3443 respectively

<br>

### Storybook

We utilise storybook for visualising some of our ui components in isolation.

```sh
yarn storybook
```

Stories should be viewable at http://localhost:6006 A live version of storybook on parity with the
staging environment can be found by navigating to https://storybook.oasis.app.

For specific deployments, users can navigate to
[https://storybook.oasis.app/<COMMIT_HASH>/index.html](https://storybook.oasis.app/<COMMIT_HASH>/index.html])
where the `<COMMIT_HASH>` is the shortened commit hash of the branch/commit that has been pushed.

<br>

### Hardhat

In addition, we make use of hardhat in order to test the application in a controlled mainnet-like
environment. More details can be found [here](./HARDHAT.md)

<br>

## Contributing

Cotributions are welcome. Feel free to open issues or PR's to improve Oasis Borrow. We are always
open to suggestions on how best to improve the application to give the optimal user experience.

Please ensure that the tests pass, typechecks and conforms to the linting rules. The most convenient
way to do this is by calling:

```sh
yarn test:fix
```

<br>

## License

[Apache v2.0](https://www.apache.org/licenses/LICENSE-2.0)
