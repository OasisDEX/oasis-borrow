import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { NetworkNames } from 'blockchain/networks'
import { networkNameToIdMap } from 'blockchain/networks'
import type { OmniProductType } from 'features/omni-kit/types'
import type {
  RefinanceContextInput,
  RefinanceContextInputAutomations,
} from 'features/refinance/contexts'
import type { MakerPoolId, SparkPoolId } from 'features/refinance/types'
import { LendingProtocol } from 'lendingProtocols'
import { ProtocolName } from 'summerfi-sdk-common'

export const getRefinancePortfolioContextInput = ({
  borrowRate,
  primaryToken,
  secondaryToken,
  collateralPrice,
  debtPrice,
  ethPrice,
  poolId,
  pairId,
  network,
  address,
  slippage,
  collateral,
  debt,
  liquidationPrice,
  ltv,
  maxLtv,
  automations,
  contextId,
  positionId,
  productType,
  isOwner,
}: {
  borrowRate: string
  primaryToken: string
  secondaryToken: string
  collateralPrice: string
  debtPrice: string
  ethPrice: string
  poolId: MakerPoolId | SparkPoolId
  pairId: number
  network: NetworkNames
  address?: string
  slippage: number
  collateral: string
  debt: string
  liquidationPrice: string
  ltv: string
  maxLtv: string
  automations: RefinanceContextInputAutomations
  contextId: string
  positionId: string | number
  productType: OmniProductType
  isOwner: boolean
}): RefinanceContextInput => {
  const protocol = {
    [ProtocolName.Spark]: LendingProtocol.SparkV3,
    [ProtocolName.Maker]: LendingProtocol.Maker,
    [ProtocolName.AAVEv2]: LendingProtocol.AaveV2,
    [ProtocolName.AAVEv3]: LendingProtocol.AaveV3,
    [ProtocolName.Ajna]: LendingProtocol.Ajna,
    [ProtocolName.MorphoBlue]: LendingProtocol.MorphoBlue,
  }[poolId.protocol.name]

  return {
    poolData: {
      borrowRate,
      collateralTokenSymbol: primaryToken,
      debtTokenSymbol: secondaryToken,
      maxLtv: new RiskRatio(new BigNumber(maxLtv), RiskRatio.TYPE.LTV),
      poolId,
      pairId,
    },
    environment: {
      tokenPrices: {
        [primaryToken]: collateralPrice,
        [secondaryToken]: debtPrice,
        ETH: ethPrice,
      },
      chainId: networkNameToIdMap[network],
      slippage,
      address,
      isOwner,
    },
    position: {
      productType,
      protocol,
      positionId: { id: positionId.toString() },
      collateralAmount: collateral,
      debtAmount: debt,
      liquidationPrice: liquidationPrice,
      ltv: new RiskRatio(new BigNumber(ltv), RiskRatio.TYPE.LTV),
    },
    automations: automations,
    contextId,
  }
}
