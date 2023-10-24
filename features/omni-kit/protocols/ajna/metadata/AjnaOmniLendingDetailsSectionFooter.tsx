import type { AjnaPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { ContentFooterItemsBorrow } from 'features/ajna/positions/borrow/components/ContentFooterItemsBorrow'
import { ContentFooterItemsMultiply } from 'features/ajna/positions/multiply/components/ContentFooterItemsMultiply'
import type { OmniProduct } from 'features/omni-kit/types'
import type { FC } from 'react'
import React from 'react'

interface AjnaOmniLendingDetailsSectionFooterProps {
  product: OmniProduct
  isSimulationLoading?: boolean
  collateralToken: string
  quoteToken: string
  changeVariant: 'positive' | 'negative'
  owner: string
  position: AjnaPosition
  simulation?: AjnaPosition
  interestRate: BigNumber
  afterAvailableToBorrow?: BigNumber
  afterBuyingPower?: BigNumber
}

export const AjnaOmniLendingDetailsSectionFooter: FC<AjnaOmniLendingDetailsSectionFooterProps> = ({
  product,
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
  return product === 'borrow' ? (
    <ContentFooterItemsBorrow
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
    <ContentFooterItemsMultiply
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
