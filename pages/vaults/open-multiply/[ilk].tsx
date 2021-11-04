import { WithWalletConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { OpenMultiplyVaultView } from 'features/openMultiplyVault/common/OpenMultiplyVaultView'
import { OpenMultiplyVaultState } from 'features/openMultiplyVault/openMultiplyVault'
import { DefaultOpenMultiplyVaultContainer } from 'features/openMultiplyVault/variants/default/open/DefaultOpenMultiplyVaultContainer'
import { GuniOpenMultiplyVaultContainer } from 'features/openMultiplyVault/variants/guni/open/GuniOpenMultiplyVaultContainer'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

export async function getServerSideProps(ctx: any) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale, ['common'])),
      ilk: ctx.query.ilk || null,
    },
  }
}
// TODO remove before releasing
const multiplyContainerMap: Record<string, (props: OpenMultiplyVaultState) => JSX.Element> = {
  'ETH-A': (props) => <GuniOpenMultiplyVaultContainer {...props} />,
  // 'GUNIV3DAIUSDC1-A': (props) => <GuniOpenMultiplyVaultContainer {...props} />,
}
export default function OpenVault({ ilk }: { ilk: string }) {
  return (
    <WithWalletConnection>
      <WithTermsOfService>
        <BackgroundLight />
        <OpenMultiplyVaultView
          ilk={ilk}
          render={(props) =>
            multiplyContainerMap[ilk] ? (
              multiplyContainerMap[ilk](props)
            ) : (
              <DefaultOpenMultiplyVaultContainer {...props} />
            )
          }
        />
      </WithTermsOfService>
    </WithWalletConnection>
  )
}

OpenVault.layout = AppLayout
