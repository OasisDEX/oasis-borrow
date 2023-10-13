import { NetworkNames } from 'blockchain/networks'
import { OmniKitDependencyWrapper } from 'features/omni-kit/components/OmniKitDependencyWrapper'
import { OmniKitMasterController } from 'features/omni-kit/controls/OmniKitMasterController'
import { OmniKitAjnaController } from 'features/omni-kit/protocols/OmniKitAjnaController'
import { OmniKitProductType } from 'features/omni-kit/types'
import { LendingProtocol } from 'lendingProtocols'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

function OmniKitTestPage() {
  const props = {
    collateralToken: 'ETH',
    // collateralToken: 'WBTC',
    network: NetworkNames.ethereumMainnet,
    productType: OmniKitProductType.Borrow,
    protocol: LendingProtocol.Ajna,
    quoteToken: 'DAI',
    // positionId: '909',
  }

  return (
    <OmniKitDependencyWrapper>
      <OmniKitMasterController {...props}>
        {(omniKitMasterData) => <OmniKitAjnaController masterData={omniKitMasterData} {...props} />}
      </OmniKitMasterController>
    </OmniKitDependencyWrapper>
  )
}

export default OmniKitTestPage

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})
