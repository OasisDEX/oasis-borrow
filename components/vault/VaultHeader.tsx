import { Icon } from '@makerdao/dai-ui-icons'
import { Box, Flex, Grid, Heading, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { Tooltip, useTooltip } from 'components/Tooltip'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { CommonVaultState } from 'helpers/types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { SxStyleProp } from 'theme-ui'

function VaultIlkDetailsItem({
  label,
  value,
  tooltipContent,
  styles,
}: {
  label: string
  value: string
  tooltipContent: string
  styles?: {
    tooltip?: SxStyleProp
  }
}) {
  const { tooltipOpen, setTooltipOpen } = useTooltip()
  const isTouchDevice = window && 'ontouchstart' in window

  return (
    <Flex
      onMouseEnter={!isTouchDevice ? () => setTooltipOpen(true) : undefined}
      onMouseLeave={!isTouchDevice ? () => setTooltipOpen(false) : undefined}
      onClick={
        isTouchDevice
          ? () => {
              setTooltipOpen(!tooltipOpen)
            }
          : undefined
      }
      sx={{
        px: [0, 4],
        alignItems: 'center',
        borderRight: ['none', 'light'],
        cursor: 'pointer',
        '&:first-child': {
          pl: 0,
        },
        '&:last-child': {
          borderRight: 'none',
        },
      }}
    >
      <Box sx={{ flex: 1 }}>
        {`${label} `}
        <Text as="span" sx={{ color: 'primary', ml: 1, mr: 2 }}>
          {value}
        </Text>
      </Box>
      <Flex sx={{ position: 'relative' }}>
        <Box sx={{ fontSize: '0px' }}>
          <Icon name="tooltip" color="primary" size="auto" width="14px" height="14px" />
        </Box>
        {tooltipOpen && (
          <Tooltip sx={{ variant: 'cards.tooltipVaultHeader', ...styles?.tooltip }}>
            <Box p={1} sx={{ fontWeight: 'semiBold', fontSize: 1 }}>
              {tooltipContent}
            </Box>
          </Tooltip>
        )}
      </Flex>
    </Flex>
  )
}

export function VaultIlkDetails(props: CommonVaultState & { id?: BigNumber }) {
  const {
    ilkData: { liquidationRatio, stabilityFee, liquidationPenalty, debtFloor },
    id,
  } = props
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        mb: 4,
        fontSize: 1,
        fontWeight: 'semiBold',
        color: 'text.subtitle',
        display: ['grid', 'flex'],
        gridTemplateColumns: '1fr 1fr',
        gap: [3, 0],
      }}
    >
      <VaultIlkDetailsItem
        label={'VaultID'}
        value={id ? id.toFixed(0) : 'T.B.D'}
        tooltipContent={t('manage-multiply-vault.tooltip.vaultId')}
      />
      <VaultIlkDetailsItem
        label={t('manage-vault.stability-fee')}
        value={`${formatPercent(stabilityFee.times(100), { precision: 2 })}`}
        tooltipContent={t('manage-multiply-vault.tooltip.stabilityFee')}
        styles={{
          tooltip: {
            left: ['auto', '-20px'],
            right: ['-0px', 'auto'],
          },
        }}
      />
      <VaultIlkDetailsItem
        label={t('manage-vault.liquidation-fee')}
        value={`${formatPercent(liquidationPenalty.times(100))}`}
        tooltipContent={t('manage-multiply-vault.tooltip.liquidationFee')}
      />
      <VaultIlkDetailsItem
        label={t('manage-vault.min-collat-ratio')}
        value={`${formatPercent(liquidationRatio.times(100))}`}
        tooltipContent={t('manage-multiply-vault.tooltip.min-collateral')}
        styles={{
          tooltip: {
            left: 'auto',
            right: ['10px', '-154px'],
          },
        }}
      />
      <VaultIlkDetailsItem
        label={t('manage-vault.dust-limit')}
        value={`$${formatCryptoBalance(debtFloor)}`}
        tooltipContent={t('manage-multiply-vault.tooltip.dust-limit')}
        styles={{
          tooltip: {
            left: ['-80px', 'auto'],
            right: ['auto', '-32px'],
          },
        }}
      />
    </Box>
  )
}

export function VaultHeader(props: CommonVaultState & { header: string; id?: BigNumber }) {
  return (
    <Grid mt={4}>
      <Heading
        as="h1"
        variant="heading1"
        sx={{
          fontWeight: 'semiBold',
          pb: 2,
        }}
      >
        {props.header}
      </Heading>
      <VaultIlkDetails {...props} />
    </Grid>
  )
}
