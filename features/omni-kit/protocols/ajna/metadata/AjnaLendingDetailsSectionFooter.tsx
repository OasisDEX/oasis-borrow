import type { AjnaPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import {
  AjnaContentFooterBorrow,
  AjnaContentFooterMultiply,
} from 'features/omni-kit/protocols/ajna/components/details-section'
import { OmniProductType } from 'features/omni-kit/types'
import type { FC } from 'react'
import React from 'react'

interface AjnaLendingDetailsSectionFooterProps {
  afterBuyingPower?: BigNumber
  changeVariant: 'positive' | 'negative'
  collateralToken: string
  interestRate: BigNumber
  isOracless: boolean
  isOwner: boolean
  isSimulationLoading?: boolean
  owner: string
  position: AjnaPosition
  productType: OmniProductType
  quotePrice: BigNumber
  quoteToken: string
  simulation?: AjnaPosition
}

export const AjnaLendingDetailsSectionFooter: FC<AjnaLendingDetailsSectionFooterProps> = ({
  afterBuyingPower,
  changeVariant,
  collateralToken,
  interestRate,
  isOracless,
  isOwner,
  isSimulationLoading,
  owner,
  position,
  productType,
  quotePrice,
  quoteToken,
  simulation,
}) => {
  return productType === OmniProductType.Borrow ? (
    <AjnaContentFooterBorrow
      changeVariant={changeVariant}
      collateralToken={collateralToken}
      cost={interestRate}
      isOracless={isOracless}
      isOwner={isOwner}
      isSimulationLoading={isSimulationLoading}
      owner={owner}
      position={position}
      quotePrice={quotePrice}
      quoteToken={quoteToken}
      simulation={simulation}
    />
  ) : (
    <AjnaContentFooterMultiply
      afterBuyingPower={afterBuyingPower}
      afterMultiple={simulation?.riskRatio.multiple}
      afterPositionDebt={simulation?.debtAmount}
      afterTotalExposure={simulation?.collateralAmount}
      buyingPower={position.buyingPower}
      changeVariant={changeVariant}
      collateralToken={collateralToken}
      isLoading={isSimulationLoading}
      multiple={position.riskRatio.multiple}
      positionDebt={position.debtAmount}
      quoteToken={quoteToken}
      totalExposure={position.collateralAmount}
    />
  )
}
