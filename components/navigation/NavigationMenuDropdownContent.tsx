import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { AssetPill } from 'components/AssetPill'
import { AppLink } from 'components/Links'
import { NavigationMenuPanelType } from 'components/navigation/NavigationMenuPanel'
import { WithArrow } from 'components/WithArrow'
import { getAjnaWithArrowColorScheme } from 'features/ajna/common/helpers/getAjnaWithArrowColorScheme'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

export type NavigationMenuDropdownContentProps = NavigationMenuPanelType

export function NavigationMenuDropdownContent({
  label,
  description,
  learn,
  links,
  otherAssets,
}: NavigationMenuDropdownContentProps) {
  const { t } = useTranslation()

  return (
    <>
      <Box>
        <Heading
          sx={{
            fontSize: '28px',
            fontWeight: 'bold',
            mb: 1,
            color: 'primary100',
            letterSpacing: '-0.02em',
          }}
        >
          {label}
        </Heading>
        <Flex sx={{ columnGap: 1 }}>
          <Text as="p" sx={{ fontSize: '14px', color: 'neutral80', lineHeight: '22px' }}>
            {description}
          </Text>
          {learn && (
            <AppLink href={learn.link}>
              <WithArrow gap={1} sx={{ display: 'inline-block', ...getAjnaWithArrowColorScheme() }}>
                {learn.label}
              </WithArrow>
            </AppLink>
          )}
        </Flex>
      </Box>
      <Grid
        as="ul"
        sx={{
          gap: 4,
          gridTemplateColumns: 'repeat( 2, 1fr )',
          p: '0',
          listStyle: 'none',
        }}
      >
        {links.map(({ icon, footnote, link, title, hash }, i) => (
          <Flex key={i} as="li" sx={{ flexGrow: 1, flexBasis: 0 }}>
            <AppLink
              href={link}
              hash={hash}
              sx={{
                display: 'flex',
                alignItems: 'center',
                fontWeight: 'regular',
                '&:hover': {
                  '.dropdownLinkTitle': {
                    color: 'neutral80',
                  },
                },
              }}
            >
              <Icon size={48} name={icon} sx={{ flexShrink: 0 }} />
              <Flex sx={{ flexDirection: 'column', ml: 3 }}>
                <Text
                  as="p"
                  className="dropdownLinkTitle"
                  sx={{
                    fontSize: 4,
                    fontWeight: 'semiBold',
                    color: 'primary100',
                    transition: 'color 200ms',
                  }}
                >
                  {title}
                </Text>
                <Text as="p" sx={{ fontSize: 2, color: 'neutral80', whiteSpace: 'nowrap' }}>
                  {footnote}
                </Text>
              </Flex>
            </AppLink>
          </Flex>
        ))}
      </Grid>
      {otherAssets && otherAssets?.length > 0 && (
        <Box sx={{ pt: '24px', borderTop: '1px solid', borderColor: 'neutral20' }}>
          <Heading
            as="h3"
            sx={{
              fontSize: '16px',
              fontWeight: 'semiBold',
              mb: 3,
              color: 'primary100',
            }}
          >
            {t('ajna.navigation.common.other-assets')}
          </Heading>
          <Flex as="ul" sx={{ columnGap: 3, rowGap: 2, listStyle: 'none', p: 0 }}>
            {otherAssets.map(({ link, token }, i) => (
              <Box key={i} as="li">
                <AssetPill icon={getToken(token).iconCircle} label={token} link={link} />
              </Box>
            ))}
          </Flex>
        </Box>
      )}
    </>
  )
}
