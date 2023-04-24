import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex, Spinner, Text } from 'theme-ui'

type ReclaimCollateralButtonProps = {
  amount: BigNumber
  token: string
  id: BigNumber
}

export function ReclaimCollateralButton({ amount, token, id }: ReclaimCollateralButtonProps) {
  const { t } = useTranslation()
  const { reclaimCollateral$ } = useAppContext()
  const [state] = useObservable(reclaimCollateral$(id, token, amount))

  if (!state) return null
  const { reclaim, txStatus } = state
  const isLoading = txStatus === 'reclaimWaitingForApproval' || txStatus === 'reclaimInProgress'

  return (
    <Button onClick={reclaim} variant="secondary" disabled={isLoading}>
      {isLoading ? (
        <Flex sx={{ justifyContent: 'center' }}>
          <Spinner size={25} color="primary100" />
          <Text pl={2}>{t('reclaim')}</Text>
        </Flex>
      ) : (
        <Text>{t('reclaim')}</Text>
      )}
    </Button>
  )
}
