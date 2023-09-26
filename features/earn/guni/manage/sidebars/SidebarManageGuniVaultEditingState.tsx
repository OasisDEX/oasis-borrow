import { HighlightedOrderInformation } from 'components/HighlightedOrderInformation'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { GuniManageMultiplyVaultChangesInformation } from 'features/earn/guni/manage/containers/GuniManageMultiplyVaultChangesInformation'
import type { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/ManageMultiplyVaultState.types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { extractCommonErrors, extractCommonWarnings } from 'helpers/messageMappers'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

export function SidebarManageGuniVaultEditingState(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  const {
    afterCloseToDai,
    errorMessages,
    stage,
    toggle,
    vault: { debt, token },
    warningMessages,
  } = props

  return (
    <Grid gap={3}>
      {stage === 'adjustPosition' && (
        <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
          <Trans
            i18nKey={'vault-info-messages.earn-overview'}
            values={{ token }}
            components={{
              1: (
                <Text
                  as="span"
                  sx={{ fontWeight: 'semiBold', color: 'interactive100', cursor: 'pointer' }}
                  onClick={() => {
                    toggle!('otherActions')
                  }}
                />
              ),
            }}
          />
        </Text>
      )}
      {stage === 'otherActions' && (
        <>
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('vault-info-messages.closing')}
          </Text>
          {!debt.isZero() && (
            <HighlightedOrderInformation
              symbol="DAI"
              label={`${t('minimum')} ${t('after-closing', { token: 'DAI' })}`}
              value={`${formatCryptoBalance(afterCloseToDai)} DAI`}
            />
          )}
        </>
      )}
      <VaultErrors {...props} errorMessages={extractCommonErrors(errorMessages)} />
      <VaultWarnings {...props} warningMessages={extractCommonWarnings(warningMessages)} />
      <GuniManageMultiplyVaultChangesInformation {...props} />
    </Grid>
  )
}
