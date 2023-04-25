import BigNumber from 'bignumber.js'
import { WithConnection } from 'components/connectWallet'
import { AppLayout } from 'components/Layouts'
import { GeneralManageControl } from 'components/vault/GeneralManageControl'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { FT_LOCAL_STORAGE_KEY } from 'helpers/useFeatureToggle'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import NotFoundPage from 'pages/not-found'
import React from 'react'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      id: ctx.query.vault || null,
    },
  }
}

function handleHilarity(id: string) {
  const toggles = JSON.parse(localStorage.getItem(FT_LOCAL_STORAGE_KEY) || '{}')
  if (id === 'harheeharheeharhee') {
    toggles['🌞'] = true
    const togglesWrite = JSON.stringify(toggles)
    localStorage.setItem(FT_LOCAL_STORAGE_KEY, togglesWrite)
    window.location.replace('/')
  } else {
    toggles['🌞'] = false
    const togglesWrite = JSON.stringify(toggles)
    localStorage.setItem(FT_LOCAL_STORAGE_KEY, togglesWrite)
  }
}

function Vault({ id }: { id: string }) {
  handleHilarity(id)

  const vaultId = new BigNumber(id)
  const isValidVaultId = vaultId.isInteger() && vaultId.gt(0)

  return (
    <WithConnection>
      <WithTermsOfService>
        <WithWalletAssociatedRisk>
          {isValidVaultId ? <GeneralManageControl id={vaultId} /> : <NotFoundPage />}
        </WithWalletAssociatedRisk>
      </WithTermsOfService>
    </WithConnection>
  )
}

Vault.layout = AppLayout

export default Vault
