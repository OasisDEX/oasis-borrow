import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { networkNameToIdMap } from 'blockchain/networks'
import { useAccountContext } from 'components/context/AccountContextProvider'
import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import type { ProductHubItem } from 'features/productHub/types'
import { RefinanceModal } from 'features/refinance/components/RefinanceModal'
import { useRefinanceGeneralContext } from 'features/refinance/contexts/RefinanceGeneralContext'
import { useWalletManagement } from 'features/web3OnBoard/useConnection'
import type { PortfolioPosition } from 'handlers/portfolio/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { useModalContext } from 'helpers/modalHook'
import { useObservable } from 'helpers/observableHook'
import { LendingProtocol } from 'lendingProtocols'
import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Flex, Text } from 'theme-ui'

interface LowerLiquidationPriceProps {
  positionId: number | string
  collateral: BigNumber
  debt: BigNumber
  debtPrice: BigNumber
  liquidationPrice: BigNumber
  table: ProductHubItem[]
  refinanceToProtocols?: LendingProtocol[]
}

const LowerLiquidationPrice: FC<LowerLiquidationPriceProps> = ({
  positionId,
  collateral,
  debt,
  debtPrice,
  liquidationPrice,
  table,
  refinanceToProtocols,
}) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  const itemWithHighestMaxLtv = table
    .filter((item) => refinanceToProtocols?.includes(item.protocol))
    .reduce((prev, current) => {
      return prev && Number(prev?.maxLtv) > Number(current?.maxLtv) ? prev : current
    })

  if (!itemWithHighestMaxLtv.maxLtv) {
    return (
      <Text as="span" variant="boldParagraph3" color="primary100">
        {tPortfolio('refinance.banner.default', {
          id: positionId,
        })}
      </Text>
    )
  }

  const refinanceLiquidationPrice = debt
    .times(debtPrice)
    .div(collateral.times(itemWithHighestMaxLtv.maxLtv))

  const liquidationPriceChange = liquidationPrice
    .minus(refinanceLiquidationPrice)
    .div(liquidationPrice)

  return (
    <Text as="span" variant="boldParagraph3" color="primary100">
      {tPortfolio('refinance.banner.lowerLiquidationPrice', {
        id: positionId,
        value: formatDecimalAsPercent(liquidationPriceChange),
      })}
    </Text>
  )
}

interface RefinancePortfolioBannerProps {
  position: PortfolioPosition
}

export const RefinancePortfolioBanner: FC<RefinancePortfolioBannerProps> = ({ position }) => {
  const { userSettings$ } = useAccountContext()
  const [userSettingsData] = useObservable(userSettings$)
  const { wallet } = useWalletManagement()

  const { openModal } = useModalContext()
  const { t: tPortfolio } = useTranslation('portfolio')
  const {
    productHub: { table },
  } = usePreloadAppDataContext()

  const refinanceGeneralContext = useRefinanceGeneralContext()

  if (!position.rawPositionDetails) {
    return null
  }

  const {
    borrowRate,
    maxLtv,
    ltv,
    poolId,
    collateral,
    collateralPrice,
    debt,
    debtPrice,
    liquidationPrice,
  } = position.rawPositionDetails

  const refinanceToProtocols = {
    [LendingProtocol.Maker]: [LendingProtocol.SparkV3],
    [LendingProtocol.Ajna]: [],
    [LendingProtocol.AaveV3]: [],
    [LendingProtocol.AaveV2]: [],
    [LendingProtocol.SparkV3]: [],
    [LendingProtocol.MorphoBlue]: [],
  }[position.protocol]

  const content = {
    [LendingProtocol.Maker]: (
      <LowerLiquidationPrice
        liquidationPrice={new BigNumber(liquidationPrice)}
        debtPrice={new BigNumber(debtPrice)}
        debt={new BigNumber(debt)}
        positionId={position.positionId}
        collateral={new BigNumber(collateral)}
        refinanceToProtocols={refinanceToProtocols}
        table={table}
      />
    ),
    [LendingProtocol.Ajna]: null,
    [LendingProtocol.AaveV3]: null,
    [LendingProtocol.AaveV2]: null,
    [LendingProtocol.SparkV3]: null,
    [LendingProtocol.MorphoBlue]: null,
  }[position.protocol]

  const contextId =
    `${position.positionId}${position.primaryToken}${position.secondaryToken}`.toLowerCase()

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
          if (!position.rawPositionDetails || !userSettingsData) {
            console.error('Raw position details not defined')
            return
          }

          openModal(RefinanceModal, {
            contextInput: {
              poolData: {
                borrowRate: borrowRate,
                collateralTokenSymbol: position.primaryToken,
                debtTokenSymbol: position.secondaryToken,
                maxLtv: new RiskRatio(new BigNumber(maxLtv), RiskRatio.TYPE.LTV),
                poolId: poolId,
              },
              environment: {
                tokenPrices: {
                  [position.primaryToken]: collateralPrice,
                  [position.secondaryToken]: debtPrice,
                },
                chainId: networkNameToIdMap[position.network],
                slippage: userSettingsData.slippage.toNumber(),
                address: wallet?.address,
              },
              position: {
                positionId: { id: position.positionId.toString() },
                collateralAmount: collateral,
                debtAmount: debt,
                liquidationPrice: liquidationPrice,
                ltv: new RiskRatio(new BigNumber(ltv), RiskRatio.TYPE.LTV),
              },
              automations: position.automations,
              contextId,
            },
          })
        }}
      >
        {tPortfolio('refinance.title')}
      </Button>
    </Flex>
  ) : null
}
