import { amountFromWei } from 'blockchain/utils'
import { MessageCard } from 'components/MessageCard'
import type { BaseAaveContext } from 'features/aave/types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function ErrorMessagesLtvToHighDueToProtocolCaps({ context }: { context: BaseAaveContext }) {
  const { transition, reserveData } = context
  const { t } = useTranslation()
  if (!transition || !transition.simulation || !reserveData) {
    return <></>
  }

  const maxSupply = reserveData.collateral.availableToSupply
  const maxBorrow = reserveData.debt.availableToBorrow
  const collateralToken = transition.simulation.position.collateral.symbol
  const debtToken = transition.simulation.position.debt.symbol
  const targetPositionCollateral = amountFromWei(
    transition.simulation.delta.collateral,
    collateralToken,
  )
  const targetPositionDebt = amountFromWei(transition.simulation.delta.debt, debtToken)

  const messages: string[] = []

  if (targetPositionCollateral.gt(maxSupply)) {
    messages.push(
      t('aave.errors.target-ltv-exceeds-supply-cap', {
        cap: formatCryptoBalance(maxSupply),
        token: collateralToken,
      }),
    )
  }

  if (targetPositionDebt.gt(maxBorrow)) {
    messages.push(
      t('aave.errors.target-ltv-exceeds-borrow-cap', {
        cap: formatCryptoBalance(maxBorrow),
        token: debtToken,
      }),
    )
  }

  return <MessageCard messages={messages} type={'error'} withBullet={false} />
}
