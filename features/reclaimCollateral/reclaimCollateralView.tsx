import type BigNumber from 'bignumber.js'
import { useProductContext } from 'components/context/ProductContextProvider'
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
  const { reclaimCollateral$ } = useProductContext()
  const [state] = useObservable(reclaimCollateral$(id, token, amount))

  console.debug('ReclaimCollateralButton state:', state)

  if (!state) return null
  const { reclaim, txStatus } = state
  const isLoading = txStatus === 'reclaimWaitingForApproval' || txStatus === 'reclaimInProgress'

  console.debug('Recv aimCollateralButton txStatus:', txStatus)
  console.debug('ReclaimCollateralButton isLoading:', isLoading)

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
