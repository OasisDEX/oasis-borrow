import { TxStatus } from '@oasisdex/transactions'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { AjnaBorrowFormOrder } from 'features/ajna/borrow/sidebars/AjnaBorrowFormOrder'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { TxDetails } from 'helpers/handleTransaction'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Text } from 'theme-ui'
import { OpenVaultAnimation } from 'theme/animations'

export function AjnaBorrowFormContentTransaction() {
  const { t } = useTranslation()
  const {
    tx: {
      isTxStarted,
      isTxError,
      isTxWaitingForApproval,
      isTxInProgress,
      isTxSuccess,
      setTxDetails,
    },
  } = useAjnaBorrowContext()

  return (
    <>
      {/* temporary TX status selector */}
      <Flex sx={{ columnGap: 2 }}>
        Force TX status:
        <select onChange={(e) => setTxDetails({ txStatus: e.target.value as TxStatus } as TxDetails)}>
          <option value={undefined}>undefined</option>
          {(Object.keys(TxStatus) as Array<keyof typeof TxStatus>).map((status, i) => (
            <option key={i} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button onClick={() => setTxDetails(undefined)}>Reset</button>
      </Flex>
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
