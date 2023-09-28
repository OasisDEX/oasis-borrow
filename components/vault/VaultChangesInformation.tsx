import { Box, Flex, Text } from '@theme-ui/components'
import type BigNumber from 'bignumber.js'
import type { GasEstimationContext } from 'components/context/GasEstimationContextProvider'
import { DimmedList } from 'components/DImmedList'
import { Icon } from 'components/Icon'
import { InfoSectionLoadingState } from 'components/infoSection/Item'
import { Tooltip, useTooltip } from 'components/Tooltip'
import { formatAmount } from 'helpers/formatters/format'
import { isTouchDevice } from 'helpers/isTouchDevice'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { GasEstimationStatus } from 'helpers/types/HasGasEstimation.types'
import type { WithChildren } from 'helpers/types/With.types'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { ReactNode } from 'react'
import React, { useCallback, useMemo } from 'react'
import { arrow_right_light, question_o } from 'theme/icons'

export function VaultChangesInformationItem({
  label,
  value,
  tooltip,
}: {
  label: string
  value: ReactNode
  tooltip?: ReactNode
}) {
  const { tooltipOpen, setTooltipOpen } = useTooltip()

  const handleMouseEnter = useMemo(
    () => (!isTouchDevice ? () => setTooltipOpen(true) : undefined),
    [isTouchDevice],
  )

  const handleMouseLeave = useMemo(
    () => (!isTouchDevice ? () => setTooltipOpen(false) : undefined),
    [isTouchDevice],
  )

  const handleClick = useCallback(() => tooltip && setTooltipOpen(true), [tooltip])

  return (
    <Flex
      as="li"
      sx={{
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 1,
        fontWeight: 'semiBold',
        cursor: tooltip ? 'pointer' : 'inherit',
        position: 'relative',
      }}
      onClick={handleClick}
    >
      <Flex
        sx={{ color: 'neutral80', justifyContent: 'flex-end', alignItems: 'center' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Text variant="paragraph4" sx={{ lineHeight: '16px', color: 'inherit' }}>
          {label}
        </Text>
        {tooltip && <Icon icon={question_o} size="20px" sx={{ ml: 1 }} />}
      </Flex>
      {tooltip && tooltipOpen && (
        <Tooltip sx={{ transform: 'translateY(-100%)', right: ['0px', 'auto'], top: '-5px' }}>
          {tooltip}
        </Tooltip>
      )}
      <Box sx={{ color: 'primary100' }}>
        <Text as="div" variant="paragraph4">
          {value}
        </Text>
      </Box>
    </Flex>
  )
}

export function VaultChangesInformationContainer({
  title,
  children,
}: { title: string } & WithChildren) {
  return (
    <DimmedList>
      <Box as="li" sx={{ listStyle: 'none' }}>
        <Text as="h3" variant="paragraph3" sx={{ fontWeight: 'semiBold' }}>
          {title}
        </Text>
      </Box>
      {children}
    </DimmedList>
  )
}

export function VaultChangesInformationArrow() {
  return <Icon icon={arrow_right_light} size="auto" width="10px" height="7px" sx={{ mx: 2 }} />
}

export function EstimationError({ withBrackets }: { withBrackets: boolean }) {
  const textError = 'n/a'
  return (
    <Text as="div" sx={{ color: 'critical100' }}>
      {withBrackets ? `(${textError})` : textError}
    </Text>
  )
}

export const formatGasEstimationUSD = (gasEstimation: HasGasEstimation) => {
  if (!gasEstimation.gasEstimationUsd) {
    throw new Error(
      `could not format formatGasEstimationUSD:  gasEstimation.gasEstimationUsd is ${gasEstimation.gasEstimationUsd}`,
    )
  }
  return `$${formatAmount(gasEstimation.gasEstimationUsd, 'USD')}`
}

export const formatGasEstimationETH = (gasEstimation: HasGasEstimation) => {
  if (!gasEstimation.gasEstimationEth) {
    throw new Error(
      `could not format formatGasEstimationETH:  gasEstimation.gasEstimationEth is ${gasEstimation.gasEstimationEth}`,
    )
  }
  return `${formatAmount(gasEstimation.gasEstimationEth, 'ETH')} ETH`
}

export function getEstimatedGasFeeTextOld(
  gasEstimation?: HasGasEstimation,
  withBrackets = false,
  formatFunction: (gasEstimation: HasGasEstimation) => string = formatGasEstimationUSD,
) {
  if (!gasEstimation) {
    return <EstimationError withBrackets={withBrackets} />
  }

  switch (gasEstimation.gasEstimationStatus) {
    case GasEstimationStatus.calculating:
      const textPending = 'Pending...'

      return (
        <Text sx={{ color: 'neutral80' }}>{withBrackets ? `(${textPending})` : textPending}</Text>
      )
    case GasEstimationStatus.error:
    case GasEstimationStatus.unknown:
    case GasEstimationStatus.unset:
      return <EstimationError withBrackets={withBrackets} />
    case GasEstimationStatus.calculated:
      const textGas = formatFunction(gasEstimation)

      return withBrackets ? `(${textGas})` : textGas
  }
}

export function getEstimatedGasFeeText(
  gasEstimation?: GasEstimationContext,
  addition: BigNumber = zero,
) {
  if (!gasEstimation) {
    return 'n/a'
  }
  const status: GasEstimationStatus = gasEstimation.isCompleted
    ? gasEstimation.isSuccessful
      ? GasEstimationStatus.calculated
      : GasEstimationStatus.error
    : GasEstimationStatus.calculating

  switch (status) {
    case GasEstimationStatus.calculating:
      return <InfoSectionLoadingState />
    case GasEstimationStatus.error:
    case undefined:
      return <EstimationError withBrackets={false} />
    case GasEstimationStatus.calculated:
      return `$${formatAmount(gasEstimation?.usdValue.plus(addition), 'USD')}`
  }
}

export function VaultChangesInformationEstimatedGasFee(props: HasGasEstimation) {
  const { t } = useTranslation()
  return (
    <VaultChangesInformationItem
      label={t('max-gas-fee')}
      value={getEstimatedGasFeeTextOld(props)}
      tooltip={<Box>{t('gas-explanation')}</Box>}
    />
  )
}
