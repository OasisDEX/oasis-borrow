import { MessageCard } from 'components/MessageCard'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import type { OmniIsCachedPosition } from 'features/omni-kit/types'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Text } from 'theme-ui'
import { OpenVaultAnimation } from 'theme/animations'

interface OmniFormContentTransactionProps {
  orderInformation: FC<OmniIsCachedPosition>
}

export function OmniFormContentTransaction({
  orderInformation: OrderInformation,
}: OmniFormContentTransactionProps) {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, product, quoteToken },
    tx: { isTxStarted, isTxError, isTxWaitingForApproval, isTxInProgress, isTxSuccess },
  } = useOmniGeneralContext()

  return (
    <>
      {(!isTxStarted || isTxWaitingForApproval || isTxError) && (
        <>
          <Text as="p" variant="paragraph3" sx={{ mb: 2, color: 'neutral80' }}>
            {/* TODO omni translation update */}
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
