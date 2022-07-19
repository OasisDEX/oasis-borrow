import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { GuniManageMultiplyVaultChangesInformation } from 'features/earn/guni/manage/containers/GuniManageMultiplyVaultChangesInformation'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
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
            <>
              <Text
                as="p"
                variant="paragraph3"
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 2,
                  fontWeight: 'semiBold',
                }}
              >
                <Text
                  as="span"
                  sx={{ display: 'flex', alignItems: 'flex-end', color: 'neutral80' }}
                >
                  <Icon name={getToken('DAI').iconCircle} size="20px" sx={{ mr: 1 }} />
                  {t('minimum')} {t('after-closing', { token: 'DAI' })}
                </Text>
                <Text as="span">{formatCryptoBalance(afterCloseToDai)} DAI</Text>
              </Text>
            </>
          )}
        </>
      )}
      <VaultErrors {...props} errorMessages={extractCommonErrors(errorMessages)} />
      <VaultWarnings {...props} warningMessages={extractCommonWarnings(warningMessages)} />
      <GuniManageMultiplyVaultChangesInformation {...props} />
    </Grid>
  )
}
