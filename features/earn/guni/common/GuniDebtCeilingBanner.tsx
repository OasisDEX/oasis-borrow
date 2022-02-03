import { BigNumber } from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box } from 'theme-ui'

import { AppLink } from '../../../../components/Links'
import { guniExistingVaults } from '../../../banners/guniTempBanner'
import { VaultBanner } from '../../../banners/VaultsBannersView'

interface GuniDebtCeilingBannerProps {
  id?: BigNumber
}

export function GuniDebtCeilingBanner({ id }: GuniDebtCeilingBannerProps) {
  const { t } = useTranslation()

  const showBanner = id ? !guniExistingVaults.includes(id.toString()) : true

  return showBanner ? (
    <Box my={3}>
      <VaultBanner
        header={
          <>
            {t('vault-banners.debt-ceiling-rise.header', { from: '10M', to: '500M' })}
            <AppLink
              href="https://blog.oasis.app/debt-ceiling-increases-to-500m-dai-for-g-uni-vaults-and-more"
              sx={{ fontSize: 4, fontWeight: 'bold', color: 'onWarning' }}
            >
              {t('here')}
            </AppLink>
            .
          </>
        }
        color="onWarning"
      />
    </Box>
  ) : null
}
