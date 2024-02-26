import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import {
  OmniContentCard,
  useOmniCardDataBorrowRate,
  useOmniCardDataMultiple,
  useOmniCardDataTokensValue,
  useOmniCardDataVariableAnnualFee,
} from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { AaveLikeCostToBorrowContentCardModal } from 'features/omni-kit/protocols/aave-like/components/AaveLikeCostToBorrowContentCardModal'
import { useAjnaCardDataPositionDebt } from 'features/omni-kit/protocols/ajna/components/details-section'
import { OmniProductType } from 'features/omni-kit/types'
import React from 'react'

export function AaveLikeContentFooterMultiply() {
  const {
    environment: { collateralToken, quoteToken, quotePrice, collateralPrice, isYieldLoop },
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
    borrowRate: position.borrowRate,
    afterBorrowRate: simulation?.borrowRate,
    modal: (
      <AaveLikeCostToBorrowContentCardModal
        collateralAmount={position.collateralAmount}
        collateralPrice={collateralPrice}
        debtAmount={position.debtAmount}
        quotePrice={quotePrice}
        quoteToken={quoteToken}
        debtVariableBorrowRate={castedPosition.debtVariableBorrowRate}
        collateralLiquidityRate={castedPosition.collateralLiquidityRate}
        netValue={position.netValue}
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
      {isYieldLoop && (
        <OmniContentCard {...commonContentCardData} {...variableAnnualFeeContentCardCommonData} />
      )}
      {!isYieldLoop && (
        <>
          <OmniContentCard {...commonContentCardData} {...multipleContentCardCommonData} />
          <OmniContentCard {...commonContentCardData} {...borrowRateContentCardCommonData} />
        </>
      )}
    </>
  )
}
