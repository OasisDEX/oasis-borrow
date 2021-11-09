import { WithWalletConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { DefaultOpenMultiplyVaultView } from 'features/openMultiplyVault/variants/default/open/DefaultOpenMultiplyVaultView'
import { GuniOpenMultiplyVaultView } from 'features/openMultiplyVault/variants/guni/open/GuniOpenMultiplyVaultView'
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

const multiplyContainerMap: Record<string, (ilk: string) => JSX.Element> = {
  'GUNIV3DAIUSDC1-A': (ilk) => <GuniOpenMultiplyVaultView ilk={ilk} />,
}
export default function OpenVault({ ilk }: { ilk: string }) {
  return (
    <WithWalletConnection>
      <WithTermsOfService>
        <BackgroundLight />
        {multiplyContainerMap[ilk] ? (
          multiplyContainerMap[ilk](ilk)
        ) : (
          <DefaultOpenMultiplyVaultView ilk={ilk} />
        )}
      </WithTermsOfService>
    </WithWalletConnection>
  )
}

OpenVault.layout = AppLayout
