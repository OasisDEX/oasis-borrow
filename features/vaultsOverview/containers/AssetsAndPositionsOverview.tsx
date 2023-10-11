import { Icon } from '@makerdao/dai-ui-icons'
import type { SystemStyleObject } from '@styled-system/css'
import BigNumber from 'bignumber.js'
import { PieChart } from 'components/dumb/PieChart'
import { AppLink } from 'components/Links'
import { getAddress } from 'ethers/lib/utils'
import { AssetsAndPositionsOverviewLoadingState } from 'features/vaultsOverview/components/AssetsAndPositionsOverviewLoadingState'
import { type AssetAction, isUrlAction } from 'features/vaultsOverview/pipes/assetActions'
import type { AssetView } from 'features/vaultsOverview/pipes/positionsOverviewSummary'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import { zero } from 'helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import ethereumMainnetIcon from 'public/static/img/network_icons/ethereum_mainnet.svg'
import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import type { SxStyleProp } from 'theme-ui'
import { Box, Card, Flex, Grid, Heading, Image, Link, Text } from 'theme-ui'
import { useBreakpointIndex } from 'theme/useBreakpointIndex'

import type { PortfolioBalanceApi } from './usePortfolioBalanceApi'
import { usePortfolioBalanceApi } from './usePortfolioBalanceApi'

function AssetRow({ name: title, proportion, value, actions, url, logo_url: imageSrc }: AssetView) {
  const contentsUsd = new BigNumber(value)

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
      title={`${title}  |  ${proportion && formatPercent(proportion, { precision: 1 })}  |  $${
        contentsUsd && formatAmount(contentsUsd, 'USD')
      }`}
    >
      <Image
        src={imageSrc}
        alt={title}
        sx={{ verticalAlign: 'sub', flexShrink: 0, width: 32, height: 32, borderRadius: '50%' }}
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
        {title}
      </Text>
      {proportion && (
        <Text
          variant="paragraph3"
          sx={{
            ml: '8px',
          }}
        >
          {formatPercent(proportion, { precision: 1 })}
        </Text>
      )}
      {contentsUsd && (
        <Text
          variant="paragraph3"
          sx={{
            ml: '8px',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
        >
          (${formatAmount(contentsUsd, 'USD')})
        </Text>
      )}
      {actions && <Icon name="dots_v" sx={{ fill: '#708390', ml: 'auto', flexShrink: 0 }} />}
      {url && <Icon name="arrow_right" sx={{ fill: '#708390', ml: 'auto', flexShrink: 0 }} />}
    </Flex>
  )
}

function LinkedRow(props: AssetView) {
  const [menuPosition, setMenuPosition] = useState<SxStyleProp | undefined>(undefined)
  const { actions, url } = props

  if (url) {
    return (
      <AppLink href={url} sx={{ fontWeight: 'unset' }}>
        <AssetRow {...props} />
      </AppLink>
    )
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
          actions &&
          ReactDOM.createPortal(
            <Menu
              sx={menuPosition}
              close={() => {
                setMenuPosition(undefined)
              }}
              assetActions={actions}
            />,
            document.body,
          )}
        <AssetRow {...props} />
      </Box>
    )
  }
}

function MenuRowDisplay({ icon, text }: AssetAction) {
  return (
    <Flex sx={{ color: 'black', alignItems: 'center' }}>
      <Icon name={icon} sx={{ mr: '15px' }} />
      <Text variant="paragraph2" sx={{ color: 'black' }}>
        {text}
      </Text>
    </Flex>
  )
}

function MenuRow(props: AssetAction & { close: () => void }) {
  if (isUrlAction(props)) {
    const { path, hash } = props
    return (
      <AppLink href={path} hash={hash} sx={{ fontWeight: 'unset' }}>
        <MenuRowDisplay {...props} />
      </AppLink>
    )
  } else {
    const { onClick } = props

    return (
      <Link
        onClick={(e) => {
          e.stopPropagation() // prevent menu from opening again
          close()
          onClick()
        }}
        sx={{ fontWeight: 'unset' }}
      >
        <MenuRowDisplay {...props} />
      </Link>
    )
  }
}

function Menu({
  close,
  sx,
  assetActions,
}: {
  close: () => void
  sx?: SystemStyleObject
  assetActions: Array<AssetAction>
}) {
  const componentRef = useOutsideElementClickHandler(close)
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
        ...sx,
      }}
    >
      <Grid columns={1} gap={20}>
        {assetActions.map((action) => (
          <MenuRow {...action} key={`${action.text}`} close={close} />
        ))}
      </Grid>
    </Card>
  )
}

function TotalAssetsContent({ totalValueUsd }: { totalValueUsd: BigNumber }) {
  const { t } = useTranslation()
  return (
    <Box sx={{ mr: [0, '96px'] }}>
      <Text
        variant="paragraph2"
        sx={{
          fontWeight: 'semiBold',
        }}
      >
        {t('vaults-overview.total-assets')}
      </Text>
      <Text variant="paragraph2" sx={{ color: 'neutral80', mt: '7px' }}>
        <Trans i18nKey="vaults-overview.total-assets-subheader">
          <AppLink
            href={EXTERNAL_LINKS.KB.CURATED_TOKEN_LIST}
            internalInNewTab={true}
            sx={{ fontWeight: 'regular', fontSize: 3 }}
          />
        </Trans>
      </Text>
      <Heading variant="header3" sx={{ mt: '4px' }}>
        ${formatAmount(totalValueUsd, 'USD')}
      </Heading>
    </Box>
  )
}

function AssetsAndPositionsView({ portfolioBalance }: { portfolioBalance: PortfolioBalanceApi }) {
  const { t } = useTranslation()
  const breakpointIndex = useBreakpointIndex()

  const { protocolAssets, totalAssetsUsdValue, walletAssetsUsdValue } = portfolioBalance

  const topAssets = protocolAssets.slice(0, 5)

  const assetList: AssetView[] = [
    {
      id: 'wallet-balance',
      value: walletAssetsUsdValue,
      proportion: new BigNumber(walletAssetsUsdValue).div(totalAssetsUsdValue).multipliedBy(100),
      name: `Wallet balance`,
      logo_url: ethereumMainnetIcon,
    },
    ...topAssets.map((asset) => ({
      value: asset.net_usd_value || 0,
      proportion: new BigNumber(asset.net_usd_value).div(totalAssetsUsdValue).multipliedBy(100),
      ...asset,
    })),
  ]

  const totalValueUsd = new BigNumber(totalAssetsUsdValue)

  return (
    <>
      {breakpointIndex === 0 && <TotalAssetsContent totalValueUsd={totalValueUsd} />}
      <Box
        sx={{
          p: 4,
          border: '1px solid',
          borderColor: 'neutral20',
          borderRadius: 'large',
          bg: 'neutral10',
        }}
      >
        <Grid gap={0} sx={{ gridTemplateColumns: ['100%', '40% 60%'] }}>
          {breakpointIndex !== 0 && <TotalAssetsContent totalValueUsd={totalValueUsd} />}
          <Box sx={{ flexGrow: 1 }}>
            <Text
              variant="paragraph2"
              sx={{
                fontWeight: 'semiBold',
              }}
            >
              {t('vaults-overview.assets-and-positions', {
                number: assetList.length || '',
              })}
            </Text>
            {totalValueUsd.gt(zero) ? (
              <Flex sx={{ mt: 4, justifyContent: 'space-between', alignContent: 'stretch' }}>
                {breakpointIndex !== 0 && <PieChart items={assetList} />}
                <Box sx={{ flex: 1, ml: [null, '48px'] }}>
                  {assetList.map((asset) => (
                    <LinkedRow key={`${asset.name}`} {...asset} />
                  ))}
                </Box>
              </Flex>
            ) : (
              <Flex
                sx={{
                  flexDirection: 'column',
                  alignItems: ['flex-start', 'center'],
                  py: 5,
                  textAlign: ['left', 'center'],
                }}
              >
                <Image
                  src={staticFilesRuntimeUrl('/static/img/no-assets.svg')}
                  sx={{ alignSelf: 'center' }}
                />
                <Text as="p" variant="paragraph3" sx={{ mt: 3, color: 'neutral80' }}>
                  {t('vaults-overview.no-assets')}
                </Text>
              </Flex>
            )}
          </Box>
        </Grid>
      </Box>
    </>
  )
}

export function AssetsAndPositionsOverview({ address }: { address: string }) {
  const checksumAddress = getAddress(address.toLocaleLowerCase())
  const [portfolioBalance, portfolioBalanceError] = usePortfolioBalanceApi(checksumAddress)

  return (
    <WithErrorHandler error={[portfolioBalanceError]}>
      <WithLoadingIndicator
        value={[portfolioBalance]}
        customLoader={<AssetsAndPositionsOverviewLoadingState />}
      >
        {([_portfolioBalance]) => <AssetsAndPositionsView portfolioBalance={_portfolioBalance} />}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
