import { MessageCard } from 'components/MessageCard'
import type { BaseAaveContext } from 'features/aave/types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function ErrorMessageCannotBorrowDueToProtocolCap({
  context,
}: {
  context: BaseAaveContext
}) {
  const { transition, reserveData } = context
  const { t } = useTranslation()
  if (!transition || !transition.simulation || !reserveData) {
    return <></>
  }

  const maxBorrow = reserveData.debt.availableToBorrow
  const debtToken = transition.simulation.position.debt.symbol
  const targetPositionDebt = transition.simulation.delta.debt

  const messages: string[] = []

  if (targetPositionDebt.gt(maxBorrow)) {
    messages.push(
      t('aave.errors.debt-amount-exceeds-borrow-cap', {
        cap: formatCryptoBalance(maxBorrow),
        token: debtToken,
      }),
    )
  }

  return <MessageCard messages={messages} type={'error'} withBullet={false} />
}
