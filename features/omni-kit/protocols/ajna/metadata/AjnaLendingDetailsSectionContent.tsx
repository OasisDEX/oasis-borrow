import type { AjnaPosition } from '@oasisdex/dma-library'
import { normalizeValue } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import {
  OmniContentCard,
  useOmniCardDataLiquidationPrice,
  useOmniCardDataLtv,
  useOmniCardDataTokensValue,
} from 'features/omni-kit/components/details-section'
import {
  AjnaContentCardNetBorrowCost,
  AjnaContentCardNetValue,
  useAjnaCardCardThresholdPrice,
  useAjnaCardDataCollateralDeposited,
  useAjnaCardDataLoanToValue,
  useAjnaCardDataPositionDebt,
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
  owner,
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

  const commonContentCardData = {
    changeVariant,
    isLoading: isSimulationLoading,
  }

  const liquidationPriceContentCardCommonData = useOmniCardDataLiquidationPrice({
    afterLiquidationPrice,
    liquidationPrice,
    ratioToCurrentPrice,
    unit: priceFormat,
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

  const thresholdPriceContentCardData = useAjnaCardCardThresholdPrice({
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
  const collateralPositionDebtAjnaData = useAjnaCardDataPositionDebt({
    debtAmount: position.debtAmount,
    quoteToken,
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
            {...collateralPositionDebtAjnaData}
          />
        </>
      )}
      {productType === OmniProductType.Multiply && (
        <>
          <AjnaContentCardNetBorrowCost
            collateralToken={collateralToken}
            quoteToken={quoteToken}
            owner={owner}
            netBorrowCost={position.pool.interestRate}
            changeVariant={changeVariant}
            modalTheme={ajnaExtensionTheme}
          />
          <AjnaContentCardNetValue
            isLoading={isSimulationLoading}
            netValue={position.collateralAmount
              .times(collateralPrice)
              .minus(position.debtAmount.times(quotePrice))}
            afterNetValue={simulation?.collateralAmount
              .times(collateralPrice)
              .minus(simulation.debtAmount.times(quotePrice))}
            position={position}
            collateralPrice={collateralPrice}
            collateralToken={collateralToken}
            // For now we need to hide P&L for proxies with many positions
            // because subgraph doesn't support it yet
            pnlNotAvailable={isProxyWithManyPositions}
            showPnl={!isOpening}
            changeVariant={changeVariant}
            modalTheme={ajnaExtensionTheme}
          />
        </>
      )}
    </>
  )
}
