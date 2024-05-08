import {
  OmniContentCard,
  useOmniCardDataBorrowRate,
  useOmniCardDataMultiple,
  useOmniCardDataTokensValue,
} from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useAjnaCardDataPositionDebt } from 'features/omni-kit/protocols/ajna/components/details-section'
import { OmniProductType } from 'features/omni-kit/types'
import React from 'react'

export function MorphoContentFooterMultiply() {
  const {
    environment: { collateralToken, quoteToken },
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

  const totalCollateralExposureContentCardCommonData = useOmniCardDataTokensValue({
    afterTokensAmount: simulation?.collateralAmount,
    tokensAmount: position.collateralAmount,
    tokensSymbol: collateralToken,
    translationCardName: 'total-exposure',
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
      <OmniContentCard {...commonContentCardData} {...multipleContentCardCommonData} />
      <OmniContentCard {...commonContentCardData} {...borrowRateContentCardCommonData} />
    </>
  )
}
