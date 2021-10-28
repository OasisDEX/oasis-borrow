import { Icon } from '@makerdao/dai-ui-icons'
import { Pages } from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { tokens } from 'blockchain/tokensMetadata'
import { ROUTES } from 'components/Links'
import { CollateralCard } from 'features/landing/CollateralCard'
import { SearchInput } from 'features/landing/FiltersWithPopular'
import { useTranslation } from 'next-i18next'
import React from 'react'
import ReactSelect, { Props as SelectProps } from 'react-select'
import { Box, Card, Container, Flex, Grid, Heading } from 'theme-ui'

const ASSETS_TYPE_OPTIONS = ['all-assets', 'lp-tokens', 'stablecoins']

const ASSETS_SORT_OPTIONS = [
  'popularity_desc',
  'popularity_asc',
  'min_coll_ratio_desc',
  'min_coll_ratio_asc',
  'annual_fee_desc',
  'annual_fee_asc',
]

function AllAssetsSelect(
  props: Omit<SelectProps, 'options' | 'value'> & {
    options: string[]
    value: string
    dropdownKey: 'type-dropdown' | 'sort-dropdown'
  },
) {
  const { t } = useTranslation()

  const options = props.options.map((value) => ({
    value,
    label: t(`all-assets-page.${props.dropdownKey}.${value}`),
  }))

  return (
    <ReactSelect
      options={options}
      isSearchable={false}
      value={options.find(({ value }) => value === props.value)}
      onChange={(e) => console.log('change', e)}
      components={{
        IndicatorsContainer: ({ selectProps: { menuIsOpen } }) => (
          <Flex
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              mr: 3,
              transform: `rotate(${menuIsOpen ? '180deg' : 0})`,
              transition: 'transform 0.2s ease-in-out',
            }}
          >
            <Icon name="chevron_down" size="auto" width="14px" />
          </Flex>
        ),
        Control: ({ children, innerProps }) => (
          <Flex
            sx={{
              variant: 'forms.search',
              bg: 'surface',
              p: [3, 3, 3],
              position: 'relative',
              zIndex: 1,
              cursor: 'pointer',
              fontWeight: 'body',
            }}
            {...innerProps}
          >
            {children}
          </Flex>
        ),
        SingleValue: ({ children }) => (
          <Box
            sx={{
              whiteSpace: 'nowrap',
              ml: -1,
              maxWidth: '99%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {children}
          </Box>
        ),
        Menu: ({ innerProps, children }) => (
          <Card
            {...innerProps}
            sx={{
              position: 'absolute',
              borderRadius: 'mediumLarge',
              border: 'none',
              px: 2,
              py: 3,
              overflow: 'hidden',
              bottom: 0,
              transform: `translateY(calc(100% + 8px))`,
              boxShadow: 'vaultEditingController',
              left: 0,
              width: '100%',
              maxHeight: '356px',
            }}
          >
            {children}
          </Card>
        ),
        Option: ({ children, innerProps }) => (
          <Box
            {...innerProps}
            sx={{
              p: 3,
              fontSize: 2,
              cursor: 'pointer',
              '&:hover': {
                fontWeight: 'bold',
              },
            }}
          >
            {children}
          </Box>
        ),
      }}
    />
  )
}

// TO DO connect to pipeline with filters
function AllAssetsFilters() {
  const { t } = useTranslation()

  return (
    <Grid
      gap={[3, 1, 3]}
      columns={[1, 3, '1fr 305px 305px']}
      sx={{
        pt: 3,
        mb: 4,
        position: 'relative',
        zIndex: 2,
        maxWidth: ['343px', '100%'],
        mx: 'auto',
      }}
    >
      <SearchInput
        {...{
          onChange: (e) => console.log(e),
          search: '',
          searchPlaceholder: t('search-token'),
          page: Pages.AllAssets,
          sx: {
            bg: 'surface',
            ml: 0,
            width: '100%',
            mt: 0,
          },
        }}
      />
      <AllAssetsSelect
        options={ASSETS_TYPE_OPTIONS}
        value={ASSETS_TYPE_OPTIONS[0]}
        dropdownKey="type-dropdown"
      />
      <AllAssetsSelect
        options={ASSETS_SORT_OPTIONS}
        value={ASSETS_SORT_OPTIONS[2]}
        dropdownKey="sort-dropdown"
      />
    </Grid>
  )
}

// TO DO connect to pipeline with tokens
function AllAssetsCards() {
  const allCollateralsMock = tokens
    .filter((token) => token.background !== undefined)
    .filter((token) => !(token.tags as string[]).includes('lp-token'))
    .map((token) => ({
      token,
      ilks: [
        { liquidationPenalty: new BigNumber('0.1'), liquidationRatio: new BigNumber('1.45') },
        { liquidationPenalty: new BigNumber('0.2'), liquidationRatio: new BigNumber('1.3') },
      ] as IlkData[],
    }))

  return (
    <Box sx={{ pt: 3, pb: 5 }}>
      <Grid variant="collateralCardsContainer">
        {allCollateralsMock.map(({ token, ilks }) => (
          <CollateralCard
            key={token.symbol}
            title={token.symbol}
            background={token.background!}
            icon={token.bannerIconPng!}
            href={ROUTES.ASSET(token.symbol)}
            ilks={ilks}
          />
        ))}
      </Grid>
    </Box>
  )
}

export function AllAssetsView() {
  const { t } = useTranslation()

  return (
    <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
      <Heading as="h1" variant="header2" sx={{ textAlign: 'center', mt: 6, mb: 5 }}>
        {t('all-assets-page.title')}
      </Heading>
      <AllAssetsFilters />
      <AllAssetsCards />
    </Box>
  )
}
