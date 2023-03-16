import { getToken } from 'blockchain/tokensMetadata'
import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { useAppContext } from 'components/AppContextProvider'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { HeaderSelector, HeaderSelectorOption } from 'components/HeaderSelector'
import { AppLink } from 'components/Links'
import { AjnaHeader } from 'features/ajna/common/components/AjnaHeader'
import { ajnaComingSoonPools, DEFAULT_SELECTED_TOKEN } from 'features/ajna/common/consts'
import { ajnaPoolDummyData } from 'features/ajna/common/content'
import { filterPoolData } from 'features/ajna/common/helpers/filterPoolData'
import { AjnaWrapper } from 'features/ajna/common/layout'
import { AjnaProduct } from 'features/ajna/common/types'
import { DiscoverResponsiveTable } from 'features/discover/common/DiscoverResponsiveTable'
import { DiscoverTableContainer } from 'features/discover/common/DiscoverTableContainer'
import {
  DiscoverTableDataCellAsset,
  DiscoverTableDataCellInactive,
  DiscoverTableDataCellProtocol,
} from 'features/discover/common/DiscoverTableDataCellComponents'
import { DiscoverTableRowData } from 'features/discover/types'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { useObservable } from 'helpers/observableHook'
import { useHash } from 'helpers/useHash'
import { uniq } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button } from 'theme-ui'

interface AjnaSelectorControllerProps {
  product: AjnaProduct
}

export function AjnaSelectorController({ product }: AjnaSelectorControllerProps) {
  const { t } = useTranslation()
  const { context$ } = useAppContext()
  const [context] = useObservable(context$)
  const [hash] = useHash()
  const ref = useRef<HTMLDivElement>(null)
  const isEarnProduct = product === 'earn'
  const options = useMemo(
    () =>
      uniq(
        [...(context ? Object.keys(context.ajnaPoolPairs) : []), ...ajnaComingSoonPools].map(
          (pool) => pool.split('-')[isEarnProduct ? 1 : 0],
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
            .filter((pool) => pool[isEarnProduct ? 1 : 0] === selected.value)
            .map((pool) => {
              const token = pool[isEarnProduct ? 0 : 1]
              const pair = pool.join('-')

              return {
                asset: <DiscoverTableDataCellAsset asset={token} icons={[token]} />,
                ...filterPoolData({
                  data: ajnaPoolDummyData,
                  pair,
                  product,
                }),
                protocol: <DiscoverTableDataCellProtocol protocol="Ajna" />,
                action: (
                  <AppLink href={`/ajna/${product}/${pair}`}>
                    <Button className="discover-action" variant="tertiary">
                      {t(`nav.${product}`)}
                    </Button>
                  </AppLink>
                ),
              }
            })
        : []),
      ...ajnaComingSoonPools
        .filter((pool) => !Object.keys(context?.ajnaPoolPairs || []).includes(pool))
        .map((pool) => pool.split('-'))
        .filter((pool) => pool[isEarnProduct ? 1 : 0] === selected.value)
        .map((pool) => {
          const token = pool[isEarnProduct ? 0 : 1]
          const pair = pool.join('-')

          return {
            asset: (
              <DiscoverTableDataCellInactive>
                <DiscoverTableDataCellAsset
                  asset={token}
                  icons={[token]}
                  inactive={`(${t('coming-soon')})`}
                />
              </DiscoverTableDataCellInactive>
            ),
            ...filterPoolData({
              data: ajnaPoolDummyData,
              pair,
              product,
            }),
            protocol: (
              <DiscoverTableDataCellInactive>
                <DiscoverTableDataCellProtocol protocol="Ajna" />
              </DiscoverTableDataCellInactive>
            ),
            action: (
              <Button className="discover-action" variant="tertiary" disabled={true}>
                {t('coming-soon')}
              </Button>
            ),
          }
        }),
    ])
  }, [selected, context?.ajnaPoolPairs])

  return (
    <WithConnection>
      <WithTermsOfService>
        <AjnaWrapper>
          <AnimatedWrapper>
            <AjnaHeader
              title={
                <Box ref={ref} sx={{ position: 'relative', mb: 3, zIndex: 2 }}>
                  {t(`ajna.${product}.open.select.heading.pre`)}
                  <HeaderSelector
                    defaultOption={defaultOption}
                    gradient={['#f154db', '#974eea']}
                    options={options}
                    parentRef={ref}
                    onChange={setSelected}
                  />
                  {t(`ajna.${product}.open.select.heading.post`)}
                </Box>
              }
              intro={t(`ajna.${product}.open.select.intro`, { token: selected.value })}
            />
            <DiscoverTableContainer tableOnly>
              {rows.length > 0 && <DiscoverResponsiveTable rows={rows} skip={['icon']} />}
            </DiscoverTableContainer>
          </AnimatedWrapper>
        </AjnaWrapper>
      </WithTermsOfService>
    </WithConnection>
  )
}
