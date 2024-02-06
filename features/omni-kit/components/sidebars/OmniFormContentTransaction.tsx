import { MessageCard } from 'components/MessageCard'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
import { LendingProtocolLabel } from 'lendingProtocols'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { OpenVaultAnimation } from 'theme/animations'
import { Text } from 'theme-ui'

interface OmniFormContentTransactionProps {
  orderInformation: FC
}

export function OmniFormContentTransaction({
  orderInformation: OrderInformation,
}: OmniFormContentTransactionProps) {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, productType, quoteToken, protocol },
    tx: { isTxStarted, isTxError, isTxWaitingForApproval, isTxInProgress, isTxSuccess },
  } = useOmniGeneralContext()

  return (
    <>
      {(!isTxStarted || isTxWaitingForApproval || isTxError) && (
        <>
          <Text as="p" variant="paragraph3" sx={{ mb: 2, color: 'neutral80' }}>
            {t(`omni-kit.form.transaction.confirm`, {
              collateralToken,
              productType: upperFirst(productType),
              protocol: LendingProtocolLabel[protocol],
              quoteToken,
            })}
          </Text>
          <OrderInformation />
        </>
      )}
      {isTxInProgress && <OpenVaultAnimation />}
      {isTxSuccess && (
        <>
          <OrderInformation />
          <MessageCard messages={[t('heads-up')]} type="warning" withBullet={false} />
        </>
      )}
    </>
  )
}
