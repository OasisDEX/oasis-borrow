import BigNumber from 'bignumber.js'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { GeneralManageControl } from 'components/vault/GeneralManageControl'
import { useFollowInitialization } from 'features/automation/follow/useFollowInitialization'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import NotFoundPage from 'pages/404'
import React from 'react'
import { Box } from 'theme-ui'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      id: ctx.query.vault || null,
    },
  }
}

function Vault({ id }: { id: string }) {
  const vaultId = new BigNumber(id)
  const isValidVaultId = vaultId.isInteger() && vaultId.gt(0)
  const followVaultsEnabled = useFeatureToggle('FollowVaults')
  if (followVaultsEnabled) {
    useFollowInitialization({ isLimitReached: false })
  }
  return (
    <WithConnection>
      <WithTermsOfService>
        <WithWalletAssociatedRisk>
          {isValidVaultId ? (
            <GeneralManageControl id={vaultId} />
          ) : (
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <NotFoundPage />
            </Box>
          )}
        </WithWalletAssociatedRisk>
      </WithTermsOfService>
    </WithConnection>
  )
}

Vault.layout = AppLayout

export default Vault
