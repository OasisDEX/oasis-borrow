import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box } from 'theme-ui'

import { AppLink } from '../../../../components/Links'
import { VaultBanner } from '../../../banners/VaultsBannersView'

export function GuniDebtCeilingBanner() {
  const { t } = useTranslation()

  return (
    <Box my={3}>
      <VaultBanner
        header={
          <>
            {t('vault-banners.debt-ceiling-rise.header', { from: '10M', to: '500M' })}
            <AppLink href="/" sx={{ fontSize: 4, fontWeight: 'bold', color: 'onWarning' }}>
              here
            </AppLink>
            .
          </>
        }
        color="onWarning"
      />
    </Box>
  )
}
