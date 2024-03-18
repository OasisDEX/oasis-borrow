import type { Network, SummerStrategy } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import type { ethers } from 'ethers'
import { omniNetworkMap, omniSwapVersionMap } from 'features/omni-kit/constants'
import type {
  Erc4626CommonPayload,
  Erc4626Dependencies,
} from 'features/omni-kit/protocols/erc-4626/actions'
import {
  erc4626ActionDepositEarn,
  erc4626ActionWithdrawEarn,
} from 'features/omni-kit/protocols/erc-4626/actions'
import {
  getErc4626ApyParameters,
  getErc4626PositionParameters,
} from 'features/omni-kit/protocols/erc-4626/helpers'
import type {
  OmniFormState,
  OmniGenericPosition,
  OmniSupportedNetworkIds,
} from 'features/omni-kit/types'
import { OmniEarnFormAction } from 'features/omni-kit/types'
import { getOneInchCall } from 'helpers/swap'

interface GetErc4626ParametersParams {
  isFormValid: boolean
  networkId: OmniSupportedNetworkIds
  quoteAddress: string
  quotePrecision: number
  quotePrice: BigNumber
  quoteToken: string
  rpcProvider: ethers.providers.Provider
  slippage: BigNumber
  state: OmniFormState
  vaultAddress: string
  walletAddress?: string
}

export async function getErc4626Parameters({
  isFormValid,
  networkId,
  quoteAddress,
  quotePrecision,
  quotePrice,
  quoteToken,
  rpcProvider,
  slippage,
  state,
  vaultAddress,
  walletAddress,
}: GetErc4626ParametersParams): Promise<SummerStrategy<OmniGenericPosition> | undefined> {
  const defaultPromise = Promise.resolve(undefined)

  const { action, dpmAddress } = state

  if (!isFormValid || !walletAddress) {
    return defaultPromise
  }

  const commonPayload: Erc4626CommonPayload = {
    proxyAddress: dpmAddress,
    quoteAddress,
    quotePrecision,
    quotePrice,
    quoteToken,
    slippage,
    user: walletAddress,
    vault: vaultAddress,
  }

  const dependencies: Erc4626Dependencies = {
    getLazyVaultSubgraphResponse: getErc4626PositionParameters(networkId),
    getSwapData: getOneInchCall(
      getNetworkContracts(networkId).swapAddress,
      networkId,
      omniSwapVersionMap[networkId],
    ),
    getVaultApyParameters: getErc4626ApyParameters({}),
    network: omniNetworkMap[networkId] as Network,
    operationExecutor: getNetworkContracts(networkId).operationExecutor.address,
    provider: rpcProvider,
  }

  switch (action) {
    case OmniEarnFormAction.OpenEarn:
    case OmniEarnFormAction.DepositEarn: {
      return erc4626ActionDepositEarn({
        commonPayload,
        dependencies,
        state,
      })
    }
    case OmniEarnFormAction.WithdrawEarn: {
      return erc4626ActionWithdrawEarn({
        commonPayload,
        dependencies,
        state,
      })
    }
    default:
      return defaultPromise
  }
}
