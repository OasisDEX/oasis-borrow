import { Button, Divider, Grid } from '@theme-ui/components'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { ProtectionForms } from './ProtectionFormControl'

export function ProtectionFormLayout({
  toggleForm,
  currentForm,
  children,
}: React.PropsWithChildren<{ toggleForm: () => void; currentForm: ProtectionForms }>) {
  const { t } = useTranslation()

  return (
    <Grid columns={1}>
      {children}
      <Divider
        sx={{ width: 'calc(100% + 48px)', left: '-24px' }}
        variant="styles.hrVaultFormBottom"
      />
      <Button sx={{ mt: 3 }} variant="textualSmall" onClick={toggleForm}>
        {currentForm === ProtectionForms.ADJUST
          ? t('protection.navigate-cancel')
          : t('protection.navigate-adjust')}
      </Button>
    </Grid>
  )
}
