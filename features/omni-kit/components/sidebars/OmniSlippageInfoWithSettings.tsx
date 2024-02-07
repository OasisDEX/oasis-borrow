import { SidebarSectionFooterButton } from 'components/sidebar/SidebarSectionFooterButton'
import { OrderInformationTooltipAction } from 'features/aave/components/order-information/OrderInformationTooltipAction'
import { OmniSlippageSourceSettings } from 'features/omni-kit/contexts'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Box, Text } from 'theme-ui'

interface OmniChangeSlippageToUserSettingsProps {
  changeSlippage: () => void
  buttonLabel: string
}

const OmniChangeSlippageToUserSettings: FC<OmniChangeSlippageToUserSettingsProps> = ({
  changeSlippage,
  buttonLabel,
}) => {
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

interface OmniSlippageFromStrategyProps {
  slippage: string
  changeSlippage: (value: OmniSlippageSourceSettings) => void
  withDefaultSlippage: boolean
}

const OmniSlippageFromStrategyWithTooltip: FC<OmniSlippageFromStrategyProps> = ({
  slippage,
  changeSlippage,
}) => {
  const { t } = useTranslation()
  return (
    <>
      <Text color={'primary100'}>{slippage}</Text>{' '}
      <OrderInformationTooltipAction>
        <OmniChangeSlippageToUserSettings
          buttonLabel={t('vault-changes.slippage-from-settings')}
          changeSlippage={() => {
            changeSlippage(OmniSlippageSourceSettings.USER_SETTINGS)
          }}
        />
      </OrderInformationTooltipAction>
    </>
  )
}

const OmniSlippageFromSettingsWithTooltip: FC<OmniSlippageFromStrategyProps> = ({
  slippage,
  changeSlippage,
  withDefaultSlippage,
}) => {
  const { t } = useTranslation()
  return (
    <>
      <Text color={withDefaultSlippage ? 'warning100' : 'primary100'}>{slippage}</Text>
      {withDefaultSlippage && (
        <OrderInformationTooltipAction>
          <OmniChangeSlippageToUserSettings
            buttonLabel={t('vault-changes.slippage-from-strategy')}
            changeSlippage={() => {
              changeSlippage(OmniSlippageSourceSettings.STRATEGY_CONFIGS)
            }}
          />
        </OrderInformationTooltipAction>
      )}
    </>
  )
}

interface OmniSlippageSettingsProps {
  getSlippageFrom: OmniSlippageSourceSettings
  slippage: string
  changeSlippage: (value: OmniSlippageSourceSettings) => void
  withDefaultSlippage: boolean
}

export const OmniSlippageInfoWithSettings: FC<OmniSlippageSettingsProps> = (props) => {
  if (props.getSlippageFrom === OmniSlippageSourceSettings.STRATEGY_CONFIGS)
    return <OmniSlippageFromStrategyWithTooltip {...props} />
  return <OmniSlippageFromSettingsWithTooltip {...props} />
}
