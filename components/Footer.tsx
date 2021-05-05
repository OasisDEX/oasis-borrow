// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import { AppLink } from 'components/Links'
import moment from 'moment'
import { useTranslation } from 'next-i18next'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import React from 'react'
import ReactSelect from 'react-select'
import { Box, Card, Container, Flex, Grid, Link, Text } from 'theme-ui'

const {
  publicRuntimeConfig: { buildHash, buildDate },
} = getConfig()

const FOOTER_LINKS = [
  { labelKey: 'landing.footer.trade', url: 'https://oasis.app/trade', target: '_self' },
  { labelKey: 'landing.footer.privacy', url: 'https://oasis.app/privacy' },
  { labelKey: 'landing.footer.terms', url: '/terms' },
  { labelKey: 'landing.footer.blog', url: 'https://blog.oasis.app' },
  {
    labelKey: 'landing.footer.faq',
    url: 'https://oasis.app/support',
  },
  { labelKey: 'landing.footer.contact', url: 'https://oasis.app/contact', target: '_self' },
]

function LanguageSelect() {
  const {
    t,
    i18n: { language },
  } = useTranslation('common')

  const router = useRouter()

  const LANGUAGE_OPTIONS = [
    { value: 'en', label: t('landing.footer.language.en') },
    { value: 'es', label: t('landing.footer.language.es') },
    { value: 'pt', label: t('landing.footer.language.pt') },
  ]

  return (
    <ReactSelect
      options={LANGUAGE_OPTIONS.filter(({ value }) => value !== language)}
      isSearchable={false}
      value={LANGUAGE_OPTIONS.find(({ value }) => value === language)}
      // @ts-ignore
      onChange={({ value }) => router.push(router.query, router.asPath, { locale: value })}
      components={{
        IndicatorsContainer: () => null,
        ValueContainer: ({ children }) => <Flex sx={{ color: 'primary' }}>{children}</Flex>,
        SingleValue: ({ children }) => <Box>{children}</Box>,
        Option: ({ children, innerProps }) => (
          <Box
            {...innerProps}
            sx={{
              py: 2,
              pl: 3,
              pr: 5,
              cursor: 'pointer',
              '&:hover': {
                bg: 'background',
              },
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
              borderRadius: 'large',
              p: 0,
              overflow: 'hidden',
              top: 0,
              transform: `translateY(calc(-100% + -8px))`,
              boxShadow: 'cardLanding',
            }}
          >
            {children}
          </Card>
        ),
        MenuList: ({ children }) => <Box sx={{ textAlign: 'left' }}>{children}</Box>,
        Control: ({ innerProps, children, selectProps: { menuIsOpen } }) => (
          <Box
            {...innerProps}
            sx={{
              cursor: 'pointer',
              variant: 'links.nav',
              display: 'inline-flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {children}
            <Icon
              name={menuIsOpen ? 'chevron_up' : 'chevron_down'}
              size="auto"
              width="12px"
              sx={{ ml: 2 }}
            />
          </Box>
        ),
      }}
    />
  )
}

export function TemporaryFooter() {
  const commit = buildHash.substring(0, 10)
  const date = moment(buildDate).format('DD.MM.YYYY HH:MM')
  console.debug(`Build commit: ${commit} Build date: ${date}`)
  return (
    <Container sx={{ maxWidth: '898px', visibility: 'hidden' }}>
      <Grid sx={{ color: 'text', fontSize: 2 }} columns={2}>
        <Text>
          Commit:{' '}
          <Link
            href={`https://github.com/OasisDex/oasis-borrow/commit/${buildHash}`}
            target="_blank"
          >
            {commit}
          </Link>
        </Text>
        <Text>Build Date: {date}</Text>
      </Grid>
    </Container>
  )
}

export function Footer() {
  const { t } = useTranslation('common')

  return (
    <Box as="footer" sx={{ position: 'relative', zIndex: 'footer' }}>
      <Container sx={{ maxWidth: '761px', mb: 5, pt: 2 }}>
        <Flex
          as="ul"
          sx={{ pl: 0, justifyContent: 'space-between', textAlign: 'center', alignItems: 'center' }}
        >
          {FOOTER_LINKS.map(({ labelKey, url, target }) => (
            <Box key={labelKey} as="li" sx={{ listStyle: 'none', fontWeight: 'semiBold' }}>
              <AppLink variant="nav" href={url} target={target}>
                {t(labelKey)}
              </AppLink>
            </Box>
          ))}
          <LanguageSelect />
        </Flex>
      </Container>
      <TemporaryFooter />
    </Box>
  )
}
