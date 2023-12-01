import type { AjnaPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { ChangeVariantType } from 'components/DetailsSectionContentCard'
import {
  OmniContentCard,
  useOmniCardDataBorrowRate,
  useOmniCardDataNetValue,
  useOmniCardDataTokensValue,
} from 'features/omni-kit/components/details-section'
import {
  useAjnaCardDataAvailableToBorrow,
  useAjnaCardDataAvailableToWithdraw,
  useAjnaCardDataBorrowRate,
} from 'features/omni-kit/protocols/ajna/components/details-section'
import React from 'react'

interface AjnaContentFooterBorrowProps {
  changeVariant?: ChangeVariantType
  collateralPrice: BigNumber
  collateralToken: string
  isOracless: boolean
  isOwner: boolean
  isSimulationLoading?: boolean
  owner: string
  position: AjnaPosition
  quotePrice: BigNumber
  quoteToken: string
  simulation?: AjnaPosition
}

export function AjnaContentFooterBorrow({
  changeVariant,
  collateralPrice,
  collateralToken,
  isOracless,
  isOwner,
  isSimulationLoading,
  owner,
  position,
  quotePrice,
  quoteToken,
  simulation,
}: AjnaContentFooterBorrowProps) {
  const netValue = position.collateralAmount
    .times(collateralPrice)
    .minus(position.debtAmount.times(quotePrice))
  const afterNetValue = simulation?.collateralAmount
    .times(collateralPrice)
    .minus(simulation?.debtAmount.times(quotePrice))

  const commonContentCardData = {
    asFooter: true,
    changeVariant,
    isLoading: isSimulationLoading,
  }

  const borrowRateContentCardCommonData = useOmniCardDataBorrowRate({
    borrowRate: position.pool.interestRate,
  })
  const borrowRateContentCardAjnaData = useAjnaCardDataBorrowRate({
    collateralToken,
    isOwner,
    owner,
    quoteToken,
    borrowRate: position.pool.interestRate,
    ...(!isOracless && {
      quotePrice,
    }),
    debtAmount: position.debtAmount,
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
  })
  const availableToWithdrawContentCardAjnaData = useAjnaCardDataAvailableToWithdraw({
    availableToWithdraw: position.collateralAvailable,
    collateralToken,
  })

  const availableToBorrowContentCardCommonData = useOmniCardDataTokensValue({
    afterTokensAmount: simulation?.debtAvailable(),
    tokensAmount: position.debtAvailable(),
    tokensSymbol: quoteToken,
    translationCardName: 'available-to-borrow',
  })
  const availableToBorrowContentCardAjnaData = useAjnaCardDataAvailableToBorrow({
    availableToBorrow: position.debtAvailable(),
    quoteToken,
  })

  return (
    <>
      <OmniContentCard
        {...commonContentCardData}
        {...borrowRateContentCardCommonData}
        {...borrowRateContentCardAjnaData}
      />
      <OmniContentCard {...commonContentCardData} {...netValueContentCardCommonData} />
      <OmniContentCard
        {...commonContentCardData}
        {...availableToWithdrawContentCardCommonData}
        {...availableToWithdrawContentCardAjnaData}
      />
      <OmniContentCard
        {...commonContentCardData}
        {...availableToBorrowContentCardCommonData}
        {...availableToBorrowContentCardAjnaData}
      />
    </>
  )
}