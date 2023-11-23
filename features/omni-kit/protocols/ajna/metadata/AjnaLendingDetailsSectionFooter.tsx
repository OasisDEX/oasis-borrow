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
  afterAvailableToBorrow?: BigNumber
  afterBuyingPower?: BigNumber
  changeVariant: 'positive' | 'negative'
  collateralToken: string
  interestRate: BigNumber
  isSimulationLoading?: boolean
  owner: string
  position: AjnaPosition
  productType: OmniProductType
  quoteToken: string
  simulation?: AjnaPosition
}

export const AjnaLendingDetailsSectionFooter: FC<AjnaLendingDetailsSectionFooterProps> = ({
  productType,
  isSimulationLoading,
  collateralToken,
  owner,
  position,
  simulation,
  quoteToken,
  changeVariant,
  interestRate,
  afterAvailableToBorrow,
  afterBuyingPower,
}) => {
  return productType === OmniProductType.Borrow ? (
    <AjnaContentFooterBorrow
      isLoading={isSimulationLoading}
      collateralToken={collateralToken}
      quoteToken={quoteToken}
      owner={owner}
      cost={interestRate}
      availableToBorrow={position.debtAvailable()}
      afterAvailableToBorrow={afterAvailableToBorrow}
      availableToWithdraw={position.collateralAvailable}
      afterAvailableToWithdraw={simulation?.collateralAvailable}
      changeVariant={changeVariant}
    />
  ) : (
    <AjnaContentFooterMultiply
      isLoading={isSimulationLoading}
      collateralToken={collateralToken}
      quoteToken={quoteToken}
      totalExposure={position.collateralAmount}
      afterTotalExposure={simulation?.collateralAmount}
      positionDebt={position.debtAmount}
      afterPositionDebt={simulation?.debtAmount}
      multiple={position.riskRatio.multiple}
      afterMultiple={simulation?.riskRatio.multiple}
      buyingPower={position.buyingPower}
      afterBuyingPower={afterBuyingPower}
      changeVariant={changeVariant}
    />
  )
}
