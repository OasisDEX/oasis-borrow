import { Icon } from '@makerdao/dai-ui-icons'
import { AppSpinner } from 'helpers/AppSpinner'
import { GasEstimationStatus, HasGasEstimation } from 'helpers/form'
import { formatPrice } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import { TFunction } from 'next-i18next'
import React from 'react'
import { Box, Flex, Text } from 'theme-ui'

import { Tooltip, useTooltip } from './Tooltip'

function getGasText({
  gasEstimationStatus,
  gasEstimationDai,
  gasEstimationEth,
  t,
}: HasGasEstimation & { t: TFunction }) {
  switch (gasEstimationStatus) {
    case GasEstimationStatus.calculating:
      return <AppSpinner />
    case GasEstimationStatus.error:
      return <Text variant="error">{t('gas-estimation-error')}</Text>
    case GasEstimationStatus.unknown:
      return <Text variant="smallAlt">--</Text>
    case GasEstimationStatus.unset:
    case undefined:
    case GasEstimationStatus.calculated:
      return gasEstimationEth ? (
        <Text sx={{ display: 'inline' }}>{`${formatPrice(gasEstimationEth, 'ETH')} ETH`}</Text>
      ) : gasEstimationDai ? (
        <Flex sx={{ fontSize: 5, alignItems: 'center' }}>
          <Icon name="dai" size="24px" sx={{ position: 'relative', top: '1px' }} />
          <Text ml={1}>{`~${formatPrice(gasEstimationDai, 'DAI')}`}</Text>
        </Flex>
      ) : (
        '--'
      )
  }
}

export function GasCost({
  gasEstimationDai,
  gasEstimationStatus,
  gasEstimationEth,
}: HasGasEstimation) {
  const { tooltipOpen, setTooltipOpen } = useTooltip()
  const { t } = useTranslation()

  return (
    <Box>
      <Flex sx={{ mb: 2, alignItems: 'center', position: 'relative' }}>
        <Text sx={{ fontSize: 4, fontWeight: 'semiBold', mr: 2 }}>{t('transaction-fee')}</Text>
        <Icon
          name="question_o"
          size="20px"
          sx={{ cursor: 'pointer' }}
          onClick={() => setTooltipOpen(true)}
        />
        {tooltipOpen && (
          <Tooltip>
            <Text sx={{ fontWeight: 'semiBold', mb: 1 }}>{t('transaction-fee')}</Text>
            <Text sx={{ fontSize: 2 }}>
              {t('transaction-fee-tooltip-desc')}{' '}
              {getGasText({ gasEstimationStatus, gasEstimationEth, t })}.
            </Text>
          </Tooltip>
        )}
      </Flex>
      <Text sx={{ textAlign: 'left' }}>
        {getGasText({ gasEstimationStatus, gasEstimationDai, t })}
      </Text>
    </Box>
  )
}
