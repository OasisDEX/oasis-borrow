import { VaultDetailsCardCurrentPrice } from 'components/vault/VaultDetails'
import { pick } from 'helpers/pick'
import { useSelectFromContext } from 'helpers/useSelectFromContext'
import React from 'react'

import { OpenBorrowVaultContext } from '../OpenVaultView'

export function CardCurrentPrice() {
  const props = useSelectFromContext(OpenBorrowVaultContext, (ctx) => ({
    ...pick(
      ctx.priceInfo,
      'currentCollateralPrice',
      'nextCollateralPrice',
      'isStaticCollateralPrice',
      'collateralPricePercentageChange',
    ),
  }))
  return <VaultDetailsCardCurrentPrice {...props} />
}
