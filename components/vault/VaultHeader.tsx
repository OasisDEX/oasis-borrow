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

  return (
    <Flex
      sx={{
        px: [0, 4],
        alignItems: 'center',
        borderRight: ['none', 'light'],
        '&:first-child': {
          pl: 0,
        },
        '&:last-child': {
          borderRight: 'none',
        },
      }}
    >
      {`${label} `}
      <Text as="span" sx={{ color: 'primary', ml: 1, mr: 2 }}>
        {value}
      </Text>
      <Flex sx={{ position: 'relative' }}>
        <Icon
          name="tooltip"
          color="primary"
          sx={{ cursor: 'pointer' }}
          onClick={() => {
            setTooltipOpen(!tooltipOpen)
          }}
          size="auto"
          width="14px"
          height="14px"
        />
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
        tooltipContent="Vault ID tooltip content"
      />
      <VaultIlkDetailsItem
        label={t('manage-vault.stability-fee')}
        value={`${formatPercent(stabilityFee.times(100), { precision: 2 })}`}
        tooltipContent="Stability fee tooltip content"
        styles={{
          tooltip: {
            left: ['auto', '-20px'],
            right: ['-20px', 'auto'],
          },
        }}
      />
      <VaultIlkDetailsItem
        label={t('manage-vault.liquidation-fee')}
        value={`${formatPercent(liquidationPenalty.times(100))}`}
        tooltipContent="A Liquidation Penalty is a fee paid by Vault owners when the value of their collateral reaches the Vault's Liquidation Price."
      />
      <VaultIlkDetailsItem
        label={t('manage-vault.min-collat-ratio')}
        value={`${formatPercent(liquidationRatio.times(100))}`}
        tooltipContent="Min Coll Ratio tooltip content"
        styles={{
          tooltip: {
            left: 'auto',
            right: ['-4px', '-154px'],
          },
        }}
      />
      <VaultIlkDetailsItem
        label={t('manage-vault.dust-limit')}
        value={`$${formatCryptoBalance(debtFloor)}`}
        tooltipContent="Dust Limit tooltip content"
        styles={{
          tooltip: {
            left: ['-20px', 'auto'],
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
