import { AppSpinner } from 'helpers/AppSpinner'
import { formatPrice } from 'helpers/formatters/format'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { GasEstimationStatus } from 'helpers/types/HasGasEstimation.types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { dai, question_o } from 'theme/icons'
import { Box, Flex, Text } from 'theme-ui'
import type { TranslationType } from 'ts_modules/i18next'

import { Icon } from './Icon'
import { Tooltip, useTooltip } from './Tooltip'

function getGasText({
  gasEstimationStatus,
  gasEstimationDai,
  gasEstimationEth,
  t,
}: HasGasEstimation & { t: TranslationType }) {
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
          <Icon icon={dai} size="24px" sx={{ position: 'relative', top: '1px' }} />
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
          icon={question_o}
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
