import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { AssetPill } from 'components/AssetPill'
import { AppLink } from 'components/Links'
import { mobileLinkSx } from 'components/navigation/common'
import { NavigationMenuPanelType } from 'components/navigation/NavigationMenuPanel'
import { WithArrow } from 'components/WithArrow'
import { getAjnaWithArrowColorScheme } from 'features/ajna/common/helpers/getAjnaWithArrowColorScheme'
import React, { useEffect, useState } from 'react'
import { Box, Button, Flex, Text } from 'theme-ui'

type NavigationMobileMenuPanelProps = NavigationMenuPanelType & {
  isOpen: boolean
}

export function NavigationMobileMenuPanel({
  description,
  label,
  links,
  learn,
  isOpen,
  otherAssets,
}: NavigationMobileMenuPanelProps) {
  const [isActive, setIsActive] = useState<boolean>(false)

  useEffect(() => {
    if (!isOpen) setIsActive(false)
  }, [isOpen])

  return (
    <Box key={`link-${label}`} as="li">
      <Button
        sx={{
          ...mobileLinkSx,
          cursor: 'pointer',
        }}
        onClick={() => {
          setIsActive(true)
        }}
      >
        {label} <Icon name="chevron_right" />
      </Button>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          p: 3,
          pb: '88px',
          bg: 'neutral10',
          opacity: isActive ? 1 : 0,
          overflowY: 'auto',
          pointerEvents: isActive ? 'auto' : 'none',
          transform: `translateX(${isActive ? '0' : '-20%'})`,
          transition: 'opacity 200ms, transform 200ms',
        }}
      >
        <Button
          sx={{
            ...mobileLinkSx,
            cursor: 'pointer',
          }}
          onClick={() => {
            setIsActive(false)
          }}
        >
          <Icon name="chevron_left" /> {label}
        </Button>
        <Text as="p" sx={{ mt: '24px', fontSize: '14px', color: 'neutral80', lineHeight: '22px' }}>
          {description}
        </Text>
        {learn && (
          <AppLink href={learn.link}>
            <WithArrow gap={1} sx={{ display: 'inline-block', ...getAjnaWithArrowColorScheme() }}>
              {learn.label}
            </WithArrow>
          </AppLink>
        )}
        <Box
          as="ul"
          sx={{
            listStyle: 'none',
            mt: '24px',
            p: '0',
          }}
        >
          {links.map(({ icon, link, title, hash }, i) => (
            <Flex key={i} as="li">
              <AppLink
                href={link}
                hash={hash}
                sx={{
                  ...mobileLinkSx,
                  alignItems: 'flex-start',
                }}
              >
                <Icon size={32} name={icon} sx={{ flexShrink: 0, mr: 1 }} />
                <Text as="span" sx={{ mt: 1 }}>
                  {title}
                </Text>
              </AppLink>
            </Flex>
          ))}
        </Box>
        {otherAssets && otherAssets?.length > 0 && (
          <Flex
            as="ul"
            sx={{
              listStyle: 'none',
              columnGap: 3,
              rowGap: 2,
              flexWrap: 'wrap',
              mt: '24px',
              pt: '24px',
              pl: 0,
              borderTop: '1px solid',
              borderColor: 'neutral20',
            }}
          >
            {otherAssets.map(({ link, token }, i) => (
              <Box key={i} as="li">
                <AssetPill icon={getToken(token).iconCircle} label={token} link={link} />
              </Box>
            ))}
          </Flex>
        )}
      </Box>
    </Box>
  )
}
