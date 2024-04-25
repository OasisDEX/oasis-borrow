import type { AjnaPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { ChangeVariantType } from 'components/DetailsSectionContentCard'
import {
  OmniContentCard,
  useOmniCardDataBorrowRate,
  useOmniCardDataMultiple,
  useOmniCardDataTokensValue,
  useOmniCardDataVariableAnnualFee,
} from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import {
  useAjnaCardDataBorrowRate,
  useAjnaCardDataPositionDebt,
} from 'features/omni-kit/protocols/ajna/components/details-section'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import React from 'react'

interface AjnaContentFooterMultiplyProps {
  changeVariant?: ChangeVariantType
  collateralToken: string
  isOracless: boolean
  isOwner: boolean
  isSimulationLoading?: boolean
  networkId: OmniSupportedNetworkIds
  owner: string
  position: AjnaPosition
  quotePrice: BigNumber
  quoteToken: string
  simulation?: AjnaPosition
}

export function AjnaContentFooterMultiply({
  changeVariant,
  collateralToken,
  isOracless,
  isOwner,
  isSimulationLoading,
  networkId,
  owner,
  position,
  quotePrice,
  quoteToken,
  simulation,
}: AjnaContentFooterMultiplyProps) {
  const {
    environment: { isYieldLoopWithData },
  } = useOmniGeneralContext()
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
    borrowRate: position.pool.interestRate,
  })
  const borrowRateContentCardAjnaData = useAjnaCardDataBorrowRate({
    collateralToken,
    isOwner,
    networkId,
    owner,
    quoteToken,
    borrowRate: position.pool.interestRate,
    ...(!isOracless && {
      quotePrice,
    }),
    debtAmount: position.debtAmount,
    poolAddress: position.pool.poolAddress,
  })
  const variableAnnualFeeContentCardCommonData = useOmniCardDataVariableAnnualFee({
    variableAnnualFee: position.borrowRate,
  })

  return isYieldLoopWithData ? (
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
  ) : (
    <>
      <OmniContentCard
        asFooter
        changeVariant={changeVariant}
        {...totalCollateralExposureContentCardCommonData}
      />
      <OmniContentCard
        {...commonContentCardData}
        {...positionDebtContentCardCommonData}
        {...positionDebtContentCardAjnaData}
      />
      <OmniContentCard {...commonContentCardData} {...multipleContentCardCommonData} />
      <OmniContentCard
        {...commonContentCardData}
        {...borrowRateContentCardCommonData}
        {...borrowRateContentCardAjnaData}
      />
    </>
  )
}
