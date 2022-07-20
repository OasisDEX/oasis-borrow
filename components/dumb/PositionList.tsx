import { Icon } from '@makerdao/dai-ui-icons'
import { StatefulTooltip } from 'components/Tooltip'
import { WithChildren } from 'helpers/types'
import { TFunction } from 'i18next'
import _ from 'lodash'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Flex, Grid, Text } from 'theme-ui'

import { AppLink, AppLinkProps } from '../Links'

function DumbHeader({ label, tooltip }: { label: string; tooltip?: JSX.Element | string }) {
  return (
    <Flex sx={{ alignItems: 'center' }}>
      <Text sx={{ fontSize: 1, color: 'neutral80', fontWeight: 'semiBold' }}>{label}</Text>
      {tooltip && (
        <StatefulTooltip
          tooltip={
            <Text
              sx={{
                fontWeight: 'semiBold',
                fontSize: 2,
                textAlign: 'left',
              }}
            >
              {tooltip}
            </Text>
          }
          tooltipSx={{
            px: '16px',
            py: '8px',
            borderRadius: '8px',
            border: 'none',
            maxWidth: '480px',
          }}
        >
          <Icon name="question_o" size="16px" sx={{ ml: 1, flexShrink: 0 }} color="neutral80" />
        </StatefulTooltip>
      )}
    </Flex>
  )
}

function Header({ name }: { name: string }) {
  const { t } = useTranslation()
  return (
    <DumbHeader
      label={t(`earn.position-headers.${name}.label`)}
      tooltip={t(`earn.position-headers.${name}.tooltip`)}
    />
  )
}

function Cell({ children }: WithChildren) {
  return (
    <Box sx={{ py: 2, color: 'primary100' }}>
      <Text sx={{ my: 1 }}>{children}</Text>
    </Box>
  )
}

type PositionCommonProps = {
  icon: string
  ilk: string
  positionId: string
  editLinkProps: AppLinkProps
  isOwnerView: boolean
}

export type BorrowPositionVM = {
  type: 'borrow'
  collateralRatio: string
  inDanger: boolean
  daiDebt: string
  collateralLocked: string
  variable: string
  automationEnabled: boolean
  protectionAmount?: string
  automationLinkProps: AppLinkProps
} & PositionCommonProps

export type MultiplyPositionVM = {
  type: 'multiply'
  netValue: string
  multiple: string
  liquidationPrice: string
  fundingCost: string
  automationEnabled: boolean
  protectionAmount?: string
  automationLinkProps: AppLinkProps
} & PositionCommonProps

export type EarnPositionVM = {
  type: 'earn'
  netValue: string
  pnl: string
  sevenDayYield: string
  liquidity: string
} & PositionCommonProps

export type PositionVM = BorrowPositionVM | MultiplyPositionVM | EarnPositionVM

interface InfoItem {
  header: JSX.Element
  info: JSX.Element | string
}

function AutomationButton({ position }: { position: BorrowPositionVM | MultiplyPositionVM }) {
  const { t } = useTranslation()

  const { automationLinkProps } = position

  if (position.automationEnabled) {
    return (
      <AppLink {...automationLinkProps}>
        <Button variant="actionActiveGreen" sx={{ px: '24px', py: '11px' }}>
          {t('earn.automation-button-on')} {position.protectionAmount}
        </Button>
      </AppLink>
    )
  } else if (position.isOwnerView) {
    return (
      <AppLink {...automationLinkProps}>
        <Button variant="action" sx={{ px: '24px', py: '11px' }}>
          {t('earn.automation-button-off')}
        </Button>
      </AppLink>
    )
  } else {
    return (
      <Button disabled={true} variant="action" sx={{ px: '24px', py: '11px' }}>
        {t('earn.automation-button-off-disabled')}
      </Button>
    )
  }
}

function getPositionInfoItems(position: PositionVM): InfoItem[] {
  const assetInfo = {
    header: <Header name="asset" />,
    info: (
      <Flex
        sx={{
          alignItems: 'center',
          wordBreak: ['break-word', null],
          whiteSpace: [null, 'nowrap'],
        }}
      >
        <Icon name={position.icon} size={[26, 42]} sx={{ mr: 2, flexShrink: 0 }} />{' '}
        <Text>{position.ilk}</Text>
      </Flex>
    ),
  }

  const vaultIdInfo = {
    header: <Header name="position-id" />,
    info: position.positionId,
  }

  switch (position.type) {
    case 'borrow':
      return [
        assetInfo,
        vaultIdInfo,
        {
          header: <Header name="collateral-ratio" />,
          info: (
            <Text sx={{ color: position.inDanger ? 'critical100' : 'success100' }}>
              {position.collateralRatio}
            </Text>
          ),
        },
        {
          header: <Header name="dai-debt" />,
          info: position.daiDebt,
        },
        {
          header: <Header name="collateral-locked" />,
          info: position.collateralLocked,
        },
        {
          header: <Header name="variable-perc" />,
          info: position.variable,
        },
        {
          header: <Header name="protection" />,
          info: <AutomationButton position={position} />,
        },
      ]
    case 'multiply':
      return [
        assetInfo,
        vaultIdInfo,
        {
          header: <Header name="net-value" />,
          info: position.netValue,
        },
        {
          header: <Header name="multiple" />,
          info: position.multiple,
        },
        {
          header: <Header name="liquidation-price" />,
          info: position.liquidationPrice,
        },
        {
          header: <Header name="funding-cost" />,
          info: position.fundingCost,
        },
        {
          header: <Header name="protection" />,
          info: <AutomationButton position={position} />,
        },
      ]
    case 'earn':
      return [
        assetInfo,
        vaultIdInfo,
        {
          header: <Header name="net-value" />,
          info: position.netValue,
        },
        {
          header: <Header name="pnl" />,
          info: position.pnl,
        },
        {
          header: <Header name="liquidity" />,
          info: position.liquidity,
        },
      ]
  }
}

function ProductHeading({ title, count }: { title: string; count: number }) {
  return (
    <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', my: 2 }}>
      {title} ({count})
    </Text>
  )
}

function getVaultActionButtonTranslation(isOwner: boolean, t: TFunction) {
  return isOwner ? t('earn.edit-vault') : t('earn.view-vault')
}

export function PositionList({ positions }: { positions: PositionVM[] }) {
  const { t } = useTranslation()

  const columnCount = 8
  const positionsByType = _.groupBy(positions, 'type')
  const fillRowSx = { gridColumn: `1 / span ${columnCount}` }

  function pad(items: any[], count: number) {
    return items.concat(
      new Array(count - items.length).fill(0).map((_, index) => {
        return <div key={index} />
      }),
    )
  }

  return (
    <Box sx={{ color: 'primary100', zIndex: 1 }}>
      <Text variant="paragraph2" sx={{ fontWeight: 'semiBold', my: 3 }}>
        {t('earn.your-positions')} ({positions.length})
      </Text>

      {/* DESKTOP */}
      <Box sx={{ display: ['none', 'block'], overflowX: 'auto' }}>
        <Grid
          sx={{
            gridTemplateColumns: `repeat(${columnCount}, auto)`,
            columnGap: 4,
            rowGap: 3,
            alignItems: 'center',
            minWidth: '1136px',
            button: { width: '100%' },
          }}
        >
          {Object.entries(positionsByType).map(([type, positions], index, array) => {
            const headers = pad(
              getPositionInfoItems(positions[0]).map((infoItem, index) => (
                <React.Fragment key={`h-${index}`}>{infoItem.header}</React.Fragment>
              )),
              columnCount,
            )
            return (
              <React.Fragment key={`line-${index}-${type}`}>
                <Box sx={fillRowSx} key={`box-${index}-${type}`}>
                  <ProductHeading
                    title={t(`product-page.${type}.title`)}
                    count={positions.length}
                  />
                </Box>
                {headers}
                {positions.map((position, index) => (
                  <React.Fragment key={`value-fragment-${index}-${position.ilk}`}>
                    {pad(
                      getPositionInfoItems(position).map((infoItem, i) => (
                        <Cell key={`${index}-${i}`}>{infoItem.info}</Cell>
                      )),
                      columnCount - 1,
                    )}
                    <AppLink {...position.editLinkProps}>
                      <Button
                        variant="secondary"
                        sx={{
                          fontSize: 1,
                          px: '24px',
                          py: '11px',
                        }}
                      >
                        {getVaultActionButtonTranslation(position.isOwnerView, t)}
                      </Button>
                    </AppLink>
                  </React.Fragment>
                ))}
                {index < array.length - 1 && (
                  <Box variant="separator" sx={{ mb: 2, ...fillRowSx }} />
                )}
              </React.Fragment>
            )
          })}
        </Grid>
      </Box>

      {/* MOBILE */}
      <Box sx={{ display: ['block', 'none'] }}>
        {Object.entries(positionsByType).map(([type, positions], index, array) => {
          return (
            <Box sx={{ pt: 1 }} key={`${index}-${type}`}>
              <ProductHeading title={t(`product-page.${type}.title`)} count={positions.length} />
              {positions.map((position, index) => (
                <Grid
                  sx={{ gap: 4, mb: 4, pt: 3, pb: 2 }}
                  key={`grid-${index}-${position.ilk}-${position.type}`}
                >
                  <Grid sx={{ gridTemplateColumns: '1fr 1fr', justifyItems: 'start', gap: 4 }}>
                    {getPositionInfoItems(position).map(({ header, info }, index) => (
                      <Grid sx={{ gap: 2 }} key={`inner-grip-${index}`}>
                        {header}
                        {info}
                      </Grid>
                    ))}
                  </Grid>
                  <AppLink {...position.editLinkProps}>
                    <Button
                      variant="secondary"
                      sx={{ fontSize: 1, width: '100%', px: '24px', py: '11px' }}
                    >
                      {getVaultActionButtonTranslation(position.isOwnerView, t)}
                    </Button>
                  </AppLink>
                </Grid>
              ))}
              {index < array.length - 1 && <Box variant="separator" sx={{ my: 4 }} />}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
