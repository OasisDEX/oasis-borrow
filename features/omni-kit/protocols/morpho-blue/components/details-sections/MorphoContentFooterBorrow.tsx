import {
  OmniCardDataAvailableToBorrow,
  OmniCardDataAvailableToWithdraw,
  OmniContentCard,
  useOmniCardDataBorrowRate,
  useOmniCardDataNetValue,
  useOmniCardDataTokensValue,
} from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useOmniEarnYields } from 'features/omni-kit/hooks/useOmniEarnYields'
import { MorphoCardDataBorrowRateModal } from 'features/omni-kit/protocols/morpho-blue/components/details-sections'
import { OmniProductType } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'
import React, { useMemo } from 'react'

export function MorphoContentFooterBorrow() {
  const {
    environment: {
      collateralPrice,
      collateralToken,
      quotePrice,
      quoteToken,
      network,
      protocol,
      quoteAddress,
      collateralAddress,
    },
  } = useOmniGeneralContext()
  const {
    position: {
      isSimulationLoading,
      currentPosition: { position, simulation },
    },
    dynamicMetadata: {
      values: { changeVariant, interestRate },
    },
  } = useOmniProductContext(OmniProductType.Borrow)

  const netValue = position.collateralAmount
    .times(collateralPrice)
    .minus(position.debtAmount.times(quotePrice))
  const afterNetValue = simulation?.collateralAmount
    .times(collateralPrice)
    .minus(simulation?.debtAmount.times(quotePrice))

  const ltv = useMemo(() => position.riskRatio.loanToValue, [position])
  const yields = useOmniEarnYields({
    actionSource: 'MorphoContentFooterBorrow',
    quoteTokenAddress: quoteAddress,
    collateralTokenAddress: collateralAddress,
    quoteToken: quoteToken,
    collateralToken: collateralToken,
    ltv,
    networkId: network.id,
    protocol,
  })
  const commonContentCardData = {
    asFooter: true,
    changeVariant,
    isLoading: isSimulationLoading,
  }

  const borrowRateContentCardCommonData = useOmniCardDataBorrowRate({
    borrowRate: interestRate.minus(yields?.apy1d.div(100) || zero),
    modal: (
      <MorphoCardDataBorrowRateModal
        borrowRate={interestRate}
        debtAmount={position.debtAmount}
        quoteToken={quoteToken}
      />
    ),
  })

  const netValueContentCardCommonData = useOmniCardDataNetValue({
    afterNetValue,
    netValue,
  })

  const availableToWithdrawContentCardCommonData = useOmniCardDataTokensValue({
    afterTokensAmount: simulation?.collateralAvailable,
    tokensAmount: position.collateralAvailable,
    tokensSymbol: collateralToken,
    translationCardName: 'available-to-withdraw',
    modal: (
      <OmniCardDataAvailableToWithdraw
        availableToWithdraw={position.collateralAvailable}
        tokenSymbol={collateralToken}
      />
    ),
  })

  const availableToBorrowContentCardCommonData = useOmniCardDataTokensValue({
    afterTokensAmount: simulation?.debtAvailable(),
    tokensAmount: position.debtAvailable(),
    tokensSymbol: quoteToken,
    translationCardName: 'available-to-borrow',
    modal: (
      <OmniCardDataAvailableToBorrow
        availableToBorrow={position.debtAvailable()}
        quoteToken={quoteToken}
      />
    ),
  })

  return (
    <>
      <OmniContentCard
        asFooter
        changeVariant={changeVariant}
        {...borrowRateContentCardCommonData}
      />
      <OmniContentCard {...commonContentCardData} {...netValueContentCardCommonData} />
      <OmniContentCard {...commonContentCardData} {...availableToWithdrawContentCardCommonData} />
      <OmniContentCard {...commonContentCardData} {...availableToBorrowContentCardCommonData} />
    </>
  )
}
