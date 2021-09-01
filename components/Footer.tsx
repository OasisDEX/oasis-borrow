// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import { LanguageSelect } from 'components/LanguageSelect'
import { AppLink } from 'components/Links'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import moment from 'moment'
import { useTranslation } from 'next-i18next'
import getConfig from 'next/config'
import React from 'react'
import { Box, Card, Container, Flex, Grid, Image, Link, Text } from 'theme-ui'

import { SelectComponents } from 'react-select/src/components'

const {
  publicRuntimeConfig: { buildHash, buildDate, showBuildInfo, apiHost },
} = getConfig()

const FOOTER_SECTIONS = [
  {
    titleKey: 'nav.about',
    links: [
      { labelKey: 'nav.team', url: '/about' },
      { labelKey: 'nav.careers', url: '/careers' },
      { labelKey: 'nav.privacy', url: '/privacy' },
      { labelKey: 'nav.terms', url: '/terms' },
      { labelKey: 'nav.contact', url: `${apiHost}/daiwallet/contact` },
    ],
  },
  {
    titleKey: 'nav.resources',
    links: [
      { labelKey: 'nav.blog', url: 'https://blog.oasis.app', target: '_self' },
      {
        labelKey: 'nav.faq',
        url: '/support',
      },
      // add link
      // { labelKey: 'nav.knowledge-centre', url: '/' },
      { labelKey: 'nav.oracles', url: '/oracles' },
    ],
  },
  {
    titleKey: 'nav.products',
    links: [
      {
        labelKey: 'nav.dai-wallet',
        url: `${apiHost}/daiwallet`,
        target: '_self',
      },
      { labelKey: 'nav.borrow', url: '/' },
      { labelKey: 'nav.trade', url: `${apiHost}/trade`, target: '_self' },
    ],
  },
]

const LangSelectComponents: Partial<SelectComponents<{
  value: string
  label: string
}>> = {
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
        fontSize: 3,
      }}
    >
      {children}
      <Icon
        name={menuIsOpen ? 'chevron_up' : 'chevron_down'}
        size="auto"
        width="10px"
        height="7px"
        sx={{ ml: 1, position: 'relative', top: '1px' }}
      />
    </Box>
  ),
}

export function TemporaryFooter() {
  const commit = buildHash.substring(0, 10)
  const date = moment(buildDate).format('DD.MM.YYYY HH:MM')
  console.debug(`Build commit: ${commit} Build date: ${date}`)
  return (
    showBuildInfo && (
      <Container sx={{ maxWidth: '898px' }}>
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
  )
}

export function Footer() {
  const { t } = useTranslation()

  return (
    <Box as="footer" sx={{ position: 'relative', zIndex: 'footer' }}>
      <Container sx={{ maxWidth: '824px', mb: 5, pb: 4, pt: 2 }}>
        <Grid
          sx={{
            pl: 0,
            alignItems: 'flex-start',
          }}
          columns={[2, '150px 1fr 1fr 1fr']}
          gap={[4, null, 5]}
        >
          <Grid gap={3}>
            <Image src={staticFilesRuntimeUrl('/static/img/logo_footer.svg')} />
            <Flex sx={{ alignItems: 'center', a: { fontSize: '0px' }, my: 2 }}>
              <AppLink href="https://twitter.com/oasisdotapp">
                <Icon name="twitter" size="auto" width="18px" height="16px" />
              </AppLink>
              <AppLink href="https://discord.gg/Kc2bBB59GC" sx={{ mx: 3 }}>
                <Icon name="discord" size="auto" width="20px" height="23px" />
              </AppLink>
              <AppLink href="https://github.com/OasisDEX/oasis-borrow/">
                <Icon name="github" size="auto" width="21px" />
              </AppLink>
            </Flex>
            <LanguageSelect components={LangSelectComponents} />
          </Grid>
          {FOOTER_SECTIONS.map(({ titleKey, links }) => (
            <Grid key={titleKey} as="ul" pl={0}>
              <Text sx={{ fontSize: 4, fontWeight: 'semiBold' }}>{t(titleKey)}</Text>
              {links.map(({ labelKey, url, target }) => (
                <Box key={labelKey} as="li" sx={{ listStyle: 'none' }}>
                  <AppLink variant="navFooter" href={url} target={target}>
                    {t(labelKey)}
                  </AppLink>
                </Box>
              ))}
            </Grid>
          ))}
        </Grid>
      </Container>
      <TemporaryFooter />
    </Box>
  )
}
