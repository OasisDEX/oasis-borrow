import { Icon } from '@makerdao/dai-ui-icons'
import { Box, Flex, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { Tooltip, useTooltip } from 'components/Tooltip'
import { PriceInfo } from 'features/shared/priceInfo'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { SxStyleProp } from 'theme-ui'

import { VaultHeaderContainer } from './VaultHeaderContainer'

export function VaultIlkDetailsItem({
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
      <Flex sx={{ alignItems: 'center' }}>
        {`${label} `}
        <Text as="span" sx={{ color: 'primary100', ml: 1, mr: 1 }}>
          {value}
        </Text>
        <Flex sx={{ position: 'relative' }}>
          <Box sx={{ fontSize: '0px' }}>
            <Icon name="tooltip" color="primary100" size="auto" width="14px" height="14px" />
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
    </Flex>
  )
}

export function VaultHeader(props: {
  header: string
  id?: BigNumber
  token: string
  priceInfo: PriceInfo
  children: ReactNode
}) {
  const { id, header, token, priceInfo, children } = props
  const { t } = useTranslation()

  return (
    <VaultHeaderContainer header={header} token={token} priceInfo={priceInfo}>
      <VaultIlkDetailsItem
        label="VaultID"
        value={id ? id.toFixed(0) : 'T.B.D'}
        tooltipContent={t('manage-multiply-vault.tooltip.vaultId')}
      />
      {children}
    </VaultHeaderContainer>
  )
}
