import { Box, Flex, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { VaultChangesInformationItem } from 'components/vault/VaultChangesInformation'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface OpenFlowStopLossSummaryProps {
  stopLossLevel: BigNumber
  ratioTranslationKey: string
  dynamicStopLossPrice: BigNumber
}

export function OpenFlowStopLossSummary({
  stopLossLevel,
  ratioTranslationKey,
  dynamicStopLossPrice,
}: OpenFlowStopLossSummaryProps) {
  const { t } = useTranslation()

  return (
    <>
      <Box as="li" sx={{ listStyle: 'none' }}>
        <Text as="h3" variant="paragraph3" sx={{ fontWeight: 'semiBold' }}>
          {t('protection.stop-loss-information')}
        </Text>
      </Box>
      <VaultChangesInformationItem
        label={`${t(ratioTranslationKey)}`}
        value={
          <Flex>
            {formatPercent(stopLossLevel, {
              precision: 2,
              roundMode: BigNumber.ROUND_DOWN,
            })}
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={`${t('protection.dynamic-stop-loss-price')}`}
        value={<Flex>${formatAmount(dynamicStopLossPrice, 'USD')}</Flex>}
      />
    </>
  )
}
