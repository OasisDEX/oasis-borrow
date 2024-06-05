import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import {
  OmniCardDataAvailableToBorrow,
  OmniCardDataAvailableToWithdraw,
  OmniContentCard,
  useOmniCardDataBorrowRate,
  useOmniCardDataNetValue,
  useOmniCardDataTokensValue,
} from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { AaveLikeCostToBorrowContentCardModal } from 'features/omni-kit/protocols/aave-like/components/AaveLikeCostToBorrowContentCardModal'
import { OmniProductType } from 'features/omni-kit/types'
import React from 'react'

export function AaveLikeContentFooterBorrow() {
  const {
    environment: { collateralPrice, collateralToken, quotePrice, quoteToken },
  } = useOmniGeneralContext()
  const {
    position: {
      isSimulationLoading,
      currentPosition: { position, simulation },
    },
    dynamicMetadata: {
      values: { changeVariant },
    },
  } = useOmniProductContext(OmniProductType.Borrow)

  const castedPosition = position as AaveLikePositionV2

  const commonContentCardData = {
    asFooter: true,
    changeVariant,
    isLoading: isSimulationLoading,
  }

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

  const netValueContentCardCommonData = useOmniCardDataNetValue({
    afterNetValue: simulation?.netValue,
    netValue: position.netValue,
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
      <OmniContentCard {...commonContentCardData} {...borrowRateContentCardCommonData} />
      <OmniContentCard {...commonContentCardData} {...netValueContentCardCommonData} />
      <OmniContentCard {...commonContentCardData} {...availableToWithdrawContentCardCommonData} />
      <OmniContentCard {...commonContentCardData} {...availableToBorrowContentCardCommonData} />
    </>
  )
}
