import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { AppLink } from 'components/Links'
import { Tooltip, useTooltip } from 'components/Tooltip'
import { VaultType } from 'features/generalManageVault/generalManageVault'
import { TFunction, useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Card, Flex, Grid, Heading, SxStyleProp, Text } from 'theme-ui'

import { formatPercent } from '../../helpers/formatters/format'

const ILK_PANEL_ITEMS = (dailyStabilityFee: string, stabilityFee: string, minCollRatio: string) => [
  {
    translationKey: 'daily-stability-fee',
    value: `${dailyStabilityFee} DAI`,
  },
  {
    translationKey: 'stability-fee',
    value: stabilityFee,
  },
  {
    translationKey: 'minimum-coll-ratio',
    value: minCollRatio,
  },
]

function daysInYear() {
  const year = new Date().getFullYear()
  return (year % 4 === 0 && year % 100 > 0) || year % 400 === 0 ? 366 : 365
}

function getDailyStabilityFee(stabilityFee: BigNumber, debt: number) {
  const dailyStabilityFeeInPercent = stabilityFee.toNumber() / daysInYear()

  return Math.round(debt * dailyStabilityFeeInPercent * 10000) / 10000
}

function IlkPanelItem({
  title,
  tooltip,
  value,
}: {
  title: string
  tooltip: string
  value: string
}) {
  const { tooltipOpen, setTooltipOpen } = useTooltip()
  const isTouchDevice = window && 'ontouchstart' in window

  return (
    <Grid columns={[1, 2]} gap={2}>
      <Flex
        sx={{ position: 'relative' }}
        onClick={isTouchDevice ? () => setTooltipOpen(!tooltipOpen) : undefined}
      >
        <Text
          sx={{ color: 'text.subtitle', fontWeight: 'semiBold', fontSize: 1 }}
          onMouseEnter={!isTouchDevice ? () => setTooltipOpen(true) : undefined}
          onMouseLeave={!isTouchDevice ? () => setTooltipOpen(false) : undefined}
        >
          <Flex sx={{ alignItems: 'center' }}>
            {title}
            <Icon
              name="question_o"
              size="20px"
              sx={{ cursor: 'pointer', ml: '5.6px' }}
              color="lightIcon"
            />
            {tooltipOpen && (
              <Tooltip
                sx={{
                  variant: 'cards.tooltip',
                  transform: 'translate(50px, 30px)',
                  top: 0,
                  left: 0,
                  p: 2,
                }}
              >
                {tooltip}
              </Tooltip>
            )}
          </Flex>
        </Text>
      </Flex>
      <Flex sx={{ justifyContent: ['flex-start', 'flex-end'] }}>
        <Text sx={{ color: 'primary', fontWeight: 'semiBold', fontSize: [1, 2] }}>{value}</Text>
      </Flex>
    </Grid>
  )
}

const multiplyPrediction = (
  valueToDeposit: string,
  exposureValue: string,
  token: string,
  t: TFunction,
) => {
  return {
    predictionTitle: t('asset-page.ilk-panel.multiplyTitle', { valueToDeposit, token }),
    predictionValue: t('asset-page.ilk-panel.multiplyValue', { exposureValue, token }),
  }
}

const borrowPrediction = (
  daiToGenerate: string,
  collUsage: string,
  collRatio: string,
  token: string,
  t: TFunction,
) => {
  return {
    predictionTitle: t('asset-page.ilk-panel.borrowTitle', { daiToGenerate, collRatio }),
    predictionValue: t('asset-page.ilk-panel.borrowValue', { collUsage, token }),
  }
}

interface VaultEstimations {
  sliderValue: number
  sliderEstimatedValue: number
  daiDebt: number
}

function IlkPanelEstimation({
  token,
  vaultType,
  collRatio,
  dailyStabilityFee,
  vaultEstimations,
}: {
  token: string
  vaultType: VaultType
  collRatio: string
  dailyStabilityFee: string
  vaultEstimations: VaultEstimations
}) {
  const { t } = useTranslation()

  const { sliderValue, sliderEstimatedValue } = vaultEstimations

  const predictionMap = {
    multiply: multiplyPrediction(sliderValue.toFixed(2), sliderEstimatedValue.toFixed(2), token, t),
    borrow: borrowPrediction(
      sliderValue.toFixed(2),
      sliderEstimatedValue.toFixed(2),
      collRatio,
      token,
      t,
    ),
  }

  const { predictionTitle, predictionValue } = predictionMap[vaultType]

  return (
    <Grid columns={[1, 2]} gap={4} pb={3}>
      <Flex sx={{ flexDirection: 'column' }}>
        <Text sx={{ color: 'text.subtitle' }} variant="paragraph3">
          {predictionTitle}
        </Text>
        <Text sx={{ fontSize: 4, fontWeight: 'semiBold', color: 'link' }}>{predictionValue}</Text>
      </Flex>
      <Flex sx={{ flexDirection: 'column', alignItems: ['flex-start', 'flex-end'] }}>
        <Text sx={{ color: 'text.subtitle' }} variant="paragraph3">
          {t('asset-page.ilk-panel.at-daily-cost')}
        </Text>
        <Text sx={{ fontSize: 4, fontWeight: 'semiBold', color: 'link' }}>
          {dailyStabilityFee} DAI
        </Text>
      </Flex>
    </Grid>
  )
}

function IlkPanelButton({
  sx,
  ilk,
  vaultType,
  children,
}: {
  sx: SxStyleProp
  ilk: string
  vaultType: VaultType
  children: ReactNode
}) {
  const hrefMap = {
    [VaultType.Borrow]: '/vaults/open/',
    [VaultType.Multiply]: '/vaults/open-multiply/',
  }
  return (
    <AppLink
      href={`${hrefMap[vaultType]}${ilk}`}
      variant="primary"
      sx={{
        flex: 1,
        px: '40px',
        py: 2,
        mx: 'auto',
        textAlign: 'center',
        display: ['none', 'block'],
        ...sx,
      }}
    >
      {children}
    </AppLink>
  )
}

export function IlkPanel({
  ilkData,
  description,
  vaultType,
  vaultEstimations,
  infoBadge,
}: {
  ilkData: IlkData
  debt: number
  description: string
  vaultType: VaultType
  vaultEstimations: VaultEstimations
  infoBadge?: ReactNode
}) {
  const { t } = useTranslation()
  const { ilk, stabilityFee, liquidationRatio, token } = ilkData
  const { daiDebt } = vaultEstimations
  const dailyStabilityFee = getDailyStabilityFee(stabilityFee, daiDebt)
  const stabilityFeeInPercent = formatPercent(stabilityFee.times(100), { precision: 2 })
  const minCollRatio = formatPercent(liquidationRatio.times(100), { precision: 2 })

  return (
    <Card sx={{ p: 0, boxShadow: 'cardLanding' }}>
      <Grid columns={[1, 2]} sx={{ borderBottom: '1px solid #EAEAEA', px: 4, py: '24px' }}>
        <Grid>
          <Heading as="h3" variant="header3">
            {ilk}
          </Heading>
          <Text sx={{ color: 'text.subtitle' }} variant="paragraph3">
            {description}
          </Text>
        </Grid>
        {infoBadge && (
          <Flex sx={{ justifyContent: ['flex-start', 'flex-end'], alignItems: 'center' }}>
            {infoBadge}
          </Flex>
        )}
      </Grid>
      <Grid columns={1} gap={2} sx={{ p: [4, 5], py: [4, 4] }}>
        <IlkPanelEstimation
          token={token}
          vaultType={vaultType}
          collRatio={minCollRatio}
          vaultEstimations={vaultEstimations}
          dailyStabilityFee={dailyStabilityFee.toFixed(4)}
        />
        {ILK_PANEL_ITEMS(dailyStabilityFee.toFixed(2), stabilityFeeInPercent, minCollRatio).map(
          (item) => (
            <IlkPanelItem
              key={item.translationKey}
              title={t(`asset-page.ilk-panel.${item.translationKey}`)}
              tooltip={t(`asset-page.ilk-panel.${item.translationKey}-tooltip`)}
              value={item.value}
            />
          ),
        )}
        <Flex sx={{ pt: 3 }}>
          <IlkPanelButton sx={{ display: ['none', 'block'] }} ilk={ilk} vaultType={vaultType}>
            {t(`asset-page.ilk-panel.${vaultType}-with`, { ilk })}
          </IlkPanelButton>
          <IlkPanelButton sx={{ display: ['block', 'none'] }} ilk={token} vaultType={vaultType}>
            {t(`asset-page.ilk-panel.${vaultType}`)}
          </IlkPanelButton>
        </Flex>
      </Grid>
    </Card>
  )
}
