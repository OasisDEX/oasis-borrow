import { Icon } from '@makerdao/dai-ui-icons'
import { SystemStyleObject } from '@styled-system/css'
import React, { useState } from 'react'
import { Box, Card, Flex, Grid, Link, SxStyleProp, Text } from 'theme-ui'

import { getToken } from '../../../blockchain/tokensMetadata'
import { useAppContext } from '../../../components/AppContextProvider'
import { PieChart } from '../../../components/dumb/PieChart'
import { AppLink } from '../../../components/Links'
import { WithLoadingIndicator } from '../../../helpers/AppSpinner'
import { WithErrorHandler } from '../../../helpers/errorHandlers/WithErrorHandler'
import { formatAmount, formatPercent } from '../../../helpers/formatters/format'
import { useObservable } from '../../../helpers/observableHook'
import { useOutsideElementClickHandler } from '../../../helpers/useOutsideElementClickHandler'
import { zero } from '../../../helpers/zero'
import { useBreakpointIndex } from '../../../theme/useBreakpointIndex'
import { AssetAction, isUrlAction } from '../pipes/assetActions'
import { PositionView } from '../pipes/positionsOverviewSummary'

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
      {props.contentsUsd && (
        <Text
          variant="paragraph3"
          sx={{
            ml: '8px',
          }}
        >
          (${formatAmount(props.contentsUsd, 'USD')})
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
            close={() => {
              setMenuPosition(undefined)
            }}
            assetActions={props.actions}
          />
        )}
        <AssetRow {...props} />
      </Box>
    )
  }
}

function MenuRowDisplay(props: AssetAction) {
  return (
    <Flex sx={{ color: 'black', alignItems: 'center' }}>
      <Icon name={props.icon} sx={{ mr: '15px' }} />
      <Text variant="paragraph2" sx={{ color: 'black' }}>
        {props.text}
      </Text>
    </Flex>
  )
}

function MenuRow(props: AssetAction & { close: () => void }) {
  if (isUrlAction(props)) {
    return (
      <Link href={props.url}>
        <MenuRowDisplay {...props} />
      </Link>
    )
  } else {
    return (
      <Link
        onClick={(e) => {
          e.stopPropagation() // prevent menu from opening again
          props.close()
          props.onClick()
        }}
      >
        <MenuRowDisplay {...props} />
      </Link>
    )
  }
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
          <MenuRow {...aa} key={aa.text} close={props.close} />
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
                    <LinkedRow key={row.token + row.title} {...row} />
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
