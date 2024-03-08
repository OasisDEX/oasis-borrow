import type { AjnaPosition } from '@oasisdex/dma-library'
import { normalizeValue } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import {
  OmniCardDataCollateralDepositedModal,
  OmniCardDataPositionDebtModal,
  OmniContentCard,
  useOmniCardDataBuyingPower,
  useOmniCardDataLiquidationPrice,
  useOmniCardDataLtv,
  useOmniCardDataNetValue,
  useOmniCardDataTokensValue,
} from 'features/omni-kit/components/details-section'
import {
  getOmniNetValuePnlData,
  mapBorrowCumulativesToOmniCumulatives,
} from 'features/omni-kit/helpers'
import {
  AjnaCardDataLtvModal,
  useAjnaCardDataBuyingPower,
  useAjnaCardDataNetValueLending,
  useAjnaCardDataThresholdPrice,
} from 'features/omni-kit/protocols/ajna/components/details-section'
import { useAjnaCardDataLiquidationPrice } from 'features/omni-kit/protocols/ajna/components/details-section/'
import { OmniProductType } from 'features/omni-kit/types'
import { one } from 'helpers/zero'
import type { FC } from 'react'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'

interface AjnaDetailsSectionContentProps {
  changeVariant: 'positive' | 'negative'
  collateralPrice: BigNumber
  collateralToken: string
  isOpening: boolean
  isOracless: boolean
  isProxyWithManyPositions: boolean
  isShort: boolean
  isSimulationLoading?: boolean
  owner: string
  position: AjnaPosition
  priceFormat: string
  productType: OmniProductType
  quotePrice: BigNumber
  quoteToken: string
  shouldShowDynamicLtv: boolean
  isYieldLoop: boolean
  simulation?: AjnaPosition
}

export const AjnaLendingDetailsSectionContent: FC<AjnaDetailsSectionContentProps> = ({
  changeVariant,
  collateralPrice,
  collateralToken,
  isOpening,
  isOracless,
  isShort,
  isSimulationLoading,
  position,
  priceFormat,
  productType,
  quotePrice,
  quoteToken,
  shouldShowDynamicLtv,
  simulation,
  isYieldLoop,
}) => {
  const liquidationPrice = normalizeValue(
    isShort ? one.div(position.liquidationPrice) : position.liquidationPrice,
  )
  const afterLiquidationPrice =
    simulation?.liquidationPrice &&
    normalizeValue(isShort ? one.div(simulation.liquidationPrice) : simulation.liquidationPrice)
  const ratioToCurrentPrice = one.minus(
    isShort
      ? normalizeValue(one.div(position.liquidationToMarketPrice))
      : position.liquidationToMarketPrice,
  )

  const netValue = position.collateralAmount
    .times(collateralPrice)
    .minus(position.debtAmount.times(quotePrice))
  const afterNetValue = simulation?.collateralAmount
    .times(collateralPrice)
    .minus(simulation?.debtAmount.times(quotePrice))

  const commonContentCardData = {
    changeVariant,
    isLoading: isSimulationLoading,
  }

  const liquidationPriceContentCardCommonData = useOmniCardDataLiquidationPrice({
    afterLiquidationPrice,
    liquidationPrice,
    unit: priceFormat,
    ...(!isOracless && {
      ratioToCurrentPrice,
    }),
  })
  const liquidationPriceContentCardAjnaData = useAjnaCardDataLiquidationPrice({
    afterLiquidationPrice,
    isOracless,
    liquidationPrice,
    priceFormat,
  })

  const ltvContentCardCommonData = useOmniCardDataLtv({
    afterLtv: simulation?.riskRatio.loanToValue,
    ltv: position.riskRatio.loanToValue,
    ...(shouldShowDynamicLtv && { maxLtv: position.maxRiskRatio.loanToValue }),
    modal: (
      <AjnaCardDataLtvModal
        ltv={position.riskRatio.loanToValue}
        {...(shouldShowDynamicLtv && { maxLtv: position.maxRiskRatio.loanToValue })}
      />
    ),
  })
  if (ltvContentCardCommonData.footnote && typeof ltvContentCardCommonData.footnote[0] !== 'string')
    ltvContentCardCommonData.footnote[0].key = 'ajna.content-card.ltv.footnote'

  const thresholdPriceContentCardData = useAjnaCardDataThresholdPrice({
    collateralAmount: position.collateralAmount,
    debtAmount: position.debtAmount,
    afterThresholdPrice: simulation?.thresholdPrice,
    thresholdPrice: position.thresholdPrice,
    unit: priceFormat,
    ...(shouldShowDynamicLtv && { lup: position.pool.lowestUtilizedPrice }),
  })

  const collateralDepositedContentCardCommonData = useOmniCardDataTokensValue({
    afterTokensAmount: simulation?.collateralAmount,
    tokensAmount: position.collateralAmount,
    tokensSymbol: collateralToken,
    translationCardName: 'collateral-deposited',
    ...(!isOracless && { tokensPrice: collateralPrice }),
    modal: (
      <OmniCardDataCollateralDepositedModal
        collateralAmount={position.collateralAmount}
        collateralToken={collateralToken}
        theme={ajnaExtensionTheme}
      />
    ),
  })

  const positionDebtContentCardCommonData = useOmniCardDataTokensValue({
    afterTokensAmount: simulation?.debtAmount,
    tokensAmount: position.debtAmount,
    tokensSymbol: quoteToken,
    translationCardName: 'position-debt',
    ...(!isOracless && { tokensPrice: quotePrice }),
    modal: (
      <OmniCardDataPositionDebtModal
        debtAmount={position.debtAmount}
        quoteToken={quoteToken}
        theme={ajnaExtensionTheme}
      />
    ),
  })

  const netValueContentCardCommonData = useOmniCardDataNetValue({
    afterNetValue,
    netValue,
  })
  const netValueContentCardAjnaData = useAjnaCardDataNetValueLending(
    !isOpening
      ? getOmniNetValuePnlData({
          cumulatives: mapBorrowCumulativesToOmniCumulatives(position.pnl.cumulatives),
          productType,
          collateralTokenPrice: collateralPrice,
          debtTokenPrice: quotePrice,
          netValueInCollateralToken: netValue.div(collateralPrice),
          netValueInDebtToken: netValue.div(quotePrice),
          collateralToken,
          debtToken: quoteToken,
          useDebtTokenAsPnL: isYieldLoop,
        })
      : undefined,
  )

  const buyingPowerContentCardCommonData = useOmniCardDataBuyingPower({
    buyingPower: position.buyingPower,
    collateralPrice,
    collateralToken,
    afterBuyingPower: simulation?.buyingPower,
  })
  const buyingPowerContentCardAjnaData = useAjnaCardDataBuyingPower({
    shouldShowDynamicLtv,
  })

  return (
    <>
      <OmniContentCard
        {...commonContentCardData}
        {...liquidationPriceContentCardCommonData}
        {...liquidationPriceContentCardAjnaData}
      />
      {isOracless ? (
        <OmniContentCard {...commonContentCardData} {...thresholdPriceContentCardData} />
      ) : (
        <OmniContentCard {...commonContentCardData} {...ltvContentCardCommonData} />
      )}

      {productType === OmniProductType.Borrow && (
        <>
          <OmniContentCard
            {...commonContentCardData}
            {...collateralDepositedContentCardCommonData}
          />
          <OmniContentCard {...commonContentCardData} {...positionDebtContentCardCommonData} />
        </>
      )}
      {productType === OmniProductType.Multiply && (
        <>
          <OmniContentCard
            {...commonContentCardData}
            {...netValueContentCardCommonData}
            {...netValueContentCardAjnaData}
          />
          <OmniContentCard
            {...commonContentCardData}
            {...buyingPowerContentCardCommonData}
            {...buyingPowerContentCardAjnaData}
          />
        </>
      )}
    </>
  )
}
