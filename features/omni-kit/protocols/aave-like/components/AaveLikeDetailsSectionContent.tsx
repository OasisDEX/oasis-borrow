import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import { normalizeValue } from '@oasisdex/dma-library'
import {
  OmniCardDataCollateralDepositedModal,
  OmniCardDataLiquidationPriceModal,
  OmniCardDataPositionDebtModal,
  OmniContentCard,
  useOmniCardDataBuyingPower,
  useOmniCardDataLiquidationPrice,
  useOmniCardDataLtv,
  useOmniCardDataNetValue,
  useOmniCardDataTokensValue,
} from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { getOmniNetValuePnlData } from 'features/omni-kit/helpers'
import { useAjnaCardDataNetValueLending } from 'features/omni-kit/protocols/ajna/components/details-section'
import { MorphoCardDataLtvModal } from 'features/omni-kit/protocols/morpho-blue/components/details-sections'
import { OmniProductType } from 'features/omni-kit/types'
import { one } from 'helpers/zero'
import type { FC } from 'react'
import React from 'react'

export const AaveLikeDetailsSectionContent: FC = () => {
  const {
    environment: {
      collateralPrice,
      collateralToken,
      isShort,
      priceFormat,
      productType,
      quotePrice,
      quoteToken,
      isOpening,
    },
  } = useOmniGeneralContext()
  const {
    position: {
      isSimulationLoading,
      currentPosition: { position, simulation },
    },
    dynamicMetadata: {
      values: { changeVariant },
    },
  } = useOmniProductContext(productType as OmniProductType.Borrow | OmniProductType.Multiply)

  const castedPosition = position as AaveLikePositionV2

  const liquidationPrice = normalizeValue(
    isShort ? one.div(castedPosition.liquidationPrice) : castedPosition.liquidationPrice,
  )
  const afterLiquidationPrice =
    simulation?.liquidationPrice &&
    normalizeValue(isShort ? one.div(simulation.liquidationPrice) : simulation.liquidationPrice)
  const ratioToCurrentPrice = normalizeValue(
    one.minus(
      isShort
        ? one.div(castedPosition.liquidationToMarketPrice)
        : castedPosition.liquidationToMarketPrice,
    ),
  )

  const commonContentCardData = {
    changeVariant,
    isLoading: isSimulationLoading,
  }

  const liquidationPriceContentCardCommonData = useOmniCardDataLiquidationPrice({
    afterLiquidationPrice: afterLiquidationPrice,
    liquidationPrice: liquidationPrice,
    unit: priceFormat,
    ratioToCurrentPrice,
    modal: (
      <OmniCardDataLiquidationPriceModal
        liquidationPenalty={castedPosition.liquidationPenalty}
        liquidationPrice={liquidationPrice}
        priceFormat={priceFormat}
        ratioToCurrentPrice={ratioToCurrentPrice}
      />
    ),
  })

  const ltvContentCardCommonData = useOmniCardDataLtv({
    afterLtv: simulation?.riskRatio.loanToValue,
    ltv: castedPosition.riskRatio.loanToValue,
    maxLtv: castedPosition.category.liquidationThreshold,
    modal: (
      <MorphoCardDataLtvModal
        ltv={castedPosition.riskRatio.loanToValue}
        maxLtv={castedPosition.category.liquidationThreshold}
      />
    ),
  })

  const collateralDepositedContentCardCommonData = useOmniCardDataTokensValue({
    afterTokensAmount: simulation?.collateralAmount,
    tokensAmount: castedPosition.collateralAmount,
    tokensPrice: collateralPrice,
    tokensSymbol: collateralToken,
    translationCardName: 'collateral-deposited',
    modal: (
      <OmniCardDataCollateralDepositedModal
        collateralAmount={castedPosition.collateralAmount}
        collateralToken={collateralToken}
      />
    ),
  })

  const positionDebtContentCardCommonData = useOmniCardDataTokensValue({
    afterTokensAmount: simulation?.debtAmount,
    tokensAmount: castedPosition.debtAmount,
    tokensPrice: quotePrice,
    tokensSymbol: quoteToken,
    translationCardName: 'position-debt',
    modal: (
      <OmniCardDataPositionDebtModal
        debtAmount={castedPosition.debtAmount}
        quoteToken={quoteToken}
      />
    ),
  })

  const buyingPowerContentCardCommonData = useOmniCardDataBuyingPower({
    buyingPower: castedPosition.buyingPower,
    collateralPrice,
    collateralToken,
    afterBuyingPower: simulation?.buyingPower,
  })

  const netValueContentCardCommonData = useOmniCardDataNetValue({
    afterNetValue: simulation?.netValue,
    netValue: position.netValue,
  })

  const netValueContentCardAjnaData = useAjnaCardDataNetValueLending(
    !isOpening
      ? getOmniNetValuePnlData({
          cumulatives: {
            cumulativeDepositUSD: castedPosition.pnl.cumulatives.borrowCumulativeDepositUSD,
            cumulativeWithdrawUSD: castedPosition.pnl.cumulatives.borrowCumulativeWithdrawUSD,
            cumulativeFeesUSD: castedPosition.pnl.cumulatives.borrowCumulativeFeesUSD,
            cumulativeWithdrawInCollateralToken:
              castedPosition.pnl.cumulatives.borrowCumulativeWithdrawInCollateralToken,
            cumulativeDepositInCollateralToken:
              castedPosition.pnl.cumulatives.borrowCumulativeDepositInCollateralToken,
            cumulativeFeesInCollateralToken:
              castedPosition.pnl.cumulatives.borrowCumulativeFeesInCollateralToken,
            cumulativeWithdrawInQuoteToken:
              castedPosition.pnl.cumulatives.borrowCumulativeWithdrawInQuoteToken,
            cumulativeDepositInQuoteToken:
              castedPosition.pnl.cumulatives.borrowCumulativeDepositInQuoteToken,
            cumulativeFeesInQuoteToken:
              castedPosition.pnl.cumulatives.borrowCumulativeFeesInQuoteToken,
          },
          productType,
          collateralTokenPrice: collateralPrice,
          debtTokenPrice: quotePrice,
          netValueInCollateralToken: position.netValue.div(collateralPrice),
          netValueInDebtToken: position.netValue.div(quotePrice),
          collateralToken,
          debtToken: quoteToken,
        })
      : undefined,
  )

  return (
    <>
      <OmniContentCard {...commonContentCardData} {...liquidationPriceContentCardCommonData} />
      <OmniContentCard {...commonContentCardData} {...ltvContentCardCommonData} />
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
          <OmniContentCard {...commonContentCardData} {...buyingPowerContentCardCommonData} />
        </>
      )}
    </>
  )
}
