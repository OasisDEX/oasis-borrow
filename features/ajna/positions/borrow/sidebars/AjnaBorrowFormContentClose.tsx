import { ActionPills } from 'components/ActionPills'
import { HighlightedOrderInformation } from 'components/HighlightedOrderInformation'
import { useGenericProductContext } from 'features/ajna/positions/common/contexts/GenericProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'theme-ui'

import { AjnaBorrowFormOrder } from './AjnaBorrowFormOrder'

export function AjnaBorrowFormContentClose() {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, collateralPrice, quoteToken, quotePrice },
  } = useProtocolGeneralContext()

  const {
    form: {
      state: { closeTo },
      updateState,
    },
    position: {
      currentPosition: { position },
      swap,
      isSimulationLoading,
    },
  } = useGenericProductContext('borrow')
  const closeToToken = closeTo === 'collateral' ? collateralToken : quoteToken

  const collateralOnClose = swap?.current
    ? position.collateralAmount.minus(swap.current.fromTokenAmount)
    : zero
  const quoteOnClose = swap?.current?.minToTokenAmount.minus(position.debtAmount) || zero

  const formatted = {
    collateralOnClose: `${formatCryptoBalance(
      collateralOnClose,
    )} ${collateralToken} ($${formatAmount(collateralOnClose.times(collateralPrice), 'USD')})`,
    quoteOnClose: `${formatCryptoBalance(quoteOnClose)} ${quoteToken} ($${formatAmount(
      quoteOnClose.times(quotePrice),
      'USD',
    )})`,
  }

  return (
    <>
      <ActionPills
        active={closeTo}
        items={[
          {
            id: 'collateral',
            label: t('close-to', { token: collateralToken }),
            action: () => {
              updateState('closeTo', 'collateral')
            },
          },
          {
            id: 'quote',
            label: t('close-to', { token: quoteToken }),
            action: () => {
              updateState('closeTo', 'quote')
            },
          },
        ]}
      />
      <Text as="p" variant="paragraph3" sx={{ my: 2, color: 'neutral80' }}>
        {t('vault-info-messages.closing')}
      </Text>
      <HighlightedOrderInformation
        symbol={closeToToken}
        label={t('after-closing', { token: closeToToken })}
        value={formatted[closeTo === 'collateral' ? 'collateralOnClose' : 'quoteOnClose']}
        isLoading={isSimulationLoading}
      />
      <AjnaBorrowFormOrder />
    </>
  )
}
