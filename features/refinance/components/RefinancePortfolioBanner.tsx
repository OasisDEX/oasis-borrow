import BigNumber from 'bignumber.js'
import { useAccountContext } from 'components/context/AccountContextProvider'
import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import type { ProductHubItem } from 'features/productHub/types'
import { RefinanceModal } from 'features/refinance/components/RefinanceModal'
import { useRefinanceGeneralContext } from 'features/refinance/contexts/RefinanceGeneralContext'
import { getRefinanceContextInput } from 'features/refinance/helpers'
import { omniProductTypeToSDKType } from 'features/refinance/helpers/omniProductTypeToSDKType'
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
    network,
    primaryToken,
    secondaryToken,
    positionId,
    automations,
    protocol,
    type: productType,
  } = position

  const {
    borrowRate,
    maxLtv,
    ltv,
    poolId,
    pairId,
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
  }[protocol]

  const content = {
    [LendingProtocol.Maker]: (
      <LowerLiquidationPrice
        liquidationPrice={new BigNumber(liquidationPrice)}
        debtPrice={new BigNumber(debtPrice)}
        debt={new BigNumber(debt)}
        positionId={positionId}
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
  }[protocol]

  const contextId = `${positionId}${primaryToken}${secondaryToken}`.toLowerCase()

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

          openModal(RefinanceModal, {
            contextInput: getRefinanceContextInput({
              borrowRate,
              primaryToken,
              secondaryToken,
              collateralPrice,
              debtPrice,
              poolId,
              network,
              address: wallet?.address,
              slippage: userSettingsData.slippage.toNumber(),
              collateral,
              debt,
              positionId,
              liquidationPrice,
              ltv,
              maxLtv,
              automations,
              contextId,
              positionType: omniProductTypeToSDKType(productType),
              pairId,
            }),
          })
        }}
      >
        {tPortfolio('refinance.title')}
      </Button>
    </Flex>
  ) : null
}
