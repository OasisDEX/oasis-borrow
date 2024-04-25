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
import { useOmniEarnYields } from 'features/omni-kit/hooks/useOmniEarnYields'
import { AaveLikeCostToBorrowContentCardModal } from 'features/omni-kit/protocols/aave-like/components/AaveLikeCostToBorrowContentCardModal'
import { OmniProductType } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'
import React, { useMemo } from 'react'

export function AaveLikeContentFooterBorrow() {
  const {
    environment: {
      collateralToken,
      quoteToken,
      quotePrice,
      protocol,
      collateralPrice,
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
  } = useOmniProductContext(OmniProductType.Borrow)

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

  const commonContentCardData = {
    asFooter: true,
    changeVariant,
    isLoading: isSimulationLoading,
  }

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
