import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { AjnaBorrowFormOrder } from 'features/ajna/borrow/sidebars/AjnaBorrowFormOrder'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'
import { OpenVaultAnimation } from 'theme/animations'

export function AjnaBorrowFormContentTransaction() {
  const { t } = useTranslation()
  const {
    tx: { isTxStarted, isTxError, isTxWaitingForApproval, isTxInProgress, isTxSuccess },
  } = useAjnaBorrowContext()

  return (
    <>
      {(!isTxStarted || isTxWaitingForApproval || isTxError) && (
        <>
          <Text as="p" variant="paragraph3" sx={{ mb: 2, color: 'neutral80' }}>
            {t('ajna.borrow.open.form.confirm')}
          </Text>
          <AjnaBorrowFormOrder />
        </>
      )}
      {isTxInProgress && (
        <>
          <OpenVaultAnimation />
          <Text as="p" variant="paragraph3" sx={{ mb: 2, color: 'neutral80' }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque molestie libero
            nec pharetra scelerisque. In porta nisl sed leo dignissim feugiat vel et ligula.
          </Text>
        </>
      )}
      {isTxSuccess && (
        <>
          <AjnaBorrowFormOrder />
          <VaultChangesWithADelayCard />
        </>
      )}
    </>
  )
}
