import { RiskRatio } from '@oasisdex/dma-library'
import type { NetworkIds } from 'blockchain/networks'
import { isSupportedAutomationIlk } from 'blockchain/tokensMetadata'
import { guniFaq } from 'features/content/faqs/guni'
import { GuniVaultHeader } from 'features/earn/guni/common/GuniVaultHeader'
import type { FollowButtonControlProps } from 'features/follow/controllers/FollowButtonControl'
import type { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault.types'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import { VaultNoticesView } from 'features/notices/VaultsNoticesView'
import type { OmniProductType } from 'features/omni-kit/types'
import { RefinanceModal } from 'features/refinance/components'
import { useMakerRefinanceContextInputs } from 'features/refinance/hooks'
import { useAppConfig } from 'helpers/config'
import { useModalContext } from 'helpers/modalHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Grid } from 'theme-ui'

import { DefaultVaultHeadline } from './DefaultVaultHeadline'
import { GeneralManageTabBar } from './GeneralManageTabBar'

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
  const { ilkData, vault, priceInfo, account } = generalManageVault.state
  const { openModal } = useModalContext()
  const { EnableRefinance: refinanceEnabled } = useAppConfig('features')
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

  const contextInput = useMakerRefinanceContextInputs({
    address: account,
    chainId,
    collateralAmount: vault.lockedCollateral.toString(),
    collateralToken: vault.token,
    debtAmount: vault.debt.toString(),
    id: vault.id.toString(),
    slippage: generalManageVault.state.slippage.toNumber(),
    collateralPrice: priceInfo.currentCollateralPrice.toString(),
    liquidationPrice: generalManageVault.state.vault.liquidationPrice.toString(),
    borrowRate: generalManageVault.state.ilkData.stabilityFee.toString(),
    ltv: new RiskRatio(
      generalManageVault.state.vault.collateralizationRatio,
      RiskRatio.TYPE.COL_RATIO,
    ).loanToValue.toString(),
    maxLtv: new RiskRatio(
      generalManageVault.state.ilkData.liquidationRatio,
      RiskRatio.TYPE.COL_RATIO,
    ).loanToValue.toString(),
    ilkType: vault.ilk,
    productType: generalManageVault.type as unknown as OmniProductType,
  })

  return (
    <Grid gap={0} sx={{ width: '100%' }}>
      {/* In general, it shouldn't be here, but it's here to ease development for now */}
      {refinanceEnabled && (
        <button onClick={() => openModal(RefinanceModal, { contextInput })}>Refinance</button>
      )}
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
