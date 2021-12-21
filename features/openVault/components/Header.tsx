import { DefaultVaultHeader } from 'components/vault/DefaultVaultHeader'
import { useSelectFromContext } from 'helpers/useSelectFromContext'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { OpenBorrowVaultContext } from './OpenVaultView'

export function Header() {
  const { t } = useTranslation()

  const headerProps = useSelectFromContext(OpenBorrowVaultContext, (ctx) => ({
    ilkData: ctx.ilkData,
    id: ctx.id,
    header: t('vault.open-vault', { ilk: ctx.ilk }),
  }))

  return <DefaultVaultHeader {...headerProps} />
}
