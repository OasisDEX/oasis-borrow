import { Icon } from '@makerdao/dai-ui-icons'
import { Pages } from 'analytics/analytics'
import { CoinTag, getToken } from 'blockchain/tokensMetadata'
import { Announcement } from 'components/Announcement'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { ColumnDef, Table, TableSortHeader } from 'components/Table'
import { IlksFilterState } from 'features/ilks/ilksFilters'
import { IlkWithBalance } from 'features/ilks/ilksWithBalances'
import { Filters } from 'features/vaultsOverview/Filters'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useObservable, useObservableWithError } from 'helpers/observableHook'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { Trans, useTranslation } from 'next-i18next'
import React, { ComponentProps, useCallback, useEffect, useRef, useState } from 'react'
import { Box, Button, Flex, Grid, Heading, Image, SxStyleProp, Text } from 'theme-ui'
import { fadeInAnimation, slideInAnimation } from 'theme/animations'

import { FeaturedIlks, FeaturedIlksPlaceholder } from './FeaturedIlks'

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
      <Text sx={{ textAlign: 'right' }}>
        {formatPercent(stabilityFee.times(100), { precision: 2 })}
      </Text>
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
          <Trans i18nKey="open-vault.title" />
        </AppLink>
      </Box>
    ),
  },
]

function WithArrow({ children }: React.PropsWithChildren<{}>) {
  return (
    <Text
      variant="paragraph3"
      sx={{
        fontWeight: 'semiBold',
        fontSize: [1, 2],
        position: 'relative',
        '& .arrow': {
          transition: 'ease-in-out 0.2s',
          transform: 'translateX(0px)',
        },
        '&:hover .arrow': {
          transform: 'translateX(5px)',
        },
      }}
    >
      <Box sx={{ display: 'inline', mr: 2 }}>{children}</Box>
      <Box className="arrow" sx={{ display: 'inline', position: 'absolute' }}>
        →
      </Box>
    </Text>
  )
}

export function Hero({ sx, isConnected }: { sx?: SxStyleProp; isConnected: boolean }) {
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
      <Announcement sx={{ mb: 3, textAlign: 'left' }}>
        <Flex sx={{ flexDirection: ['column', 'row'] }}>
          <Text variant="paragraph3" sx={{ fontWeight: 'semiBold', fontSize: [1, 2], mr: 3 }}>
            {t('welcome')}
          </Text>
          <Flex sx={{ flexDirection: ['column', 'row'] }}>
            <AppLink href="https://blog.oasis.app/introducing-the-redesigned-oasis-borrow/">
              <WithArrow>{t('read-blog-post')}</WithArrow>
            </AppLink>
            <Text
              variant="paragraph3"
              sx={{
                fontWeight: 'semiBold',
                color: 'muted',
                mx: 3,
                ml: 4,
                display: ['none', 'block'],
              }}
            >
              |
            </Text>
            <AppLink href={`${window.location.origin}/borrow-old`}>
              <WithArrow>{t('visit-old-oasis')}</WithArrow>
            </AppLink>
          </Flex>
        </Flex>
      </Announcement>
      <Heading as="h1" variant="header2" sx={{ fontSize: 40, mb: 3 }}>
        {t('landing.hero.headline')}
      </Heading>
      <Text variant="paragraph1" sx={{ mb: 4, color: 'lavender' }}>
        <Trans i18nKey="landing.hero.subheader" components={[<br />]} />
      </Text>

      <Image sx={{ mb: 4 }} src={staticFilesRuntimeUrl('/static/img/icons_set.svg')} />

      {!isConnected && (
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
      )}
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
      <Button
        sx={{ position: 'relative', lineHeight: '1rem' }}
        variant="expandable"
        onClick={toggle}
      >
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
      sx={{ flexDirection: 'column', alignItems: 'center', my: 6, maxWidth: '762px', mx: 'auto' }}
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
        <AppLink sx={{ color: 'lavender' }} href="https://oasis.app/support">
          {t('landing.link-to-full-faq')}
        </AppLink>
      </Flex>
    </Flex>
  )
}

export function LandingView() {
  const { landing$, context$ } = useAppContext()
  const context = useObservable(context$)
  const { value: landing, error: landingError } = useObservableWithError(landing$)
  const { t } = useTranslation()

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

  return (
    <Grid
      sx={{
        flex: 1,
        position: 'relative',
      }}
    >
      <Hero
        isConnected={context?.status === 'connected'}
        sx={{ ...slideInAnimation, position: 'relative' }}
      />
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
      <WithLoadingIndicator
        value={landing}
        error={landingError}
        customLoader={
          <Flex sx={{ alignItems: 'flex-start', justifyContent: 'center', height: '500px' }}>
            <AppSpinner sx={{ mt: 5 }} variant="styles.spinner.large" />
          </Flex>
        }
      >
        {(landing) => (
          <Box sx={{ ...slideInAnimation, position: 'relative' }}>
            <Filters
              onSearch={onIlkSearch}
              search={landing.ilks.filters.search}
              onTagChange={onIlksTagChange}
              tagFilter={landing.ilks.filters.tagFilter}
              defaultTag="all-assets"
              page={Pages.LandingPage}
              searchPlaceholder={t('search-token')}
            />
            <Box sx={{ overflowX: 'auto', p: '3px' }}>
              <Table
                data={landing.ilks.data}
                primaryKey="ilk"
                state={landing.ilks.filters}
                columns={ilksColumns}
                noResults={<Box>{t('no-results')}</Box>}
                deriveRowProps={(row) => ({ href: `/vaults/open/${row.ilk}` })}
              />
            </Box>
          </Box>
        )}
      </WithLoadingIndicator>
      <FAQ />
    </Grid>
  )
}
