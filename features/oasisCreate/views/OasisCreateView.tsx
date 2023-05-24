import { getToken } from 'blockchain/tokensMetadata'
import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { AssetsFiltersContainer } from 'components/assetsTable/AssetsFiltersContainer'
import { AssetsResponsiveTable } from 'components/assetsTable/AssetsResponsiveTable'
import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import { AssetsTableNoResults } from 'components/assetsTable/AssetsTableNoResults'
import { GenericMultiselect } from 'components/GenericMultiselect'
import { AppLink } from 'components/Links'
import { PromoCard } from 'components/PromoCard'
import { WithArrow } from 'components/WithArrow'
import { NaturalLanguageSelectorController } from 'features/oasisCreate/controls/NaturalLanguageSelectorController'
import { matchRowsByFilters } from 'features/oasisCreate/helpers/matchRowsByFilters'
import { matchRowsByNL } from 'features/oasisCreate/helpers/matchRowsByNL'
import { parseRows } from 'features/oasisCreate/helpers/parseRows'
import {
  ALL_ASSETS,
  EMPTY_FILTERS,
  oasisCreateFiltersCount,
  oasisCreateGridTemplateColumns,
  oasisCreateLinksMap,
  oasisCreateNetworkFilter,
  oasisCreateProtocolFilter,
  oasisCreateStrategyFilter,
} from 'features/oasisCreate/meta'
import {
  OasisCreateFilters,
  OasisCreateMultiplyStrategyType,
  ProductType,
} from 'features/oasisCreate/types'
import { oasisCreateData } from 'helpers/mocks/oasisCreateData.mock'
import { BaseNetworkNames } from 'helpers/networkNames'
import { LendingProtocol } from 'lendingProtocols'
import { uniq } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { useMemo, useState } from 'react'
import { theme } from 'theme'
import { Box, Grid, Text } from 'theme-ui'
import { useMediaQuery } from 'usehooks-ts'

interface OasisCreateViewProps {
  product: ProductType
  token?: string
}

export function OasisCreateView({ product, token }: OasisCreateViewProps) {
  const { t } = useTranslation()
  const isSmallerScreen = useMediaQuery(`(max-width: ${theme.breakpoints[2]})`)
  const [selectedProduct, setSelectedProduct] = useState<ProductType>(product)
  const [selectedToken, setSelectedToken] = useState<string>(token || ALL_ASSETS)
  const [selectedFilters, setSelectedFilters] = useState<OasisCreateFilters>(EMPTY_FILTERS)

  const promoCards = useMemo(
    () =>
      Object.keys(oasisCreateData.promoCards[selectedProduct].tokens).includes(selectedToken)
        ? oasisCreateData.promoCards[selectedProduct].tokens[selectedToken]
        : oasisCreateData.promoCards[selectedProduct].default,
    [selectedProduct, selectedToken],
  )
  const rowsMatchedByNL = useMemo(
    () => matchRowsByNL(oasisCreateData.table, selectedProduct, selectedToken),
    [selectedProduct, selectedToken],
  )
  const rowsMatchedByFilters = useMemo(
    () => matchRowsByFilters(rowsMatchedByNL, selectedFilters),
    [rowsMatchedByNL, selectedFilters],
  )
  const parsedRows = useMemo(
    () => parseRows(rowsMatchedByFilters, selectedProduct),
    [rowsMatchedByFilters, selectedProduct],
  )
  const debtTokens = useMemo(
    () =>
      uniq(rowsMatchedByNL.map((item) => item.secondaryToken)).map((item) => ({
        label: item,
        value: item,
        icon: getToken(item).iconCircle,
      })),
    [rowsMatchedByNL],
  )
  const secondaryTokens = useMemo(
    () =>
      uniq(
        rowsMatchedByNL.flatMap((item) => [
          ...([ALL_ASSETS, item.primaryToken, item.primaryTokenGroup].includes(selectedToken)
            ? [item.secondaryToken]
            : []),
          ...([ALL_ASSETS, item.secondaryToken, item.secondaryTokenGroup].includes(selectedToken)
            ? [item.primaryToken]
            : []),
        ]),
      ).map((item) => ({
        label: item,
        value: item,
        icon: getToken(item).iconCircle,
      })),
    [rowsMatchedByNL, selectedToken],
  )

  return (
    <AnimatedWrapper sx={{ mb: 5 }}>
      <Box
        sx={{
          position: 'relative',
          my: [3, null, '48px'],
          textAlign: 'center',
          zIndex: 3,
        }}
      >
        <NaturalLanguageSelectorController
          product={product}
          token={token}
          url="/oasis-create/"
          onChange={(_selectedProduct, _selectedToken) => {
            setSelectedProduct(_selectedProduct)
            setSelectedToken(_selectedToken)
            setSelectedFilters(EMPTY_FILTERS)
          }}
        />
        <Text
          as="p"
          variant="paragraph2"
          sx={{
            mx: 'auto',
            mt: '24px',
          }}
        >
          {t(`oasis-create.intro.${selectedProduct}`)}{' '}
          <AppLink href={oasisCreateLinksMap[selectedProduct]}>
            <WithArrow
              variant="paragraph2"
              sx={{
                display: 'inline-block',
                fontSize: 3,
                color: 'interactive100',
                fontWeight: 'regular',
              }}
            >
              Oasis.app {t(`nav.${selectedProduct}`)}
            </WithArrow>
          </AppLink>
        </Text>
      </Box>
      <Grid columns={[1, null, 2, 3]} gap={3} sx={{ mb: 4 }}>
        {promoCards.map((promoCard, i) => (
          <PromoCard key={`${selectedProduct}-${i}`} {...promoCard} />
        ))}
      </Grid>
      <AssetsTableContainer>
        <AssetsFiltersContainer
          key={`${selectedProduct}-${selectedToken}`}
          gridTemplateColumns={[
            '100%',
            null,
            `repeat(${oasisCreateFiltersCount[selectedProduct]}, 1fr)`,
            oasisCreateGridTemplateColumns[selectedProduct],
          ]}
        >
          {selectedProduct === ProductType.Borrow && (
            <GenericMultiselect
              label={t('oasis-create.filters.debt-tokens')}
              options={debtTokens}
              onChange={(value) => {
                setSelectedFilters({
                  or: selectedFilters.or,
                  and: { ...selectedFilters.and, secondaryToken: value },
                })
              }}
            />
          )}
          {selectedProduct === ProductType.Multiply && (
            <GenericMultiselect
              label={t('oasis-create.filters.secondary-tokens')}
              options={secondaryTokens}
              onChange={(value) => {
                setSelectedFilters({
                  or:
                    selectedToken === ALL_ASSETS
                      ? [{ primaryToken: value }, { secondaryToken: value }]
                      : [
                          { primaryTokenGroup: [selectedToken], secondaryToken: value },
                          { primaryToken: [selectedToken], secondaryToken: value },
                          { primaryToken: value, secondaryToken: [selectedToken] },
                          { primaryToken: value, secondaryTokenGroup: [selectedToken] },
                        ],
                  and: selectedFilters.and,
                })
              }}
            />
          )}
          {!isSmallerScreen && <Box />}
          {selectedProduct === ProductType.Multiply && (
            <GenericMultiselect
              label={t('oasis-create.filters.strategies')}
              options={oasisCreateStrategyFilter}
              onChange={(value) => {
                setSelectedFilters({
                  or: selectedFilters.or,
                  and: {
                    ...selectedFilters.and,
                    multiplyStrategyType: value as OasisCreateMultiplyStrategyType[],
                  },
                })
              }}
            />
          )}
          <GenericMultiselect
            label={t('oasis-create.filters.networks')}
            options={oasisCreateNetworkFilter}
            onChange={(value) => {
              setSelectedFilters({
                or: selectedFilters.or,
                and: { ...selectedFilters.and, network: value as unknown as BaseNetworkNames[] },
              })
            }}
          />
          <GenericMultiselect
            label={t('oasis-create.filters.protocols')}
            options={oasisCreateProtocolFilter}
            onChange={(value) => {
              setSelectedFilters({
                or: selectedFilters.or,
                and: { ...selectedFilters.and, protocol: value as LendingProtocol[] },
              })
            }}
          />
        </AssetsFiltersContainer>
        {parsedRows.length > 0 ? (
          <AssetsResponsiveTable
            rows={parsedRows}
            headerTranslationProps={{
              ...(selectedToken && { token: selectedToken === ALL_ASSETS ? 'ETH' : selectedToken }),
            }}
          />
        ) : (
          <AssetsTableNoResults
            // TODO replace with translations when copy is available
            header="There are no items matching your filters"
            content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean iaculis lorem in feugiat mattis."
          />
        )}
      </AssetsTableContainer>
    </AnimatedWrapper>
  )
}
