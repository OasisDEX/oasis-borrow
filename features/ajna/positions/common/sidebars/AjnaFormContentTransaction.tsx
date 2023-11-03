import { MessageCard } from 'components/MessageCard'
import type { AjnaIsCachedPosition } from 'features/ajna/common/types'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { OpenVaultAnimation } from 'theme/animations'
import { Text } from 'theme-ui'

interface AjnaFormContentTransactionProps {
  orderInformation: FC<AjnaIsCachedPosition>
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
