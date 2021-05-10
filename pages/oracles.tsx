import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { CollateralPricesView } from 'features/collateralPrices/CollateralPricesView'
import React from 'react'

export default function OraclesPage() {
  return (
    <WithConnection>
      <CollateralPricesView />
    </WithConnection>
  )
}

OraclesPage.layout = AppLayout
OraclesPage.layoutProps = {
  variant: 'daiContainer',
}
