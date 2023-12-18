import type { AjnaCumulativesData, AjnaPosition } from '@oasisdex/dma-library'
import { normalizeValue } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import {
  OmniContentCard,
  useOmniCardDataBuyingPower,
  useOmniCardDataLiquidationPrice,
  useOmniCardDataLtv,
  useOmniCardDataNetValue,
  useOmniCardDataTokensValue,
} from 'features/omni-kit/components/details-section'
import {
  useAjnaCardDataCollateralDeposited,
  useAjnaCardDataLoanToValue,
  useAjnaCardDataNetValueLending,
  useAjnaCardDataPositionDebt,
  useAjnaCardDataThresholdPrice,
} from 'features/omni-kit/protocols/ajna/components/details-section'
import { useAjnaCardDataLiquidationPrice } from 'features/omni-kit/protocols/ajna/components/details-section/'
import { OmniProductType } from 'features/omni-kit/types'
import { one } from 'helpers/zero'
import type { FC } from 'react'
import React from 'react'

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
  simulation?: AjnaPosition
}

export const AjnaLendingDetailsSectionContent: FC<AjnaDetailsSectionContentProps> = ({
  changeVariant,
  collateralPrice,
  collateralToken,
  isOpening,
  isOracless,
  isProxyWithManyPositions,
  isShort,
  isSimulationLoading,
  position,
  priceFormat,
  productType,
  quotePrice,
  quoteToken,
  shouldShowDynamicLtv,
  simulation,
}) => {
  const liquidationPrice = isShort
    ? normalizeValue(one.div(position.liquidationPrice))
    : position.liquidationPrice
  const afterLiquidationPrice =
    simulation?.liquidationPrice &&
    (isShort ? normalizeValue(one.div(simulation.liquidationPrice)) : simulation.liquidationPrice)
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
  })
  const ltvContentCardAjnaData = useAjnaCardDataLoanToValue({
    ltv: position.riskRatio.loanToValue,
    ...(shouldShowDynamicLtv && { maxLtv: position.maxRiskRatio.loanToValue }),
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
  })
  const collateralDepositedContentCardAjnaData = useAjnaCardDataCollateralDeposited({
    collateralAmount: position.collateralAmount,
    collateralToken,
  })

  const positionDebtContentCardCommonData = useOmniCardDataTokensValue({
    afterTokensAmount: simulation?.debtAmount,
    tokensAmount: position.debtAmount,
    tokensSymbol: quoteToken,
    translationCardName: 'position-debt',
    ...(!isOracless && { tokensPrice: quotePrice }),
  })
  const positionDebtContentCardAjnaData = useAjnaCardDataPositionDebt({
    debtAmount: position.debtAmount,
    quoteToken,
  })

  const netValueContentCardCommonData = useOmniCardDataNetValue({
    afterNetValue,
    netValue,
    ...(!isOpening &&
      !isProxyWithManyPositions && {
        pnlUSD: position.pnl.cumulatives.borrowCumulativeDepositUSD.times(position.pnl.withoutFees),
      }),
  })
  const netValueContentCardAjnaData = useAjnaCardDataNetValueLending({
    collateralPrice,
    collateralToken,
    cumulatives: position.pnl.cumulatives as AjnaCumulativesData & {
      borrowCumulativeDepositInQuoteToken: BigNumber
      borrowCumulativeDepositInCollateralToken: BigNumber
      borrowCumulativeWithdrawInQuoteToken: BigNumber
      borrowCumulativeWithdrawInCollateralToken: BigNumber
      borrowCumulativeCollateralDeposit: BigNumber
      borrowCumulativeCollateralWithdraw: BigNumber
      borrowCumulativeDebtDeposit: BigNumber
      borrowCumulativeDebtWithdraw: BigNumber
      borrowCumulativeFeesInQuoteToken: BigNumber
      borrowCumulativeFeesInCollateralToken: BigNumber
    },
    netValue,
    ...(!isOpening &&
      !isProxyWithManyPositions && {
        pnl: position.pnl.withoutFees,
        pnlUSD: position.pnl.cumulatives.borrowCumulativeDepositUSD.times(position.pnl.withoutFees),
      }),
  })

  const buyingPowerContentCardCommonData = useOmniCardDataBuyingPower({
    buyingPower: position.buyingPower,
    collateralPrice,
    collateralToken,
    afterBuyingPower: simulation?.buyingPower,
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
        <OmniContentCard
          {...commonContentCardData}
          {...ltvContentCardCommonData}
          {...ltvContentCardAjnaData}
        />
      )}

      {productType === OmniProductType.Borrow && (
        <>
          <OmniContentCard
            {...commonContentCardData}
            {...collateralDepositedContentCardCommonData}
            {...collateralDepositedContentCardAjnaData}
          />
          <OmniContentCard
            {...commonContentCardData}
            {...positionDebtContentCardCommonData}
            {...positionDebtContentCardAjnaData}
          />
        </>
      )}
      {productType === OmniProductType.Multiply && (
        <>
          <OmniContentCard
            {...commonContentCardData}
            {...netValueContentCardCommonData}
            {...netValueContentCardAjnaData}
          />
          <OmniContentCard {...commonContentCardData} {...buyingPowerContentCardCommonData} />
        </>
      )}
    </>
  )
}
