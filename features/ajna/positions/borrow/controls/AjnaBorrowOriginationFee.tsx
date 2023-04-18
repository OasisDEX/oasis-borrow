import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { getAjnaBorrowOriginationFee } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowOriginationFee'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Text } from 'theme-ui'

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

  const originationFee = getAjnaBorrowOriginationFee({
    interestRate: position.pool.interestRate,
    generateAmount,
  })

  const originationFeeFormatted = `${formatCryptoBalance(
    originationFee,
  )} ${quoteToken} ($${formatAmount(originationFee.times(quotePrice), 'USD')})`

  return generateAmount ? (
    <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
      <Flex sx={{ alignItems: 'center' }}>
        <Icon size={24} name={getToken(quoteToken).iconCircle} sx={{ mr: 1 }} />
        <Text as="p" variant="text.paragraph3" sx={{ color: 'neutral80', fontWeight: 'semiBold' }}>
          {t('ajna.position-page.borrow.common.form.origination-fee', { quoteToken })}
        </Text>
      </Flex>
      <Text as="p" variant="text.paragraph3" sx={{ color: 'primary100', fontWeight: 'semiBold' }}>
        {originationFeeFormatted}
      </Text>
    </Flex>
  ) : (
    <></>
  )
}
