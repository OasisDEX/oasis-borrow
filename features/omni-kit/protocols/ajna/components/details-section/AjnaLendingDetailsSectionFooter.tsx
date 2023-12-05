import type { AjnaPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { NetworkIds } from 'blockchain/networks'
import {
  AjnaContentFooterBorrow,
  AjnaContentFooterMultiply,
} from 'features/omni-kit/protocols/ajna/components/details-section'
import { OmniProductType } from 'features/omni-kit/types'
import type { FC } from 'react'
import React from 'react'

interface AjnaLendingDetailsSectionFooterProps {
  changeVariant: 'positive' | 'negative'
  collateralPrice: BigNumber
  collateralToken: string
  isOracless: boolean
  isOwner: boolean
  isSimulationLoading?: boolean
  networkId: NetworkIds
  owner: string
  position: AjnaPosition
  productType: OmniProductType
  quotePrice: BigNumber
  quoteToken: string
  simulation?: AjnaPosition
}

export const AjnaLendingDetailsSectionFooter: FC<AjnaLendingDetailsSectionFooterProps> = ({
  changeVariant,
  collateralPrice,
  collateralToken,
  isOracless,
  isOwner,
  isSimulationLoading,
  networkId,
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
      collateralPrice={collateralPrice}
      collateralToken={collateralToken}
      isOracless={isOracless}
      isOwner={isOwner}
      isSimulationLoading={isSimulationLoading}
      networkId={networkId}
      owner={owner}
      position={position}
      quotePrice={quotePrice}
      quoteToken={quoteToken}
      simulation={simulation}
    />
  ) : (
    <AjnaContentFooterMultiply
      changeVariant={changeVariant}
      collateralToken={collateralToken}
      isOracless={isOracless}
      isOwner={isOwner}
      isSimulationLoading={isSimulationLoading}
      networkId={networkId}
      owner={owner}
      position={position}
      quotePrice={quotePrice}
      quoteToken={quoteToken}
      simulation={simulation}
    />
  )
}
