import { Icon } from '@makerdao/dai-ui-icons'
import React, { useRef, useState } from 'react'
import { Box, Card, Flex, Grid, Link, SxStyleProp, Text } from 'theme-ui'

import { getToken } from '../../../blockchain/tokensMetadata'
import { useAppContext } from '../../../components/AppContextProvider'
import { PieChart } from '../../../components/dumb/PieChart'
import { WithLoadingIndicator } from '../../../helpers/AppSpinner'
import { WithErrorHandler } from '../../../helpers/errorHandlers/WithErrorHandler'
import { formatAmount, formatPercent } from '../../../helpers/formatters/format'
import { useObservable } from '../../../helpers/observableHook'
import { zero } from '../../../helpers/zero'
import { useBreakpointIndex } from '../../../theme/useBreakpointIndex'
import { PositionView } from '../pipes/positionsOverviewSummary'
import { AppLink } from '../../../components/Links'
import { useOutsideElementClickHandler } from '../../../helpers/useOutsideElementClickHandler'
import { SystemStyleObject } from '@styled-system/css'
import { AssetAction } from '../pipes/assetActions'

function tokenColor(symbol: string) {
  return getToken(symbol)?.color || '#999'
}

function AssetRow(props: PositionView) {
  return (
    <Flex
      sx={{
        alignItems: 'center',
        color: '#708390',
        '&:hover': {
          backgroundColor: '#F1F3F4',
        },
        cursor: 'pointer',
        pt: '11px',
        pb: '11px',
        pl: '12px',
        pr: '14px',
        borderRadius: '12px',
      }}
    >
      <Icon name={getToken(props.token).iconCircle} size="32px" sx={{ verticalAlign: 'sub' }} />
      <Text
        variant="paragraph2"
        sx={{
          fontWeight: 'semiBold',
          ml: '8px',
        }}
      >
        {props.title}
      </Text>
      {props.proportion && (
        <Text
          variant="paragraph3"
          sx={{
            ml: '8px',
          }}
        >
          {formatPercent(props.proportion)}
        </Text>
      )}
      {props.fundsAvailableUsd && (
        <Text
          variant="paragraph3"
          sx={{
            ml: '8px',
          }}
        >
          (${formatAmount(props.fundsAvailableUsd, 'USD')})
        </Text>
      )}
      {props.actions && <Icon name="dots_v" sx={{ fill: '#708390', ml: 'auto' }} />}
      {props.url && <Icon name="arrow_right" sx={{ fill: '#708390', ml: 'auto' }} />}
    </Flex>
  )
}

function LinkedRow(props: PositionView) {
  const [menuPosition, setMenuPosition] = useState<SxStyleProp | undefined>(undefined)
  const breakpointIndex = useBreakpointIndex()
  if (props.url) {
    return (
      <AppLink href={props.url}>
        <AssetRow {...props} />
      </AppLink>
    )
  } else {
    return (
      <Box
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          if (breakpointIndex <= 1) {
            setMenuPosition({
              right: `${window.innerWidth - rect.right - 20}px`,
              top: `${rect.top}px`,
            })
          } else {
            setMenuPosition({ left: rect.right, top: rect.top })
          }
        }}
      >
        {menuPosition && props.actions && (
          <Menu
            sx={menuPosition}
            close={() => setMenuPosition(undefined)}
            assetActions={props.actions}
          />
        )}
        <AssetRow {...props} />
      </Box>
    )
  }
}

function MenuRow(props: { icon: string; text: string; url: string }) {
  return (
    <Flex sx={{ color: 'black', alignItems: 'center' }}>
      <Link href={props.url}>
        <Icon name={props.icon} sx={{ mr: '15px' }} />
        <Text variant="paragraph2" sx={{ color: 'black' }}>
          {props.text}
        </Text>
      </Link>
    </Flex>
  )
}

function Menu(props: {
  close: () => void
  sx?: SystemStyleObject
  assetActions: Array<AssetAction>
}) {
  const componentRef = useOutsideElementClickHandler(props.close)
  return (
    <Card
      ref={componentRef}
      sx={{
        position: 'absolute',
        boxShadow: 'elevation',
        background: '#FFFFFF',
        borderRadius: '12px',
        border: 'none',
        padding: '24px',
        ...props.sx,
      }}
    >
      <Grid columns={1} gap={20}>
        {props.assetActions.map((aa) => (
          <MenuRow icon={aa.icon} text={aa.text} url={aa.url} />
        ))}
      </Grid>
    </Card>
  )
}

export function AssetsAndPositionsOverview() {
  const breakpointIndex = useBreakpointIndex()
  const { positionsOverviewSummary$ } = useAppContext()
  const [positionsOverviewSummary, err] = useObservable(
    positionsOverviewSummary$('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'),
  )
  return (
    <WithErrorHandler error={err}>
      <WithLoadingIndicator value={positionsOverviewSummary}>
        {(positionsOverviewSummary) => {
          const top5AssetsAndPositions = positionsOverviewSummary.assetsAndPositions.slice(0, 5)
          const pieSlices = [
            ...top5AssetsAndPositions.map((ap) => ({
              value: ap.proportion || zero,
              color: tokenColor(ap.token),
            })),
            { value: positionsOverviewSummary.percentageOther, color: '#999' },
          ]
          return (
            <Card variant="positionsOverview">
              <Text
                variant="paragraph2"
                sx={{
                  fontWeight: 'semiBold',
                }}
              >
                Top 5 Assets and Positions
              </Text>
              <Flex sx={{ mt: '36px', justifyContent: 'space-between', alignContent: 'stretch' }}>
                {breakpointIndex !== 0 && <PieChart items={pieSlices} />}

                <Box sx={{ flex: 1, ml: [null, '53px'] }}>
                  {top5AssetsAndPositions.map((row) => (
                    <LinkedRow key={row.token} {...row} />
                  ))}
                </Box>
              </Flex>
            </Card>
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
