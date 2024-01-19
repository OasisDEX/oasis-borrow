import type { AjnaPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { ChangeVariantType } from 'components/DetailsSectionContentCard'
import {
  OmniCardDataAvailableToBorrow,
  OmniCardDataAvailableToWithdraw,
  OmniContentCard,
  useOmniCardDataBorrowRate,
  useOmniCardDataNetValue,
  useOmniCardDataTokensValue,
} from 'features/omni-kit/components/details-section'
import { useAjnaCardDataBorrowRate } from 'features/omni-kit/protocols/ajna/components/details-section'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'

interface AjnaContentFooterBorrowProps {
  changeVariant?: ChangeVariantType
  collateralPrice: BigNumber
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

export function AjnaContentFooterBorrow({
  changeVariant,
  collateralPrice,
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
    borrowRate: position.pool.interestRate,
    collateralToken,
    debtAmount: position.debtAmount,
    isOwner,
    networkId,
    owner,
    quoteToken,
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
        theme={ajnaExtensionTheme}
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
        theme={ajnaExtensionTheme}
      />
    ),
  })

  return (
    <>
      <OmniContentCard
        asFooter
        changeVariant={changeVariant}
        {...borrowRateContentCardCommonData}
        {...borrowRateContentCardAjnaData}
      />
      {!isOracless && (
        <OmniContentCard {...commonContentCardData} {...netValueContentCardCommonData} />
      )}
      <OmniContentCard {...commonContentCardData} {...availableToWithdrawContentCardCommonData} />
      <OmniContentCard {...commonContentCardData} {...availableToBorrowContentCardCommonData} />
    </>
  )
}
