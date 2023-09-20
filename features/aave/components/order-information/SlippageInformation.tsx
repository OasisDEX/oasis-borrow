import type BigNumber from 'bignumber.js'
import { SidebarSectionFooterButton } from 'components/sidebar/SidebarSectionFooterButton'
import { VaultChangesInformationItem } from 'components/vault/VaultChangesInformation'
import { formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Text } from 'theme-ui'

import { OrderInformationTooltipAction } from './OrderInformationTooltipAction'

interface SlippageInformationProps {
  slippage: BigNumber
  isStrategyHasSlippage: boolean
  getSlippageFrom: 'userSettings' | 'strategyConfig'
  changeSlippage: (from: 'userSettings' | 'strategyConfig') => void
}

function ChangeSlippageToUserSettings({
  changeSlippage,
  buttonLabel,
}: {
  changeSlippage: () => void
  buttonLabel: string
}) {
  const { t } = useTranslation()
  return (
    <Box sx={{ p: 3 }}>
      {t('vault-changes.slippage-info')}
      <SidebarSectionFooterButton
        variant="textual"
        action={() => {
          changeSlippage()
        }}
        label={buttonLabel}
      />
    </Box>
  )
}

function BasicSlippageInformation({ slippage }: SlippageInformationProps) {
  const { t } = useTranslation()
  return (
    <VaultChangesInformationItem
      label={t('vault-changes.slippage-limit')}
      value={formatPercent(slippage.times(100), { precision: 2 })}
    />
  )
}

function SlippageFromStrategyWithTooltip({ slippage, changeSlippage }: SlippageInformationProps) {
  const { t } = useTranslation()
  return (
    <VaultChangesInformationItem
      label={t('vault-changes.slippage-limit')}
      value={
        <Flex>
          <Text color={'primary100'}>{formatPercent(slippage.times(100), { precision: 2 })}</Text>{' '}
          <OrderInformationTooltipAction>
            <ChangeSlippageToUserSettings
              buttonLabel={t('vault-changes.slippage-from-settings')}
              changeSlippage={() => {
                changeSlippage('userSettings')
              }}
            />
          </OrderInformationTooltipAction>
        </Flex>
      }
    />
  )
}

function SlippageFromSettingsWithTooltip({ slippage, changeSlippage }: SlippageInformationProps) {
  const { t } = useTranslation()
  return (
    <VaultChangesInformationItem
      label={t('vault-changes.slippage-limit')}
      value={
        <Flex>
          <Text color={'warning100'}>{formatPercent(slippage.times(100), { precision: 2 })}</Text>
          <OrderInformationTooltipAction>
            <ChangeSlippageToUserSettings
              buttonLabel={t('vault-changes.slippage-from-strategy')}
              changeSlippage={() => {
                changeSlippage('strategyConfig')
              }}
            />
          </OrderInformationTooltipAction>
        </Flex>
      }
    />
  )
}

export function SlippageInformation(props: SlippageInformationProps) {
  if (!props.isStrategyHasSlippage) return <BasicSlippageInformation {...props} />
  if (props.getSlippageFrom === 'strategyConfig')
    return <SlippageFromStrategyWithTooltip {...props} />
  return <SlippageFromSettingsWithTooltip {...props} />
}
