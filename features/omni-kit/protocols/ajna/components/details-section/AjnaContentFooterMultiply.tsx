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
import { useOmniEarnYields } from 'features/omni-kit/hooks/useOmniEarnYields'
import {
  useAjnaCardDataBorrowRate,
  useAjnaCardDataPositionDebt,
} from 'features/omni-kit/protocols/ajna/components/details-section'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'
import React, { useMemo } from 'react'

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
    environment: { protocol, network, isYieldLoopWithData },
  } = useOmniGeneralContext()
  const commonContentCardData = {
    asFooter: true,
    changeVariant,
    isLoading: isSimulationLoading,
  }

  const ltv = useMemo(() => position.riskRatio.loanToValue, [position])
  const yields = useOmniEarnYields({
    actionSource: 'AjnaContentFooterMultiply',
    ltv,
    networkId: network.id,
    protocol,
    poolAddress: position.pool.poolAddress,
  })

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
    borrowRate: (yields?.apy1d.div(100) || zero).negated(),
  })
  const borrowRateContentCardAjnaData = useAjnaCardDataBorrowRate({
    collateralToken,
    isOwner,
    networkId,
    owner,
    quoteToken,
    borrowRate: (yields?.apy1d.div(100) || zero).negated(),
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
