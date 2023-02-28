import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { useAjnaGeneralContext } from 'features/ajna/common/contexts/AjnaGeneralContext'
import { useTranslation } from 'next-i18next'
import React, { ReactElement } from 'react'
import { Text } from 'theme-ui'
import { OpenVaultAnimation } from 'theme/animations'

interface AjnaFormContentTransactionProps {
  orderInformation: ({ cached }: { cached?: boolean }) => ReactElement
}

export function AjnaFormContentTransaction({
  orderInformation: OrderInformation,
}: AjnaFormContentTransactionProps) {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, product, quoteToken },
    tx: { isTxStarted, isTxError, isTxWaitingForApproval, isTxInProgress, isTxSuccess },
  } = useAjnaGeneralContext()

  return (
    <>
      {(!isTxStarted || isTxWaitingForApproval || isTxError) && (
        <>
          <Text as="p" variant="paragraph3" sx={{ mb: 2, color: 'neutral80' }}>
            {t(`ajna.${product}.common.form.transaction.confirm`, { collateralToken, quoteToken })}
          </Text>
          <OrderInformation />
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
          <OrderInformation cached />
          <VaultChangesWithADelayCard />
        </>
      )}
    </>
  )
}
