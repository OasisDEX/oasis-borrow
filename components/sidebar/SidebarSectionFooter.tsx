import type { NetworkConfigHexId } from 'blockchain/networks'
import { useConnection, useWalletManagement } from 'features/web3OnBoard/useConnection'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'
import { Grid } from 'theme-ui'

import type { SidebarSectionFooterButtonProps } from './SidebarSectionFooterButton'
import { SidebarSectionFooterButton } from './SidebarSectionFooterButton'
import type { SidebarSectionStatusProps } from './SidebarSectionStatus'
import { SidebarSectionStatus } from './SidebarSectionStatus'

export type SidebarSectionFooterButtonSettings = Omit<SidebarSectionFooterButtonProps, 'variant'>

export interface SidebarSectionFooterProps {
  primaryButton: SidebarSectionFooterButtonSettings
  secondaryButton?: SidebarSectionFooterButtonSettings
  textButton?: SidebarSectionFooterButtonSettings
  status?: SidebarSectionStatusProps[]
  requireConnection?: boolean
  requiredChainHexId?: NetworkConfigHexId
}

function useConnectWalletPrimaryButton(): SidebarSectionFooterButtonSettings {
  const { t } = useTranslation()
  const { connect, connecting } = useConnection()

  return useMemo(
    () => ({
      label: t('connect-wallet'),
      action: () => {
        if (!connecting) {
          void connect()
        }
      },
      steps: undefined,
      isLoading: connecting,
      disabled: connecting,
    }),
    [t, connecting, connect],
  )
}

function useChangeChainButton({
  requiredChainHexId,
}: Pick<SidebarSectionFooterProps, 'requiredChainHexId'>): SidebarSectionFooterButtonSettings {
  const { t } = useTranslation()
  const { connect } = useConnection()

  return useMemo(
    () => ({
      label: t('change-wallet-chain'),
      action: () => {
        connect(requiredChainHexId)
      },
      steps: undefined,
      isLoading: false,
      disabled: false,
    }),
    [t, connect, requiredChainHexId],
  )
}

function useResolvePrimaryButton({
  requiredChainHexId,
  requireConnection,
  primaryButton,
}: Pick<SidebarSectionFooterProps, 'requireConnection' | 'requiredChainHexId' | 'primaryButton'>): {
  resolvedPrimaryButton: SidebarSectionFooterButtonSettings
  blockOthers: boolean
} {
  const connectButton = useConnectWalletPrimaryButton()
  const changeChainButton = useChangeChainButton({ requiredChainHexId })
  const { wallet } = useWalletManagement()
  if (requireConnection && !wallet) {
    return {
      resolvedPrimaryButton: connectButton,
      blockOthers: true,
    }
  }
  if (
    requireConnection &&
    wallet &&
    requiredChainHexId &&
    wallet.chainHexId !== requiredChainHexId
  ) {
    return {
      resolvedPrimaryButton: changeChainButton,
      blockOthers: true,
    }
  }
  return {
    resolvedPrimaryButton: primaryButton,
    blockOthers: false,
  }
}

export function SidebarSectionFooter({
  primaryButton,
  secondaryButton,
  textButton,
  status,
  requireConnection,
  requiredChainHexId,
}: SidebarSectionFooterProps) {
  const { resolvedPrimaryButton, blockOthers } = useResolvePrimaryButton({
    requiredChainHexId,
    requireConnection,
    primaryButton,
  })

  const isPrimaryButtonVisible = !primaryButton.hidden
  const isSecondaryButtonVisible =
    secondaryButton !== undefined && !secondaryButton.hidden && !blockOthers
  const isTextButtonVisible = textButton !== undefined && !textButton.hidden && !blockOthers
  const isStatusVisible = status !== undefined && status.length > 0
  const isFooterVisible =
    isPrimaryButtonVisible || isSecondaryButtonVisible || isTextButtonVisible || isStatusVisible

  return isFooterVisible ? (
    <Grid
      sx={{
        p: '24px',
        borderTop: 'lightMuted',
      }}
    >
      <SidebarSectionFooterButton {...resolvedPrimaryButton} />
      {secondaryButton && <SidebarSectionFooterButton variant="secondary" {...secondaryButton} />}
      {textButton && <SidebarSectionFooterButton variant="textual" {...textButton} />}
      {!!status?.length && status.map((item, idx) => <SidebarSectionStatus {...item} key={idx} />)}
    </Grid>
  ) : null
}
