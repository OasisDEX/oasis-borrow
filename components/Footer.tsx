import { LanguageSelect } from 'components/LanguageSelect'
import { AppLink } from 'components/Links'
import dayjs from 'dayjs'
import { NewsletterSection } from 'features/newsletter/NewsletterView'
import { EXTERNAL_LINKS, INTERNAL_LINKS } from 'helpers/applicationLinks'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import getConfig from 'next/config'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { discord, github, twitter } from 'theme/icons'
import { Box, Card, Container, Flex, Grid, Image, Link, Text } from 'theme-ui'

import { ChevronUpDown } from './ChevronUpDown'
import { Icon } from './Icon'
import type { SelectComponents } from 'react-select/src/components'

const {
  publicRuntimeConfig: { buildHash, buildDate, showBuildInfo },
} = getConfig()

const FOOTER_SECTIONS = [
  {
    titleKey: 'nav.about',
    links: [
      { labelKey: 'nav.team', url: INTERNAL_LINKS.about },
      { labelKey: 'nav.contact', url: EXTERNAL_LINKS.KB.CONTACT, target: '_blank' },
      { labelKey: 'nav.careers', url: EXTERNAL_LINKS.WORKABLE },
      { labelKey: 'nav.privacy', url: INTERNAL_LINKS.privacy },
      { labelKey: 'nav.cookie', url: INTERNAL_LINKS.cookie },
      { labelKey: 'nav.terms', url: INTERNAL_LINKS.terms },
      { labelKey: 'nav.security', url: INTERNAL_LINKS.security },
    ],
  },
  {
    titleKey: 'nav.resources',
    links: [
      { labelKey: 'nav.discover', url: INTERNAL_LINKS.discover, target: '_self' },
      { labelKey: 'nav.blog', url: EXTERNAL_LINKS.BLOG.MAIN, target: '_self' },
      { labelKey: 'nav.knowledge-centre', url: EXTERNAL_LINKS.KB.HELP, target: '_blank' },
      { labelKey: 'nav.bug-bounty', url: EXTERNAL_LINKS.BUG_BOUNTY, target: '_blank' },
      { labelKey: 'nav.ajna-rewards', url: INTERNAL_LINKS.ajnaRewards },
      { labelKey: 'nav.referrals', url: INTERNAL_LINKS.referrals },
      { labelKey: 'nav.brand-assets', url: INTERNAL_LINKS.brand },
    ],
  },
  {
    titleKey: 'nav.products',
    links: [
      { labelKey: 'nav.borrow', url: INTERNAL_LINKS.borrow },
      { labelKey: 'nav.multiply', url: INTERNAL_LINKS.multiply },
      { labelKey: 'nav.earn', url: INTERNAL_LINKS.earn },
    ],
  },
]

const LangSelectComponents: Partial<
  SelectComponents<{
    value: string
    label: string
  }>
> = {
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
  const date = dayjs(buildDate).format('DD.MM.YYYY HH:MM')
  console.debug(`Build commit: ${commit} Build date: ${date}`)
  return (
    showBuildInfo && (
      <Container sx={{ maxWidth: '898px' }}>
        <Grid sx={{ color: 'text', fontSize: 2 }} columns={2}>
          <Text>
            Commit:{' '}
            <Link
              href={`${EXTERNAL_LINKS.GITHUB}/commit/${buildHash}`}
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
      <Image
        src={staticFilesRuntimeUrl('/static/img/logos/logo_dark.svg')}
        sx={{ height: '34px', width: '150px', position: 'relative', top: '-2px' }}
      />
      <Flex sx={{ alignItems: 'center', a: { fontSize: '0px' }, my: 2 }}>
        <AppLink href={EXTERNAL_LINKS.TWITTER}>
          <Icon icon={twitter} size="auto" width="18px" height="16px" />
        </AppLink>
        <AppLink href={EXTERNAL_LINKS.DISCORD} sx={{ mx: 3 }}>
          <Icon icon={discord} size="auto" width="20px" height="23px" />
        </AppLink>
        <AppLink href={EXTERNAL_LINKS.GITHUB}>
          <Icon icon={github} size="auto" width="21px" />
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
    <Box as="footer" sx={{ position: 'relative' }}>
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
              <Text variant="boldParagraph1">{t(titleKey)}</Text>
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
    </Box>
  )
}
