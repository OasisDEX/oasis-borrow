import { ProtocolName } from '@summer_fi/summerfi-sdk-common'
import { useAccountContext } from 'components/context/AccountContextProvider'
import { useRefinanceGeneralContext } from 'features/refinance/contexts/RefinanceGeneralContext'
import { RefinanceModalController } from 'features/refinance/controllers'
import {
  getAaveLikePoolId,
  getAaveLikePositionId,
  getMorphoPositionId,
  getRefinanceContextInput,
} from 'features/refinance/helpers'
import { getMorphoPoolId } from 'features/refinance/helpers/getMorphoPoolId'
import { omniProductTypeToSDKType } from 'features/refinance/helpers/omniProductTypeToSDKType'
import { useWalletManagement } from 'features/web3OnBoard/useConnection'
import type { PortfolioPosition } from 'handlers/portfolio/types'
import { useModalContext } from 'helpers/modalHook'
import { useObservable } from 'helpers/observableHook'
import { LendingProtocol } from 'lendingProtocols'
import { useParams } from 'next/navigation'
import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Flex, Text } from 'theme-ui'

// interface LowerLiquidationPriceProps {
//   positionId: number | string
//   collateral: BigNumber
//   debt: BigNumber
//   debtPrice: BigNumber
//   liquidationPrice: BigNumber
//   table: ProductHubItem[]
//   refinanceToProtocols?: LendingProtocol[]
// }

// To be useful once we will have clear definition on all copy variants within banner

// const LowerLiquidationPrice: FC<LowerLiquidationPriceProps> = ({
//   positionId,
//   collateral,
//   debt,
//   debtPrice,
//   liquidationPrice,
//   table,
//   refinanceToProtocols,
// }) => {
//   const { t: tPortfolio } = useTranslation('portfolio')
//
//   const itemWithHighestMaxLtv = table
//     .filter((item) => refinanceToProtocols?.includes(item.protocol))
//     .reduce((prev, current) => {
//       return prev && Number(prev?.maxLtv) > Number(current?.maxLtv) ? prev : current
//     })
//
//   if (!itemWithHighestMaxLtv.maxLtv) {
//     return (
//       <Text as="span" variant="boldParagraph3" color="primary100">
//         {tPortfolio('refinance.banner.default', {
//           id: positionId,
//         })}
//       </Text>
//     )
//   }
//
//   const refinanceLiquidationPrice = debt
//     .times(debtPrice)
//     .div(collateral.times(itemWithHighestMaxLtv.maxLtv))
//
//   const liquidationPriceChange = liquidationPrice
//     .minus(refinanceLiquidationPrice)
//     .div(liquidationPrice)
//
//   return (
//     <Text as="span" variant="boldParagraph3" color="primary100">
//       {tPortfolio('refinance.banner.lowerLiquidationPrice', {
//         id: positionId,
//         value: formatDecimalAsPercent(liquidationPriceChange),
//       })}
//     </Text>
//   )
// }

interface RefinancePortfolioBannerProps {
  position: PortfolioPosition
}

export const RefinancePortfolioBanner: FC<RefinancePortfolioBannerProps> = ({ position }) => {
  const { userSettings$ } = useAccountContext()
  const [userSettingsData] = useObservable(userSettings$)
  const { wallet } = useWalletManagement()
  const { handleSetContext } = useRefinanceGeneralContext()

  const { address: portfolioAddress } = useParams<{ address: string }>()

  const { openModal } = useModalContext()
  const { t: tPortfolio } = useTranslation('portfolio')

  const refinanceGeneralContext = useRefinanceGeneralContext()

  if (!position.rawPositionDetails) {
    return null
  }
  const {
    network,
    primaryToken,
    secondaryToken,
    positionId: vaultId,
    automations,
    protocol,
    type: productType,
  } = position

  const {
    borrowRate,
    maxLtv,
    ltv,
    poolId: poolIdRaw,
    positionId: positionIdRaw,
    pairId,
    collateralAmount,
    collateralPrice,
    debtAmount,
    debtPrice,
    liquidationPrice,
    ethPrice,
    dpmAddress,
    // ownerAddress,
  } = position.rawPositionDetails

  let positionId: any = positionIdRaw
  let poolId: any = poolIdRaw

  // we need to override raw positionId and poolId for Aavelike and Morpho as they require class instance
  switch (protocol) {
    case LendingProtocol.AaveV3:
      positionId = getAaveLikePositionId(LendingProtocol.AaveV3, positionId.id)
      poolId = getAaveLikePoolId(
        LendingProtocol.AaveV3,
        poolId.protocol.chainInfo,
        poolId.collateralToken,
        poolId.debtToken,
        poolId.emodeType,
      )
      break
    case LendingProtocol.SparkV3:
      positionId = getAaveLikePositionId(LendingProtocol.SparkV3, positionId.id)
      poolId = getAaveLikePoolId(
        LendingProtocol.SparkV3,
        poolId.protocol.chainInfo,
        poolId.collateralToken,
        poolId.debtToken,
        poolId.emodeType,
      )
      break
    case LendingProtocol.MorphoBlue:
      positionId = getMorphoPositionId(positionId.id)
      poolId = getMorphoPoolId(poolId.protocol.chainInfo, poolId.marketId)
      break
  }

  // To be useful once we will have clear definition on all copy variants within banner
  // const refinanceToProtocols = {
  //   [LendingProtocol.Maker]: [LendingProtocol.SparkV3],
  //   [LendingProtocol.Ajna]: [],
  //   [LendingProtocol.AaveV3]: [],
  //   [LendingProtocol.AaveV2]: [],
  //   [LendingProtocol.SparkV3]: [],
  //   [LendingProtocol.MorphoBlue]: [],
  // }[protocol]

  const content = {
    [LendingProtocol.Maker]: (
      <Text as="span" variant="boldParagraph3" color="primary100">
        {tPortfolio('refinance.banner.default', {
          id: vaultId,
          protocol: ProtocolName.Maker,
        })}
      </Text>
    ),
    [LendingProtocol.Ajna]: null,
    [LendingProtocol.Sky]: null,
    [LendingProtocol.AaveV3]: (
      <Text as="span" variant="boldParagraph3" color="primary100">
        {tPortfolio('refinance.banner.default', {
          id: vaultId,
          protocol: ProtocolName.AaveV3,
        })}
      </Text>
    ),
    [LendingProtocol.AaveV2]: null,
    [LendingProtocol.SparkV3]: (
      <Text as="span" variant="boldParagraph3" color="primary100">
        {tPortfolio('refinance.banner.default', {
          id: vaultId,
          protocol: ProtocolName.Spark,
        })}
      </Text>
    ),
    [LendingProtocol.MorphoBlue]: (
      <Text as="span" variant="boldParagraph3" color="primary100">
        {tPortfolio('refinance.banner.default', {
          id: vaultId,
          protocol: ProtocolName.MorphoBlue,
        })}
      </Text>
    ),
  }[protocol]

  const contextId = `${vaultId}${primaryToken}${secondaryToken}`.toLowerCase()

  const isDisabled =
    refinanceGeneralContext?.ctx?.environment?.contextId !== contextId &&
    !!refinanceGeneralContext?.ctx?.tx?.txDetails

  return content ? (
    <Flex
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: '24px',
        backgroundColor: 'neutral30',
        py: 2,
        px: 3,
        borderRadius: 'round',
        flexWrap: 'wrap',
      }}
    >
      {content}
      <Button
        variant="textual"
        sx={{ p: 'unset' }}
        disabled={isDisabled}
        onClick={() => {
          if (!position.rawPositionDetails || !userSettingsData || !productType) {
            console.error('Raw position details not defined')
            return
          }

          const contextInput = getRefinanceContextInput({
            borrowRate,
            primaryToken,
            secondaryToken,
            collateralPrice,
            debtPrice,
            ethPrice,
            poolId,
            network,
            address: wallet?.address,
            slippage: userSettingsData.slippage.toNumber(),
            collateralAmount,
            debtAmount,
            positionId,
            liquidationPrice,
            ltv,
            maxLtv,
            automations,
            contextId,
            positionType: omniProductTypeToSDKType(productType),
            pairId,
            isOwner: wallet?.address.toLowerCase() === portfolioAddress?.toLowerCase(),
            owner: dpmAddress,
            dpm: dpmAddress
              ? {
                  id: positionId.id,
                  address: dpmAddress,
                }
              : undefined,
          })

          handleSetContext(contextInput)
          openModal(RefinanceModalController, {
            contextInput,
          })
        }}
      >
        {tPortfolio('refinance.title')}
      </Button>
    </Flex>
  ) : null
}
