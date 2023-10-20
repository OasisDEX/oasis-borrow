import { amountFromWei } from 'blockchain/utils'
import { MessageCard } from 'components/MessageCard'
import type { BaseAaveContext } from 'features/aave/types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function ErrorMessageCannotDepositDueToProtocolCap({
  context,
}: {
  context: BaseAaveContext
}) {
  const { transition, reserveData } = context
  const { t } = useTranslation()
  if (
    !transition ||
    !transition.simulation ||
    !reserveData ||
    reserveData.collateral.caps.supply.isZero()
  ) {
    return <></>
  }

  const maxSupply = reserveData.collateral.availableToSupply
  const collateralToken = transition.simulation.position.collateral.symbol
  const targetPositionCollateral = amountFromWei(
    transition.simulation.delta.collateral,
    collateralToken,
  )

  const messages: string[] = []

  if (targetPositionCollateral.gt(maxSupply)) {
    messages.push(
      t('aave.errors.deposit-amount-exceeds-supply-cap', {
        cap: formatCryptoBalance(maxSupply),
        token: collateralToken,
      }),
    )
  }

  return <MessageCard messages={messages} type={'error'} withBullet={false} />
}
