# Hardhat mainnet forking

We use hardhat when we want to test the system with a state that is exactly like the mainnet with
some modifications. We can simulate actions, impersonate accounts and see how the system will
behave.

In order to do that - some simple setup is required.

## Running the forked hardhat node

```
yarn hardhat:node
```

This will start the node with 10 addressed with ETH and start an RPC server at http://localhost:8545
and ws://localhost:8545. The adresses with the private keys will be printed to the console. You'll
need the keys later to add those accounts into metamask.

The node configuration lives in [hardhat.config.js](hardhat.config.js). To read more about the
possibilities go to: https://hardhat.org/guides/mainnet-forking.html

We fork the mainnet at the block 12192700. It's not a random number. At this time the ETH price
dropped and the next price is lower than the current price. This allows us to test the liquidations
without messing with the oracles.

We also use interval mining set at 1s, so that we have a new block every second.

## Connecting the Borrow frontend

1. Go to Metamask. Click on Networks and Custom RPC
2. Put the Network Name: Hardhat, RPC URL: http://0.0.0.0:8545 (Metamask will complain if you put
   localhost there as the localhost RPC url is already added), Chain ID: 2137
3. Click save. You'll only need to do that once
4. Now borrow will complain that your Metamask network doesn't match the borrow URL config. Add
   `?network=hardhat` at the end of the URL
5. Next - grab the first account out of the ones hardhat gave you and import it into the Metamask
   using the private key and klicking `Import Account`
6. One annoying thing to have in mind is that Metamask caches a lot of stuff about the
   account/network and throws if they change. For example nonces of latest block numbers. So when
   you restart the hardhat network - you'll need to manually reset the account in Metamask.
7. In order to do that go to `Settings -> Advanced -> Reset Account`
8. Now you should be able to see that your account has some ( a lot ) ETH and no CDPs. We'll fix
   that in the next section
9. Also keep in mind - that on the first run hardhat will fetch a lot of mainnet state and cache it
   on disk - so the first run will be significantly slower (UI will not load for a couple of
   minutes). But this will only happen once unless you change the block number in hardhat config.

## Generating initial state

```
yarn hardhat:setup
```

This will first create a DsProxy for your account. Then create 3 CDPs on ETH-A and print their CDP
ids.

1. Safe CDP with 250% collateralization rate
2. 2x Unsafe CDPs that will be up for liquidation after the next price update

Then it will trigger the price update and liquidate the third CDP using the second hardhat account
as a liquidator.

Now if you go back to the UI you will be able to see your 3 CDPs in different states.

If you later want to change this scenario - it lives in [here](./scripts/hardhat_setup.ts)

## Misc

The history will not work as the state of your CDP on your forked network will not match the state
of mainnet that the cache is tracking. TODO later

You are able to submit the transactions and they will be executed on the fork, so you can play with
mainnet state with no mainnet ETH

If you need some more accounts - feel free to grab the next ones and import them into the metamask
as described above
