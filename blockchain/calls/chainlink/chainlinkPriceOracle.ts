import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { CallDef } from 'blockchain/calls/callsHelpers'
import { NetworkConfig, networksByName } from 'blockchain/config'
import { ChainlinkPriceOracle } from 'types/web3-v1-contracts'

const USD_CHAINLINK_PRECISION = 8

export function getChainlinkOraclePrice(
  contractName: keyof NetworkConfig['chainlinkPriceOracle'],
): CallDef<void, BigNumber> {
  if (!contractName || !networksByName['ethereumMainnet']['chainlinkPriceOracle'][contractName]) {
    throw new Error(`ChainlinkPriceOracle ${contractName} not found`)
  }
  return {
    call: (_, { contract, chainlinkPriceOracle }) =>
      contract<ChainlinkPriceOracle>(chainlinkPriceOracle[contractName]).methods.latestAnswer,
    prepareArgs: () => [],
    postprocess: (answer) => {
      return amountFromWei(new BigNumber(answer), USD_CHAINLINK_PRECISION)
    },
  }
}
