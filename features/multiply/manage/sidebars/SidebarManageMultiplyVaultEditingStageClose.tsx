import { ActionPills } from 'components/ActionPills'
import { HighlightedOrderInformation } from 'components/HighlightedOrderInformation'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'
import type { ManageMultiplyVaultState } from '../pipes/ManageMultiplyVaultState.types'

export function SidebarManageMultiplyVaultEditingStageClose(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  const {
    closeVaultTo,
    setCloseVaultTo,
    afterCloseToCollateral,
    afterCloseToCollateralUSD,
    afterCloseToDai,
    vault: { token },
  } = props

  const isClosingToCollateral = closeVaultTo === 'collateral'
  const closeToTokenSymbol = isClosingToCollateral ? token : 'DAI'
  const amountOnClose = (
    <>
      {formatCryptoBalance(isClosingToCollateral ? afterCloseToCollateral : afterCloseToDai)}{' '}
      {closeToTokenSymbol}{' '}
      {isClosingToCollateral && `($${formatAmount(afterCloseToCollateralUSD, 'USD')})`}
    </>
  )

  return (
    <>
      <ActionPills
        active={closeVaultTo}
        items={[
          {
            id: 'collateral',
            label: t('close-to', { token }),
            action: () => {
              setCloseVaultTo!('collateral')
            },
          },
          {
            id: 'dai',
            label: t('close-to', { token: 'DAI' }),
            action: () => {
              setCloseVaultTo!('dai')
            },
          },
        ]}
      />
      <Text as="p" variant="paragraph3" sx={{ mt: 2, color: 'neutral80' }}>
        {t('vault-info-messages.closing')}
      </Text>
      <HighlightedOrderInformation
        symbol={closeToTokenSymbol}
        label={t('after-closing', { token: closeToTokenSymbol })}
        value={amountOnClose}
      />
    </>
  )
}
