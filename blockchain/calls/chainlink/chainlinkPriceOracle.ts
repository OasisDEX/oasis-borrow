import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { CallDef } from 'blockchain/calls/callsHelpers'
import { getNetworkContracts } from 'blockchain/contracts'
import { MainnetContracts, mainnetContracts } from 'blockchain/contracts/mainnet'
import { ChainlinkPriceOracle } from 'types/web3-v1-contracts'

const USD_CHAINLINK_PRECISION = 8

export function getChainlinkOraclePrice(
  contractName: keyof MainnetContracts['chainlinkPriceOracle'],
): CallDef<void, BigNumber> {
  if (!contractName || !mainnetContracts['chainlinkPriceOracle'][contractName]) {
    throw new Error(`ChainlinkPriceOracle ${contractName} not found`)
  }
  return {
    call: (_, { contract, chainId }) =>
      contract<ChainlinkPriceOracle>(
        getNetworkContracts(chainId).chainlinkPriceOracle[contractName],
      ).methods.latestAnswer,
    prepareArgs: () => [],
    postprocess: (answer) => {
      return amountFromWei(new BigNumber(answer), USD_CHAINLINK_PRECISION)
    },
  }
}
