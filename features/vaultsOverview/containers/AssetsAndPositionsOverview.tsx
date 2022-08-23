import { Icon } from '@makerdao/dai-ui-icons'
import { SystemStyleObject } from '@styled-system/css'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { getAddress } from 'ethers/lib/utils'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { Trans, useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { Box, Card, Flex, Grid, Heading, Link, SxStyleProp, Text } from 'theme-ui'

import { getToken } from '../../../blockchain/tokensMetadata'
import { PieChart } from '../../../components/dumb/PieChart'
import { AppLink } from '../../../components/Links'
import { formatAmount, formatPercent } from '../../../helpers/formatters/format'
import { useOutsideElementClickHandler } from '../../../helpers/useOutsideElementClickHandler'
import { zero } from '../../../helpers/zero'
import { useBreakpointIndex } from '../../../theme/useBreakpointIndex'
import { AssetAction, isUrlAction } from '../pipes/assetActions'
import { PositionView, TopAssetsAndPositionsViewModal } from '../pipes/positionsOverviewSummary'

function tokenColor(symbol: string) {
  return getToken(symbol)?.color || '#999'
}

function AssetRow(props: PositionView) {
  if (props.missingPriceData) {
    return (
      <Flex
        sx={{
          alignItems: 'center',
          color: 'neutral60',
          cursor: 'pointer',
          pt: '11px',
          pb: '11px',
          pl: '12px',
          pr: '14px',
          borderRadius: '12px',
        }}
        title={`${props.title}  |  We were unable to fetch the price data for this token`}
      >
        <Icon
          name={getToken(props.token).iconCircle}
          size="32px"
          sx={{ verticalAlign: 'sub', flexShrink: 0 }}
        />
        <Text
          variant="paragraph2"
          sx={{
            fontWeight: 'semiBold',
            ml: '8px',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
        >
          {props.title}
        </Text>
        <Text
          variant="paragraph3"
          sx={{
            ml: '8px',
          }}
        >
          {`No price data`}
        </Text>
      </Flex>
    )
  }

  return (
    <Flex
      sx={{
        alignItems: 'center',
        color: 'neutral60',
        '&:hover': {
          backgroundColor: 'neutral30',
        },
        cursor: 'pointer',
        pt: '11px',
        pb: '11px',
        pl: '12px',
        pr: '14px',
        borderRadius: '12px',
      }}
      title={`${props.title}  |  ${props.proportion && formatPercent(props.proportion)}  |  $${
        props.contentsUsd && formatAmount(props.contentsUsd, 'USD')
      }`}
    >
      <Icon
        name={getToken(props.token).iconCircle}
        size="32px"
        sx={{ verticalAlign: 'sub', flexShrink: 0 }}
      />
      <Text
        variant="paragraph2"
        sx={{
          fontWeight: 'semiBold',
          ml: '8px',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
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
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
        >
          (${formatAmount(props.contentsUsd, 'USD')})
        </Text>
      )}
      {props.actions && <Icon name="dots_v" sx={{ fill: '#708390', ml: 'auto', flexShrink: 0 }} />}
      {props.url && <Icon name="arrow_right" sx={{ fill: '#708390', ml: 'auto', flexShrink: 0 }} />}
    </Flex>
  )
}

function LinkedRow(props: PositionView) {
  const [menuPosition, setMenuPosition] = useState<SxStyleProp | undefined>(undefined)

  if (props.url) {
    return (
      <AppLink href={props.url} sx={{ fontWeight: 'unset' }}>
        <AssetRow {...props} />
      </AppLink>
    )
  } else if (props.missingPriceData) {
    return <AssetRow {...props} />
  } else {
    return (
      <Box
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          setMenuPosition({
            right: `${window.innerWidth - rect.right - 20}px`,
            top: `${window.scrollY + rect.top}px`,
          })
        }}
      >
        {menuPosition &&
          props.actions &&
          ReactDOM.createPortal(
            <Menu
              sx={menuPosition}
              close={() => {
                setMenuPosition(undefined)
              }}
              assetActions={props.actions}
            />,
            document.body,
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
      <AppLink href={props.path} hash={props.hash} sx={{ fontWeight: 'unset' }}>
        <MenuRowDisplay {...props} />
      </AppLink>
    )
  } else {
    return (
      <Link
        onClick={(e) => {
          e.stopPropagation() // prevent menu from opening again
          props.close()
          props.onClick()
        }}
        sx={{ fontWeight: 'unset' }}
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
        backgroundColor: 'neutral10',
        borderRadius: '12px',
        border: 'none',
        padding: '24px',
        zIndex: 10,
        ...props.sx,
      }}
    >
      <Grid columns={1} gap={20}>
        {props.assetActions.map((aa, index) => (
          <MenuRow {...aa} key={`${index}-${aa.text}`} close={props.close} />
        ))}
      </Grid>
    </Card>
  )
}

function TotalAssetsContent(props: { totalValueUsd: BigNumber }) {
  const { t } = useTranslation()
  return (
    <Box sx={{ mb: 4 }}>
      <Text
        variant="paragraph2"
        sx={{
          fontWeight: 'semiBold',
        }}
      >
        {t('vaults-overview.total-assets')}
      </Text>
      <Text variant="paragraph2" sx={{ color: 'neutral80', mt: '7px' }}>
        <Trans
          i18nKey="vaults-overview.total-assets-subheader"
          components={[
            <AppLink
              href="https://kb.oasis.app/help/curated-token-list"
              target="_blank"
              sx={{ fontWeight: 'regular', fontSize: 3 }}
            />,
          ]}
        />
      </Text>
      <Heading variant="header3" sx={{ mt: '4px' }}>
        ${formatAmount(props.totalValueUsd, 'USD')}
      </Heading>
    </Box>
  )
}

function AssetsAndPositionsView(props: TopAssetsAndPositionsViewModal) {
  const { t } = useTranslation()
  const breakpointIndex = useBreakpointIndex()
  const topAssetsAndPositions = props.assetsAndPositions.slice(0, 5)
  const pieSlices = [
    ...topAssetsAndPositions.map((ap) => ({
      value: ap.proportion || zero,
      color: tokenColor(ap.token),
    })),
    { value: props.percentageOther, color: '#999' },
  ]

  if (props.totalValueUsd.lte(zero)) {
    return null
  }

  return (
    <>
      {breakpointIndex === 0 && <TotalAssetsContent totalValueUsd={props.totalValueUsd} />}
      <Card variant="positionsPage">
        <Flex sx={{ justifyContent: 'space-between', alignContent: 'stretch' }}>
          {breakpointIndex !== 0 && (
            <>
              <TotalAssetsContent totalValueUsd={props.totalValueUsd} />
              <Box
                sx={{
                  borderLeft: 'solid 1px',
                  borderLeftColor: 'neutral20',
                  ml: '45px',
                  mr: '45px',
                }}
              />
            </>
          )}
          <Box sx={{ flexGrow: 1 }}>
            <Text
              variant="paragraph2"
              sx={{
                fontWeight: 'semiBold',
              }}
            >
              {t('vaults-overview.assets-and-positions', { number: topAssetsAndPositions.length })}
            </Text>
            <Flex sx={{ mt: '36px', justifyContent: 'space-between', alignContent: 'stretch' }}>
              {breakpointIndex !== 0 && <PieChart items={pieSlices} />}

              <Box sx={{ flex: 1, ml: [null, '53px'] }}>
                {topAssetsAndPositions.map((row, index) => (
                  <LinkedRow key={`${index}-${row.token}`} {...row} />
                ))}
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Card>
    </>
  )
}

export function AssetsAndPositionsOverview({ address }: { address: string }) {
  const { positionsOverviewSummary$ } = useAppContext()
  const checksumAddress = getAddress(address.toLocaleLowerCase())

  const [positionsOverviewSummary, positionOverviewSummaryError] = useObservable(
    positionsOverviewSummary$(checksumAddress),
  )

  return (
    <WithErrorHandler error={[positionOverviewSummaryError]}>
      <WithLoadingIndicator value={[positionsOverviewSummary]}>
        {([_positionsOverviewSummary]) => <AssetsAndPositionsView {..._positionsOverviewSummary} />}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
