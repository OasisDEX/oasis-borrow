import { Box, Card, Flex, Grid, Text } from 'theme-ui'
import { PieChart } from '../../../components/dumb/PieChart'
import BigNumber from 'bignumber.js'
import React from 'react'
import { getToken, tokens } from '../../../blockchain/tokensMetadata'
import { Icon } from '@makerdao/dai-ui-icons'
import { useBreakpointIndex } from '../../../theme/useBreakpointIndex'
import { useAppContext } from '../../../components/AppContextProvider'
import { useObservable } from '../../../helpers/observableHook'
import { Asset } from '../pipes/positionsOverviewSummary'
import { WithLoadingIndicator } from '../../../helpers/AppSpinner'
import { formatAmount, formatPercent } from '../../../helpers/formatters/format'
import { WithErrorHandler } from '../../../helpers/errorHandlers/WithErrorHandler'
import { zero } from '../../../helpers/zero'

function tokenColor(symbol: string) {
  return getToken(symbol)?.color || '#999'
}

function AssetRow(props: Asset) {
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
        {props.token}
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
      {props.valueUSD && (
        <Text
          variant="paragraph3"
          sx={{
            ml: '8px',
          }}
        >
          (${formatAmount(props.valueUSD, 'USD')})
        </Text>
      )}
      <Icon name="dots_v" sx={{ fill: '#708390', ml: 'auto' }} />
    </Flex>
  )
}

export function AssetsAndPositionsOverview() {
  const breakpointIndex = useBreakpointIndex()
  const { positionsOverviewSummary$ } = useAppContext()
  const [positionsOverviewSummary, err] = useObservable(
    positionsOverviewSummary$('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'),
  )
  // console.log(positionsOverviewSummary)
  // console.log(err)
  return (
    <WithErrorHandler error={err}>
      <WithLoadingIndicator value={positionsOverviewSummary}>
        {(positionsOverviewSummary) => {
          const top5AssetsAndPositions = positionsOverviewSummary.assetsAndPositions.slice(0, 5)
          console.log(
            `positionsOverviewSummary.percentageOther ${positionsOverviewSummary.percentageOther}`,
          )
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
                    <AssetRow key={row.token} {...row} />
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
