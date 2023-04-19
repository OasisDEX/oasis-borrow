import { getToken } from 'blockchain/tokensMetadata'
import { HighlightedOrderInformation } from 'components/HighlightedOrderInformation'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const AjnaBorrowOriginationFee = () => {
  const { t } = useTranslation()
  const {
    environment: { quoteToken, quotePrice },
  } = useAjnaGeneralContext()
  const {
    form: {
      state: { generateAmount },
    },
    position: {
      currentPosition: { position },
    },
  } = useAjnaProductContext('borrow')
  const originationFee = position.originationFee(generateAmount || zero)
  const originationFeeFormatted = `${formatCryptoBalance(
    originationFee,
  )} ${quoteToken} ($${formatAmount(originationFee.times(quotePrice), 'USD')})`

  return (
    <HighlightedOrderInformation
      label={t('ajna.position-page.borrow.common.form.origination-fee', { quoteToken })}
      iconCircle={getToken(quoteToken).iconCircle}
      value={originationFeeFormatted}
    />
  )
}
