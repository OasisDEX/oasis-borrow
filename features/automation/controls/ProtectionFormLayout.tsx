import { Button, Divider, Grid } from '@theme-ui/components'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { VaultFormContainer } from '../../../components/vault/VaultFormContainer'
import { AutomationFromKind } from '../common/enums/TriggersTypes'

export function ProtectionFormLayout({
  toggleForm,
  currentForm,
  children,
}: React.PropsWithChildren<{ toggleForm: () => void; currentForm: AutomationFromKind }>) {
  const { t } = useTranslation()

  return (
    <VaultFormContainer toggleTitle="Edit Vault">
      <Grid columns={1}>
        {children}
        <Divider
          sx={{ width: 'calc(100% + 48px)', left: '-24px' }}
          variant="styles.hrVaultFormBottom"
        />
        <Button sx={{ mt: 3 }} variant="textualSmall" onClick={toggleForm}>
          {currentForm === AutomationFromKind.ADJUST
            ? t('protection.navigate-cancel')
            : t('protection.navigate-adjust')}
        </Button>
      </Grid>
    </VaultFormContainer>
  )
}
