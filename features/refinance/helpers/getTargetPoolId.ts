import {
  AaveV3LendingPoolId,
  AaveV3Protocol,
  MorphoLendingPoolId,
  MorphoProtocol,
  SparkLendingPoolId,
  SparkProtocol,
} from '@summer_fi/summerfi-sdk-client'
import { type ILendingPoolId, type IProtocol, ProtocolName } from '@summer_fi/summerfi-sdk-common'
import { morphoMarkets } from 'features/omni-kit/protocols/morpho-blue/settings'
import type { RefinanceGeneralContextBase } from 'features/refinance/contexts'
import { getEmode } from 'features/refinance/helpers/getEmode'
import { mapTokenToSdkToken } from 'features/refinance/helpers/mapTokenToSdkToken'
import { replaceTokenSymbolETHWithWETH } from 'features/refinance/helpers/replaceETHwithWETH'
import { getTokenDisplayName } from 'helpers/getTokenDisplayName'
import { LendingProtocol } from 'lendingProtocols'

export const getTargetPoolId = (
  protocol: IProtocol,
  ctx: RefinanceGeneralContextBase,
): ILendingPoolId => {
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
        protocol: SparkProtocol.createFrom({ chainInfo }),
        emodeType: getEmode(collateralToken, debtToken, LendingProtocol.SparkV3),
        collateralToken,
        debtToken,
      }) as any as ILendingPoolId
    case ProtocolName.AaveV3:
      return AaveV3LendingPoolId.createFrom({
        protocol: AaveV3Protocol.createFrom({ chainInfo }),
        emodeType: getEmode(collateralToken, debtToken, LendingProtocol.AaveV3),
        collateralToken,
        debtToken,
      }) as any as ILendingPoolId
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

      if (!marketId) {
        throw new Error(`Market ID not found for ${resolvedCollateralToken}-${resolvedDebtToken}`)
      }

      return MorphoLendingPoolId.createFrom({
        protocol: MorphoProtocol.createFrom({ chainInfo }),
        marketId: marketId as `0x${string}`,
      }) as any as ILendingPoolId

    default:
      throw new Error(`Unsupported protocol: ${protocol.name}`)
  }
}
