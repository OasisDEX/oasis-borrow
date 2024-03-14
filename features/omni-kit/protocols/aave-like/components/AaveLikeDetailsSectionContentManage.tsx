import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import { normalizeValue } from '@oasisdex/dma-library'
import { useAaveEarnYields } from 'features/aave/hooks'
import {
  OmniCardDataCollateralDepositedModal,
  OmniCardDataLiquidationPriceModal,
  OmniCardDataLtvModal,
  OmniCardDataPositionDebtModal,
  OmniContentCard,
  useOmniCardDataBuyingPower,
  useOmniCardDataLiquidationPrice,
  useOmniCardDataLtv,
  useOmniCardDataNetApy,
  useOmniCardDataNetValue,
  useOmniCardDataTokensValue,
} from 'features/omni-kit/components/details-section'
import { OmniCardDataNetApyModal } from 'features/omni-kit/components/details-section/modals/OmniCardDataNetApyModal'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import {
  getOmniNetValuePnlData,
  mapBorrowCumulativesToOmniCumulatives,
} from 'features/omni-kit/helpers'
import { useOmniSimulationYields } from 'features/omni-kit/hooks'
import { useAjnaCardDataNetValueLending } from 'features/omni-kit/protocols/ajna/components/details-section'
import { OmniProductType } from 'features/omni-kit/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { one } from 'helpers/zero'
import type { AaveLikeLendingProtocol } from 'lendingProtocols'
import { LendingProtocolLabel } from 'lendingProtocols'
import type { FC } from 'react'
import React from 'react'

export const AaveLikeDetailsSectionContentManage: FC = () => {
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
      isYieldLoopWithData,
      isYieldLoop,
      protocol,
      network,
      collateralPrecision,
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

  const simulations = isYieldLoopWithData
    ? useOmniSimulationYields({
        amount: castedPosition.collateralAmount.shiftedBy(collateralPrecision),
        token: collateralToken,
        getYields: () =>
          useAaveEarnYields(
            castedPosition.riskRatio,
            protocol as AaveLikeLendingProtocol,
            network.name,
            ['7Days'],
          ),
      })
    : undefined

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
        priceHistory={
          // TODO once yield loop work will be on the plate, we will need to store links per specific pair
          // probably the best place would be the settings file
          isYieldLoopWithData ? EXTERNAL_LINKS.DUNE_ORG_STETHETH_PEG_HISTORY : undefined
        }
      />
    ),
  })

  const ltvContentCardCommonData = useOmniCardDataLtv({
    afterLtv: simulation?.riskRatio.loanToValue,
    ltv: castedPosition.riskRatio.loanToValue,
    maxLtv: castedPosition.category.liquidationThreshold,
    modal: (
      <OmniCardDataLtvModal
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
  const netApyContentCardCommonData = useOmniCardDataNetApy({
    netApy: simulations?.apy?.div(100),
    modal: (
      <OmniCardDataNetApyModal
        collateralToken={collateralToken}
        quoteToken={quoteToken}
        protocol={LendingProtocolLabel[protocol]}
      />
    ),
  })

  const netValueContentCardAaveData = useAjnaCardDataNetValueLending(
    !isOpening
      ? getOmniNetValuePnlData({
          cumulatives: mapBorrowCumulativesToOmniCumulatives(castedPosition.pnl.cumulatives),
          productType,
          collateralTokenPrice: collateralPrice,
          debtTokenPrice: quotePrice,
          netValueInCollateralToken: position.netValue.div(collateralPrice),
          netValueInDebtToken: position.netValue.div(quotePrice),
          collateralToken,
          debtToken: quoteToken,
          useDebtTokenAsPnL: isYieldLoop,
        })
      : undefined,
  )

  return isYieldLoopWithData ? (
    <>
      <OmniContentCard
        {...commonContentCardData}
        {...netValueContentCardCommonData}
        {...netValueContentCardAaveData}
      />
      <OmniContentCard {...commonContentCardData} {...netApyContentCardCommonData} />
      <OmniContentCard {...commonContentCardData} {...liquidationPriceContentCardCommonData} />
    </>
  ) : (
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
            {...netValueContentCardAaveData}
          />
          <OmniContentCard {...commonContentCardData} {...buyingPowerContentCardCommonData} />
        </>
      )}
    </>
  )
}
