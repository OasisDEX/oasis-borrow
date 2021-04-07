import { keyframes } from '@emotion/core'
import { Icon } from '@makerdao/dai-ui-icons'
import { CoinTag, getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { ColumnDef, Table, TableSortHeader } from 'components/Table'
import { IlksFilterState } from 'features/ilks/ilksFilters'
import { IlkWithBalance } from 'features/ilks/ilksWithBalances'
import { Filters } from 'features/vaultsOverview/Filters'
import { FeaturedIlks, FeaturedIlksPlaceholder } from 'features/vaultsOverview/VaultsOverviewView'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useObservableWithError } from 'helpers/observableHook'
import { Trans, useTranslation } from 'next-i18next'
import React, { ComponentProps, useCallback, useEffect, useRef, useState } from 'react'
import { Box, Button, Flex, Grid, Heading, Image, SxProps, Text } from 'theme-ui'

const slideIn = keyframes({
  from: {
    top: '60px',
    opacity: 0,
  },
  to: {
    top: 0,
    opacity: 1,
  },
})

const fadeIn = keyframes({
  from: {
    opacity: 0,
  },
  to: {
    opacity: 1,
  },
})

export function TokenSymbol({
  token,
  ...props
}: { token: string } & Omit<ComponentProps<typeof Icon>, 'name'>) {
  const tokenInfo = getToken(token)

  return (
    <Flex>
      <Icon
        name={tokenInfo.iconCircle}
        size="26px"
        sx={{ verticalAlign: 'sub', mr: 2 }}
        {...props}
      />
      <Text variant="paragraph2" sx={{ fontWeight: 'semiBold', whiteSpace: 'nowrap' }}>
        {tokenInfo.name}
      </Text>
    </Flex>
  )
}

const ilksColumns: ColumnDef<IlkWithBalance, IlksFilterState>[] = [
  {
    headerLabel: 'system.asset',
    header: ({ label }) => <Text variant="tableHead">{label}</Text>,
    cell: ({ token }) => <TokenSymbol token={token} />,
  },
  {
    headerLabel: 'system.type',
    header: ({ label }) => <Text variant="tableHead">{label}</Text>,
    cell: ({ ilk }) => <Text>{ilk}</Text>,
  },
  {
    headerLabel: 'system.dai-available',
    header: ({ label, ...filters }) => (
      <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="ilkDebtAvailable">
        {label}
      </TableSortHeader>
    ),
    cell: ({ ilkDebtAvailable }) => (
      <Text sx={{ textAlign: 'right' }}>{formatCryptoBalance(ilkDebtAvailable)}</Text>
    ),
  },
  {
    headerLabel: 'system.stability-fee',
    header: ({ label, ...filters }) => (
      <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="stabilityFee">
        {label}
      </TableSortHeader>
    ),
    cell: ({ stabilityFee }) => (
      <Text sx={{ textAlign: 'right' }}>{formatPercent(stabilityFee.times(100))}</Text>
    ),
  },
  {
    headerLabel: 'system.min-coll-ratio',
    header: ({ label, ...filters }) => (
      <TableSortHeader sx={{ ml: 'auto' }} filters={filters} sortBy="liquidationRatio">
        {label}
      </TableSortHeader>
    ),
    cell: ({ liquidationRatio }) => (
      <Text sx={{ textAlign: 'right' }}>{formatPercent(liquidationRatio.times(100))}</Text>
    ),
  },
  {
    headerLabel: '',
    header: () => null,
    cell: ({ ilk }) => (
      <Box sx={{ flexGrow: 1, textAlign: 'right' }}>
        <AppLink
          sx={{ width: ['100%', 'inherit'], textAlign: 'center' }}
          variant="secondary"
          href={`/vaults/open/${ilk}`}
        >
          <Trans i18nKey="open-vault" />
        </AppLink>
      </Box>
    ),
  },
]

export function Hero({ sx }: { sx?: SxProps }) {
  const { t } = useTranslation()

  return (
    <Flex
      sx={{
        ...sx,
        justifySelf: 'center',
        alignItems: 'center',
        textAlign: 'center',
        my: 5,
        flexDirection: 'column',
      }}
    >
      <Heading as="h1" variant="header2" sx={{ fontSize: 40, mb: 3 }}>
        {t('landing.hero.headline')}
      </Heading>
      <Text variant="paragraph1" sx={{ mb: 3, color: 'lavender' }}>
        <Trans i18nKey="landing.hero.subheader" components={[<br />]} />
      </Text>
      <Box
        sx={{
          opacity: 0.08,
        }}
      >
        <Image sx={{ mb: 4 }} src="/static/img/icons_set.svg" />
      </Box>
      <AppLink
        href="/connect"
        variant="primary"
        sx={{
          display: 'flex',
          margin: '0 auto',
          px: '40px',
          py: 2,
          alignItems: 'center',
          '&:hover svg': {
            transform: 'translateX(10px)',
          },
        }}
      >
        {t('connect-wallet')}
        <Icon
          name="arrow_right"
          sx={{
            ml: 2,
            position: 'relative',
            left: 2,
            transition: '0.2s',
          }}
        />
      </AppLink>
    </Flex>
  )
}
interface ExpandableProps {
  question: string
  answer: string
  isOpen: boolean
  toggle(): void
}
function Expandable({ question, answer, isOpen, toggle }: ExpandableProps) {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)
  useEffect(() => {
    if (contentRef.current === null) {
      return
    }

    setRect(contentRef.current.getBoundingClientRect())
  }, [])

  return (
    <Box
      sx={{
        borderBottom: 'light',
        '&:first-of-type': {
          borderTop: 'light',
        },
      }}
    >
      <Button sx={{ position: 'relative' }} variant="expandable" onClick={toggle}>
        {question}
        {
          <Box
            sx={{
              width: 25,
              height: 25,
              marginLeft: 'auto',
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: `translateY(-50%) rotate(${isOpen ? 0 : 180}deg)`,
              transformOrigin: '50% 50%',
              transition: 'transform 0.2s ease-in-out',
            }}
          >
            <Icon size={25} name={isOpen ? 'minus' : 'plus'} />
          </Box>
        }
      </Button>
      <Box
        sx={{
          overflow: 'hidden',
          height: isOpen && rect ? `${rect.height}px` : 0,
          transition: 'height 0.3s',
        }}
      >
        <Box
          ref={contentRef}
          sx={{
            pb: 3,
          }}
        >
          {answer}
        </Box>
      </Box>
    </Box>
  )
}

export function FAQ() {
  const { t } = useTranslation()
  const [openEntry, setOpen] = useState<undefined | number>()
  const entries = t('landing.faq.entries', { returnObjects: true }) as Array<{
    question: string
    answer: string
  }>

  return (
    <Flex
      sx={{ flexDirection: 'column', alignItems: 'center', mt: 4, maxWidth: '762px', mx: 'auto' }}
    >
      <Heading variant="header2" sx={{ mb: 4 }}>
        {t('landing.faq.title')}
      </Heading>
      {entries.map(({ question, answer }, idx) => (
        <Expandable
          key={idx}
          question={question}
          answer={answer}
          isOpen={openEntry === idx}
          toggle={() => (openEntry === idx ? setOpen(undefined) : setOpen(idx))}
        />
      ))}
      <Flex sx={{ width: '100%', justifyContent: 'flex-start', mt: 3 }}>
        <AppLink sx={{ color: 'lavender' }} href="/faq">
          {t('landing.link-to-full-faq')}
        </AppLink>
        <AppLink sx={{ ml: 4, color: 'lavender' }} href="/privacy">
          {t('landing.glossary-of-terms')}
        </AppLink>
      </Flex>
    </Flex>
  )
}

const slideInAnimation = {
  opacity: 0,
  animation: slideIn,
  animationDuration: '0.4s',
  animationTimingFunction: 'ease-out',
  animationFillMode: 'forwards',
  animationDelay: '0.4s',
}

const fadeInAnimation = {
  opacity: 0,
  animation: fadeIn,
  animationDuration: '0.4s',
  animationTimingFunction: 'ease-out',
  animationFillMode: 'forwards',
}

export function LandingView() {
  const { landing$ } = useAppContext()
  const [landing, landingError] = useObservableWithError(landing$)

  const onIlkSearch = useCallback(
    (search: string) => {
      landing?.ilks.filters.change({ kind: 'search', search })
    },
    [landing?.ilks.filters],
  )
  const onIlksTagChange = useCallback(
    (tagFilter: CoinTag | undefined) => {
      landing?.ilks.filters.change({ kind: 'tagFilter', tagFilter })
    },
    [landing?.ilks.filters],
  )

  if (landingError !== undefined) {
    console.log(landingError)
    return <>Error while fetching data!</>
  }

  return (
    <Grid
      sx={{
        flex: 1,
        position: 'relative',
      }}
    >
      <Hero sx={{ ...slideInAnimation, position: 'relative' }} />
      <Box
        sx={{
          ...slideInAnimation,
          position: 'relative',
          my: 4,
          mb: [2, 3, 5],
        }}
      >
        <FeaturedIlksPlaceholder
          sx={
            landing !== undefined
              ? {
                  ...fadeInAnimation,
                  animationDirection: 'backwards',
                  animationFillMode: 'backwards',
                }
              : {}
          }
        />
        {landing !== undefined && <FeaturedIlks sx={fadeInAnimation} ilks={landing.featuredIlks} />}
      </Box>
      {landing !== undefined ? (
        <Box sx={{ ...slideInAnimation, position: 'relative' }}>
          <Filters
            onSearch={onIlkSearch}
            search={landing.ilks.filters.search}
            onTagChange={onIlksTagChange}
            tagFilter={landing.ilks.filters.tagFilter}
            defaultTag="all-assets"
          />
          <Box sx={{ overflowX: 'auto', p: '3px' }}>
            <Table
              data={landing.ilks.data}
              primaryKey="ilk"
              state={landing.ilks.filters}
              columns={ilksColumns}
            />
          </Box>
        </Box>
      ) : (
        <Box sx={{ height: 500 }}></Box>
      )}
      <FAQ />
    </Grid>
  )
}
