import { Icon } from '@makerdao/dai-ui-icons'
import { LanguageSelect } from 'components/LanguageSelect'
import { AppLink } from 'components/Links'
import { NewsletterSection } from 'features/newsletter/NewsletterView'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import moment from 'moment'
import { useTranslation } from 'next-i18next'
import getConfig from 'next/config'
import React from 'react'
import { Box, Card, Container, Flex, Grid, Image, Link, Text } from 'theme-ui'

import { FooterBackground } from '../theme/FooterBackground'
import { ChevronUpDown } from './ChevronUpDown'
import { SelectComponents } from 'react-select/src/components'

const {
  publicRuntimeConfig: { buildHash, buildDate, showBuildInfo, apiHost },
} = getConfig()

const ROUTES = {
  CONTACT: `${apiHost}/daiwallet/contact`,
  SUPPORT: '/support',
  TWITTER: 'https://twitter.com/oasisdotapp',
  DISCORD: 'https://discord.gg/Kc2bBB59GC',
}

const FOOTER_SECTIONS = [
  {
    titleKey: 'nav.about',
    links: [
      { labelKey: 'nav.team', url: '/about' },
      { labelKey: 'nav.careers', url: '/careers' },
      { labelKey: 'nav.privacy', url: '/privacy' },
      { labelKey: 'nav.cookie', url: '/cookie' },
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
      { labelKey: 'nav.knowledge-centre', url: 'https://kb.oasis.app/help', target: '_blank' },
      { labelKey: 'nav.oracles', url: '/oracles' },
      { labelKey: 'nav.referrals', url: '/referrals' },
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
      { labelKey: 'nav.borrow', url: '/borrow' },
      { labelKey: 'nav.multiply', url: '/multiply' },
    ],
  },
]

const LangSelectComponents: Partial<SelectComponents<{
  value: string
  label: string
}>> = {
  IndicatorsContainer: () => null,
  ValueContainer: ({ children }) => <Flex sx={{ color: 'primary100' }}>{children}</Flex>,
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
          bg: 'neutral10',
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
      <ChevronUpDown isUp={!!menuIsOpen} variant="select" size="auto" width="10px" height="7px" />
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
              rel="noopener noreferrer"
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

function SocialWithLogo() {
  return (
    <Grid gap={3}>
      <Image src={staticFilesRuntimeUrl('/static/img/logo_footer.svg')} sx={{ height: '27px' }} />
      <Flex sx={{ alignItems: 'center', a: { fontSize: '0px' }, my: 2 }}>
        <AppLink href={ROUTES.TWITTER}>
          <Icon name="twitter" size="auto" width="18px" height="16px" />
        </AppLink>
        <AppLink href={ROUTES.DISCORD} sx={{ mx: 3 }}>
          <Icon name="discord" size="auto" width="20px" height="23px" />
        </AppLink>
        <AppLink href="https://github.com/OasisDEX/oasis-borrow/">
          <Icon name="github" size="auto" width="21px" />
        </AppLink>
      </Flex>
      <Flex sx={{ justifyContent: ['center', 'flex-start'] }}>
        <LanguageSelect components={LangSelectComponents} />
      </Flex>
    </Grid>
  )
}

export function Footer() {
  const { t } = useTranslation()

  return (
    <Box as="footer" sx={{ position: 'relative', zIndex: 'footer' }}>
      <Container sx={{ maxWidth: '1200px', mb: 5, pb: 0, pt: 2 }}>
        <Grid
          sx={{
            pl: 0,
            alignItems: 'flex-start',
            justifyItems: ['flex-start', 'center'],
          }}
          columns={[2, '150px 1fr 1fr 1fr', '150px 1fr 1fr 1fr 378px']}
          gap={[4, null, 5]}
        >
          <Box sx={{ display: ['none', 'block'] }}>
            <SocialWithLogo />
          </Box>
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

          <Box sx={{ display: ['none', 'none', 'flex'], width: '100%' }}>
            <NewsletterSection small />
          </Box>
        </Grid>
        <Flex sx={{ display: ['flex', 'flex', 'none'], mt: 5 }}>
          <NewsletterSection small />
        </Flex>
        <Flex sx={{ justifyContent: 'center', pt: 5, display: ['flex', 'none'] }}>
          <SocialWithLogo />
        </Flex>
      </Container>
      <TemporaryFooter />
      <FooterBackground />
    </Box>
  )
}
