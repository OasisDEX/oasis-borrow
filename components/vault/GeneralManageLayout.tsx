import { getNetworkName } from '@oasisdex/web3-context'
import { isSupportedAutomationIlk } from 'blockchain/tokensMetadata'
import { guniFaq } from 'features/content/faqs/guni'
import { GuniVaultHeader } from 'features/earn/guni/common/GuniVaultHeader'
import { FollowButtonProps } from 'features/follow/common/FollowButtonControl'
import { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault'
import { VaultType } from 'features/generalManageVault/vaultType'
import { VaultNoticesView } from 'features/notices/VaultsNoticesView'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Grid } from 'theme-ui'

import { DefaultVaultHeadline } from './DefaultVaultHeadline'
import { GeneralManageTabBar } from './GeneralManageTabBar'

interface GeneralManageLayoutProps {
  generalManageVault: GeneralManageVaultState
  followButtonProps: FollowButtonProps | undefined
}

export function GeneralManageLayout({
  generalManageVault,
  followButtonProps,
}: GeneralManageLayoutProps) {
  const { t } = useTranslation()
  const { ilkData, vault, priceInfo } = generalManageVault.state

  const colRatioPercnentage = vault.collateralizationRatio.times(100).toFixed(2)

  const showAutomationTabs = isSupportedAutomationIlk(getNetworkName(), vault.ilk)

  const headlineElement =
    generalManageVault.type === VaultType.Earn ? (
      <GuniVaultHeader
        token={ilkData.token}
        ilk={ilkData.ilk}
        followButtonProps={followButtonProps}
      />
    ) : (
      <DefaultVaultHeadline
        header={t('vault.header', { ilk: vault.ilk, id: vault.id })}
        token={[vault.token]}
        priceInfo={priceInfo}
        colRatio={colRatioPercnentage}
        followButtonProps={followButtonProps}
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
