import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { HeaderSelector, HeaderSelectorOption } from 'components/HeaderSelector'
import { AppLink } from 'components/Links'
import { ajnaComingSoonPools, DEFAULT_SELECTED_TOKEN } from 'features/ajna/common/consts'
import { ajnaPoolDummyData } from 'features/ajna/common/content'
import { filterPoolData } from 'features/ajna/common/helpers'
import { AjnaWrapper } from 'features/ajna/common/layout'
import { AjnaProduct } from 'features/ajna/common/types'
import { DiscoverResponsiveTable } from 'features/discover/common/DiscoverResponsiveTable'
import { DiscoverTableContainer } from 'features/discover/common/DiscoverTableContainer'
import {
  DiscoverTableDataCellAsset,
  DiscoverTableDataCellInactive,
  DiscoverTableDataCellProtocol,
} from 'features/discover/common/DiscoverTableDataCellContent'
import { DiscoverTableRowData } from 'features/discover/types'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { useObservable } from 'helpers/observableHook'
import { useHash } from 'helpers/useHash'
import { uniq } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, Heading, Text } from 'theme-ui'

interface AjnaSelectorControllerProps {
  product: AjnaProduct
}

export function AjnaSelectorController({ product }: AjnaSelectorControllerProps) {
  const { t } = useTranslation()
  const { context$ } = useAppContext()
  const [context] = useObservable(context$)
  const [hash] = useHash()
  const ref = useRef<HTMLDivElement>(null)
  const options = useMemo(
    () =>
      uniq(
        [...(context ? Object.keys(context.ajnaPoolPairs) : []), ...ajnaComingSoonPools].map(
          (pool) => pool.split('-')[0],
        ),
      )
        .sort()
        .map((token) => ({
          label: token,
          value: token,
          icon: getToken(token).iconCircle,
        })),
    [context?.ajnaPoolPairs],
  )
  const defaultOptionValue = hash.length ? hash.replace('#', '') : DEFAULT_SELECTED_TOKEN
  const defaultOption = options.filter((option) => option.value === defaultOptionValue)[0]
  const [selected, setSelected] = useState<HeaderSelectorOption>(defaultOption)
  // TODO: to be replaced with real data coming from observable
  const [rows, setRows] = useState<DiscoverTableRowData[]>([])

  useEffect(() => {
    setRows([
      ...(context
        ? Object.keys(context.ajnaPoolPairs)
            .map((pool) => pool.split('-'))
            .filter(([collateral]) => collateral === selected.value)
            .map(([, quote]) => ({
              asset: <DiscoverTableDataCellAsset asset={quote} icon={getToken(quote).iconCircle} />,
              ...filterPoolData({
                data: ajnaPoolDummyData,
                pair: `${selected.value}-${quote}`,
                product,
              }),
              protocol: (
                <DiscoverTableDataCellProtocol color={['#f154db', '#974eea']}>
                  Ajna
                </DiscoverTableDataCellProtocol>
              ),
              action: (
                <AppLink href={`/ajna/${product}/${selected.label}-${quote}`}>
                  <Button className="discover-action" variant="tertiary">
                    {t(`nav.${product}`)}
                  </Button>
                </AppLink>
              ),
            }))
        : []),
      ...ajnaComingSoonPools
        .filter((pool) => !Object.keys(context?.ajnaPoolPairs || []).includes(pool))
        .map((pool) => pool.split('-'))
        .filter(([collateral]) => collateral === selected.value)
        .map(([, quote]) => ({
          asset: (
            <DiscoverTableDataCellInactive>
              <DiscoverTableDataCellAsset
                asset={quote}
                icon={getToken(quote).iconCircle}
                inactive={`(${t('coming-soon')})`}
              />
            </DiscoverTableDataCellInactive>
          ),
          ...filterPoolData({
            data: ajnaPoolDummyData,
            pair: `${selected.value}-${quote}`,
            product,
          }),
          protocol: (
            <DiscoverTableDataCellInactive>
              <DiscoverTableDataCellProtocol color={['#f154db', '#974eea']}>
                Ajna
              </DiscoverTableDataCellProtocol>
            </DiscoverTableDataCellInactive>
          ),
          action: (
            <Button className="discover-action" variant="tertiary" disabled={true}>
              {t('coming-soon')}
            </Button>
          ),
        })),
    ])
  }, [selected, context?.ajnaPoolPairs])

  return (
    <WithConnection>
      <WithTermsOfService>
        <AjnaWrapper>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ mb: 5, textAlign: 'center' }}>
              <Heading ref={ref} variant="header2" sx={{ position: 'relative', mb: 3, zIndex: 2 }}>
                {t(`ajna.${product}.open.select.heading.pre`)}
                <HeaderSelector
                  defaultOption={defaultOption}
                  gradient={['#f154db', '#974eea']}
                  options={options}
                  parentRef={ref}
                  onChange={setSelected}
                />
                {t(`ajna.${product}.open.select.heading.post`)}
              </Heading>
              <Text variant="paragraph2" sx={{ color: 'neutral80', maxWidth: 700, mx: 'auto' }}>
                {t(`ajna.${product}.open.select.intro`, { token: selected.value })}
              </Text>
            </Box>
            <DiscoverTableContainer tableOnly>
              {rows.length > 0 && <DiscoverResponsiveTable rows={rows} skip={['icon']} />}
            </DiscoverTableContainer>
          </Box>
        </AjnaWrapper>
      </WithTermsOfService>
    </WithConnection>
  )
}
