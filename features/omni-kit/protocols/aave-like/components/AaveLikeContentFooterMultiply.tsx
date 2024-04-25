import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import {
  OmniContentCard,
  useOmniCardDataBorrowRate,
  useOmniCardDataMultiple,
  useOmniCardDataTokensValue,
  useOmniCardDataVariableAnnualFee,
} from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useOmniEarnYields } from 'features/omni-kit/hooks/useOmniEarnYields'
import { AaveLikeCostToBorrowContentCardModal } from 'features/omni-kit/protocols/aave-like/components/AaveLikeCostToBorrowContentCardModal'
import { useAjnaCardDataPositionDebt } from 'features/omni-kit/protocols/ajna/components/details-section'
import { OmniProductType } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'
import React, { useMemo } from 'react'

export function AaveLikeContentFooterMultiply() {
  const {
    environment: {
      collateralToken,
      quoteToken,
      quotePrice,
      protocol,
      collateralPrice,
      isYieldLoopWithData,
      quoteAddress,
      collateralAddress,
      network,
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
  } = useOmniProductContext(OmniProductType.Multiply)
  const commonContentCardData = {
    asFooter: true,
    changeVariant,
    isLoading: isSimulationLoading,
  }

  const castedPosition = position as AaveLikePositionV2

  const ltv = useMemo(() => castedPosition.riskRatio.loanToValue, [castedPosition])
  const ltvAfter = useMemo(
    () => simulation?.riskRatio.loanToValue || castedPosition.riskRatio.loanToValue,
    [simulation, castedPosition],
  )
  const yields = useOmniEarnYields({
    actionSource: 'AaveLikeContentFooterYieldLoop',
    quoteTokenAddress: quoteAddress,
    collateralTokenAddress: collateralAddress,
    quoteToken: quoteToken,
    collateralToken: collateralToken,
    ltv,
    networkId: network.id,
    protocol,
  })
  const yieldsAfter = useOmniEarnYields({
    actionSource: 'AaveLikeContentFooterYieldLoop',
    quoteTokenAddress: quoteAddress,
    collateralTokenAddress: collateralAddress,
    quoteToken: quoteToken,
    collateralToken: collateralToken,
    ltv: ltvAfter,
    networkId: network.id,
    protocol,
  })

  const totalCollateralExposureContentCardCommonData = useOmniCardDataTokensValue({
    afterTokensAmount: simulation?.collateralAmount,
    tokensAmount: position.collateralAmount,
    tokensSymbol: collateralToken,
    translationCardName: 'total-exposure',
  })

  const variableAnnualFeeContentCardCommonData = useOmniCardDataVariableAnnualFee({
    variableAnnualFee: castedPosition.debtVariableBorrowRate,
  })

  const positionDebtContentCardCommonData = useOmniCardDataTokensValue({
    afterTokensAmount: simulation?.debtAmount,
    tokensAmount: position.debtAmount,
    tokensSymbol: quoteToken,
    translationCardName: 'position-debt',
  })
  const positionDebtContentCardAjnaData = useAjnaCardDataPositionDebt({
    debtAmount: position.debtAmount,
    quoteToken,
  })

  const multipleContentCardCommonData = useOmniCardDataMultiple({
    afterMultiple: simulation?.riskRatio.multiple,
    multiple: position.riskRatio.multiple,
  })

  const borrowRateContentCardCommonData = useOmniCardDataBorrowRate({
    borrowRate: position.borrowRate.minus(yields?.apy.div(100) || zero),
    afterBorrowRate: simulation?.borrowRate.minus(yieldsAfter?.apy.div(100) || zero),
    modal: (
      <AaveLikeCostToBorrowContentCardModal
        collateralAmount={position.collateralAmount}
        collateralPrice={collateralPrice}
        collateralToken={collateralToken}
        debtAmount={position.debtAmount}
        quotePrice={quotePrice}
        quoteToken={quoteToken}
        debtVariableBorrowRate={castedPosition.debtVariableBorrowRate}
        collateralLiquidityRate={castedPosition.collateralLiquidityRate}
        netValue={position.netValue}
        apy={yields?.apy.div(100)}
      />
    ),
  })

  return (
    <>
      <OmniContentCard
        {...commonContentCardData}
        {...totalCollateralExposureContentCardCommonData}
      />
      <OmniContentCard
        {...commonContentCardData}
        {...positionDebtContentCardCommonData}
        {...positionDebtContentCardAjnaData}
      />
      {isYieldLoopWithData && (
        <OmniContentCard {...commonContentCardData} {...variableAnnualFeeContentCardCommonData} />
      )}
      {!isYieldLoopWithData && (
        <>
          <OmniContentCard {...commonContentCardData} {...multipleContentCardCommonData} />
          <OmniContentCard {...commonContentCardData} {...borrowRateContentCardCommonData} />
        </>
      )}
    </>
  )
}
