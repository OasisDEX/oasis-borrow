import React from 'react'
import { NetworkIds } from 'blockchain/networks'
import { isSupportedAutomationIlk } from 'blockchain/tokensMetadata'
import { DefaultVaultHeadline } from 'components/vault/DefaultVaultHeadline'
import { GeneralManageTabBar } from 'components/vault/GeneralManageTabBar'
import { guniFaq } from 'features/content/faqs/guni'
import { GuniVaultHeader } from 'features/earn/guni/common/GuniVaultHeader'
import { FollowButtonControlProps } from 'features/follow/controllers/FollowButtonControl'
import { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault'
import { VaultType } from 'features/generalManageVault/vaultType'
import { VaultNoticesView } from 'features/notices/VaultsNoticesView'
import { useTranslation } from 'next-i18next'
import { Box, Card, Grid } from 'theme-ui'

interface GeneralManageLayoutProps {
  generalManageVault: GeneralManageVaultState
  followButton?: FollowButtonControlProps
  chainId: NetworkIds
}

export function GeneralManageLayout({
  generalManageVault,
  followButton,
  chainId,
}: GeneralManageLayoutProps) {
  const { t } = useTranslation()
  const { ilkData, vault, priceInfo } = generalManageVault.state

  const colRatioPercnentage = vault.collateralizationRatio.times(100).toFixed(2)

  const showAutomationTabs = isSupportedAutomationIlk(chainId, vault.ilk)

  const headlineElement =
    generalManageVault.type === VaultType.Earn ? (
      <GuniVaultHeader
        token={ilkData.token}
        ilk={ilkData.ilk}
        followButton={followButton}
        shareButton
      />
    ) : (
      <DefaultVaultHeadline
        header={t('vault.header', { ilk: vault.ilk, id: vault.id })}
        token={[vault.token]}
        priceInfo={priceInfo}
        colRatio={colRatioPercnentage}
        followButton={followButton}
        shareButton
      />
    )

  const positionInfo =
    generalManageVault.type === VaultType.Earn ? <Card variant="faq">{guniFaq}</Card> : undefined

  return (
    <Grid gap={0} sx={{ width: '100%' }}>
      <VaultNoticesView id={vault.id} />
      <Box sx={{ zIndex: 2, mt: 4 }}>{headlineElement}</Box>
      <GeneralManageTabBar
        positionInfo={positionInfo}
        generalManageVault={generalManageVault}
        showAutomationTabs={showAutomationTabs}
      />
    </Grid>
  )
}
