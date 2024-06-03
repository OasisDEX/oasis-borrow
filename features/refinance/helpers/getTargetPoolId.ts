import {
  AaveV3LendingPoolId,
  MorphoLendingPoolId,
  SparkLendingPoolId,
} from '@summer_fi/summerfi-sdk-client'
import { type IPoolId, type IProtocol, ProtocolName } from '@summer_fi/summerfi-sdk-common'
import { morphoMarkets } from 'features/omni-kit/protocols/morpho-blue/settings'
import type { RefinanceGeneralContextBase } from 'features/refinance/contexts'
import { getEmode } from 'features/refinance/helpers/getEmode'
import { mapTokenToSdkToken } from 'features/refinance/helpers/mapTokenToSdkToken'
import { replaceTokenSymbolETHWithWETH } from 'features/refinance/helpers/replaceETHwithWETH'
import { getTokenDisplayName } from 'helpers/getTokenDisplayName'

export const getTargetPoolId = (protocol: IProtocol, ctx: RefinanceGeneralContextBase): IPoolId => {
  const {
    environment: { chainInfo },
    form: {
      state: { strategy },
    },
  } = ctx
  if (!strategy?.primaryToken) {
    throw new Error('Primary token is required')
  }
  if (!strategy?.secondaryToken) {
    throw new Error('Secondary token is required')
  }
  const collateralToken = mapTokenToSdkToken(
    chainInfo,
    replaceTokenSymbolETHWithWETH(strategy?.primaryToken),
  )
  const debtToken = mapTokenToSdkToken(
    chainInfo,
    replaceTokenSymbolETHWithWETH(strategy?.secondaryToken),
  )

  switch (protocol.name) {
    case ProtocolName.Maker:
      throw new Error('Maker is not supported as a target protocol')
    case ProtocolName.Spark:
      return SparkLendingPoolId.createFrom({
        protocol: {
          name: 'Spark',
          chainInfo,
        },
        emodeType: getEmode(collateralToken, debtToken),
        collateralToken,
        debtToken,
      })
    case ProtocolName.AaveV3:
      return AaveV3LendingPoolId.createFrom({
        protocol: {
          name: 'AaveV3',
          chainInfo,
        },
        emodeType: getEmode(collateralToken, debtToken),
        collateralToken,
        debtToken,
      })
    case ProtocolName.AaveV2:
      throw new Error('AAVEv2 is not supported as a target protocol')
    case ProtocolName.MorphoBlue:
      const pairId = strategy?.label.split('-')[1]
      const resolvedCollateralToken = getTokenDisplayName(collateralToken.symbol)
      const resolvedDebtToken = getTokenDisplayName(debtToken.symbol)
      const marketId =
        morphoMarkets[chainInfo.chainId as keyof typeof morphoMarkets]?.[
          `${resolvedCollateralToken}-${resolvedDebtToken}`
        ][(pairId ? Number(pairId) : 1) - 1]

      return MorphoLendingPoolId.createFrom({
        protocol,
        marketId,
      })

    default:
      throw new Error(`Unsupported protocol: ${protocol.name}`)
  }
}
