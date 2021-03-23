// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import { AppLink } from 'components/Links'
import moment from 'moment'
import { useTranslation } from 'next-i18next'
import getConfig from 'next/config'
import React from 'react'
import ReactSelect from 'react-select'
import { Box, Card, Container, Flex, Grid, Link, Text } from 'theme-ui'

const {
  publicRuntimeConfig: { buildHash, buildDate },
} = getConfig()

const FOOTER_LINKS = [
  { labelKey: 'landing.footer.trade', url: 'https://oasis.app/trade', target: '_self' },
  { labelKey: 'landing.footer.borrow', url: 'https://oasis.app/borrow', target: '_self' },
  {
    labelKey: 'landing.footer.privacy',
    url: '/privacy',
  },
  { labelKey: 'landing.footer.terms', url: '/terms' },
  { labelKey: 'landing.footer.blog', url: 'https://blog.oasis.app' },
  { labelKey: 'landing.footer.faq', url: '/support' },
  { labelKey: 'landing.footer.contact', url: '/contact' },
]

function LanguageSelect() {
  const {
    t,
    i18n: { language, changeLanguage },
  } = useTranslation('common')

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
      onChange={({ value }) => changeLanguage(value)}
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
              display: 'inline-flex',
              cursor: 'pointer',
              variant: 'links.nav',
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
  return (
    <Container sx={{ maxWidth: '898px' }}>
      <Grid sx={{ color: 'text', fontSize: 2 }} columns={2}>
        {/*<Text>*/}
        {/*  /!* Temporary for debugging locale *!/*/}
        {/*  <Button onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en')}>*/}
        {/*    {t('change-locale')}*/}
        {/*  </Button>*/}
        {/*</Text>*/}
        <Text>
          Commit:{' '}
          <Link
            href={`https://github.com/OasisDex/oasis-borrow/commit/${buildHash}`}
            target="_blank"
          >
            {buildHash.substring(0, 10)}
          </Link>
        </Text>
        <Text>Build Date: {moment(buildDate).format('DD.MM.YYYY HH:MM')}</Text>
      </Grid>
    </Container>
  )
}

export function Footer() {
  const { t } = useTranslation('common')

  return (
    <Box as="footer">
      <Container sx={{ maxWidth: '898px', mb: 5, pt: 2 }}>
        <Grid
          columns={[3, 3, 4]}
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
        </Grid>
      </Container>
      <TemporaryFooter />
    </Box>
  )
}
