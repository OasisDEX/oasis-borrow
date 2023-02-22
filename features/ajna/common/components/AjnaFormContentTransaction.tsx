import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { useAjnaProductContext } from 'features/ajna/contexts/AjnaProductContext'
import { useTranslation } from 'next-i18next'
import React, { ReactElement } from 'react'
import { Text } from 'theme-ui'
import { OpenVaultAnimation } from 'theme/animations'

interface AjnaFormContentTransactionProps {
  orderInfo: ({ cached }: { cached?: boolean }) => ReactElement
}

export function AjnaFormContentTransaction({
  orderInfo: OrderInfo,
}: AjnaFormContentTransactionProps) {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, quoteToken },
    tx: { isTxStarted, isTxError, isTxWaitingForApproval, isTxInProgress, isTxSuccess },
  } = useAjnaProductContext()

  return (
    <>
      {(!isTxStarted || isTxWaitingForApproval || isTxError) && (
        <>
          <Text as="p" variant="paragraph3" sx={{ mb: 2, color: 'neutral80' }}>
            {t('ajna.borrow.open.form.confirm', { collateralToken, quoteToken })}
          </Text>
          <OrderInfo />
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
          <OrderInfo cached />
          <VaultChangesWithADelayCard />
        </>
      )}
    </>
  )
}
