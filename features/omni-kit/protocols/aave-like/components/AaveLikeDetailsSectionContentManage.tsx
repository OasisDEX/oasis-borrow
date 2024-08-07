import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import { normalizeValue } from '@oasisdex/dma-library'
import { getOmniCardLtvAutomationParams } from 'features/omni-kit/automation/helpers'
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
import { useOmniEarnYields } from 'features/omni-kit/hooks/useOmniEarnYields'
import { useAjnaCardDataNetValueLending } from 'features/omni-kit/protocols/ajna/components/details-section'
import { OmniProductType } from 'features/omni-kit/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { one } from 'helpers/zero'
import { LendingProtocolLabel } from 'lendingProtocols'
import type { FC } from 'react'
import React from 'react'

export const AaveLikeDetailsSectionContentManage: FC = () => {
  const {
    environment: {
      collateralPrice,
      collateralToken,
      collateralAddress,
      isShort,
      priceFormat,
      productType,
      quotePrice,
      quoteToken,
      quoteAddress,
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
      values: { changeVariant, automation },
    },
  } = useOmniProductContext(productType as OmniProductType.Borrow | OmniProductType.Multiply)

  const castedPosition = position as AaveLikePositionV2

  const simulations = isYieldLoopWithData
    ? useOmniSimulationYields({
        amount: castedPosition.collateralAmount.shiftedBy(collateralPrecision),
        token: collateralToken,
        getYields: () =>
          useOmniEarnYields({
            actionSource: 'AaveLikeDetailsSectionContentManage',
            quoteTokenAddress: quoteAddress,
            collateralTokenAddress: collateralAddress,
            quoteToken: quoteToken,
            collateralToken: collateralToken,
            ltv: castedPosition.riskRatio.loanToValue,
            networkId: network.id,
            protocol,
          }),
      })
    : undefined

  const simulationsChange = useOmniSimulationYields({
    amount: castedPosition.collateralAmount.shiftedBy(collateralPrecision),
    token: collateralToken,
    getYields: () =>
      useOmniEarnYields({
        actionSource: 'AaveLikeDetailsSectionContentManage',
        quoteTokenAddress: quoteAddress,
        collateralTokenAddress: collateralAddress,
        quoteToken: quoteToken,
        collateralToken: collateralToken,
        ltv: simulation?.riskRatio.loanToValue || castedPosition.riskRatio.loanToValue,
        networkId: network.id,
        protocol,
      }),
  })

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

  const automationLtvCardData = getOmniCardLtvAutomationParams({
    collateralAmount: castedPosition.collateralAmount,
    debtAmount: castedPosition.debtAmount,
    automationMetadata: automation,
  })

  const ltvContentCardCommonData = useOmniCardDataLtv({
    afterLtv: simulation?.riskRatio.loanToValue,
    ltv: castedPosition.riskRatio.loanToValue,
    maxLtv: castedPosition.maxRiskRatio.loanToValue,
    automation: automationLtvCardData,
    modal: (
      <OmniCardDataLtvModal
        ltv={castedPosition.riskRatio.loanToValue}
        maxLtv={castedPosition.maxRiskRatio.loanToValue}
        automation={automationLtvCardData}
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
    simulations,
    simulationsChange: simulation?.riskRatio.loanToValue ? simulationsChange : undefined,
    modal: (
      <OmniCardDataNetApyModal
        simulations={simulations}
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
      <OmniContentCard {...commonContentCardData} {...ltvContentCardCommonData} />
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
