import { OpenVaultChangesInformation } from 'features/borrow/open/containers/OpenVaultChangesInformation'
import { OpenVaultState } from 'features/borrow/open/pipes/openVault'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

export function SideBarOpenBorrowVaultOpenStage(props: OpenVaultState) {
  const { t } = useTranslation()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'text.subtitle' }}>
        {t('vault-form.subtext.review-manage')}
      </Text>
      <OpenVaultChangesInformation {...props} />
    </>
  )
}
