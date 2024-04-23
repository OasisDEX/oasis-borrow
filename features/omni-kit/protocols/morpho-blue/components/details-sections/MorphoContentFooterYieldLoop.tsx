import {
  OmniContentCard,
  OmniOpenYieldLoopFooter,
  useOmniCardDataTokensValue,
  useOmniCardDataVariableAnnualFee,
} from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useOmniEarnYields } from 'features/omni-kit/hooks/useOmniEarnYields'
import { useAjnaCardDataPositionDebt } from 'features/omni-kit/protocols/ajna/components/details-section'
import { OmniProductType } from 'features/omni-kit/types'
import React, { useMemo } from 'react'

export function MorphoContentFooterYieldLoop() {
  const {
    environment: {
      protocol,
      network,
      quoteAddress,
      collateralAddress,
      quoteToken,
      collateralToken,
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
  } = useOmniProductContext(OmniProductType.Multiply)

  const ltv = useMemo(() => {
    return position.maxRiskRatio.loanToValue || simulation?.maxRiskRatio.loanToValue
  }, [position.maxRiskRatio.loanToValue, simulation?.maxRiskRatio.loanToValue])
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

  const variableAnnualFeeContentCardCommonData = useOmniCardDataVariableAnnualFee({
    variableAnnualFee: position.borrowRate,
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

  return isOpening ? (
    <OmniOpenYieldLoopFooter
      getYields={() =>
        useOmniEarnYields({
          actionSource: 'MorphoContentFooterYieldLoop',
          quoteTokenAddress: quoteAddress,
          collateralTokenAddress: collateralAddress,
          quoteToken: quoteToken,
          collateralToken: collateralToken,
          ltv,
          networkId: network.id,
          protocol,
        })
      }
    />
  ) : (
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
      <OmniContentCard {...commonContentCardData} {...variableAnnualFeeContentCardCommonData} />
    </>
  )
}
