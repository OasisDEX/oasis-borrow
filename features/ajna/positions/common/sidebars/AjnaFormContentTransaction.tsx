import { MessageCard } from 'components/MessageCard'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { upperFirst } from 'lodash'
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
            {t(`ajna.position-page.common.form.transaction.confirm`, {
              collateralToken,
              product: upperFirst(product),
              quoteToken,
            })}
          </Text>
          <OrderInformation />
        </>
      )}
      {isTxInProgress && <OpenVaultAnimation />}
      {isTxSuccess && (
        <>
          <OrderInformation cached />
          <MessageCard messages={[t('heads-up')]} type="warning" withBullet={false} />
        </>
      )}
    </>
  )
}
