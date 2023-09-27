import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { mobileLinkSx } from 'components/navigation/common'
import { NavigationMenuDropdownContentList } from 'components/navigation/NavigationMenuDropdownContentList'
import type { NavigationMenuPanelType } from 'components/navigation/NavigationMenuPanel'
import { useToggle } from 'helpers/useToggle'
import React, { useEffect } from 'react'
import { Box, Button, Flex } from 'theme-ui'

type NavigationMobileMenuPanelProps = NavigationMenuPanelType & {
  isOpen: boolean
}

export function NavigationMobileMenuPanel({
  // description,
  label,
  // links,
  // learn,
  lists,
  isOpen,
}: NavigationMobileMenuPanelProps) {
  const [isAccordionOpen, toggleIsAccordionOpen, setIsAccordionOpen] = useToggle(false)

  useEffect(() => {
    if (!isOpen) setIsAccordionOpen(false)
  }, [isOpen])

  return (
    <Box key={`link-${label}`} as="li">
      <Button
        sx={{
          ...mobileLinkSx(isAccordionOpen),
          cursor: 'pointer',
        }}
        onClick={() => {
          toggleIsAccordionOpen()
        }}
      >
        {label}{' '}
        <ExpandableArrow direction={isAccordionOpen ? 'up' : 'down'} size={13} color="primary60" />
      </Button>
      {isAccordionOpen && (
        <Box
          as="ul"
          sx={{
            pt: 3,
            pl: 0,
            listStyle: 'none',
          }}
        >
          {lists.map((item, i) => (
            <Flex
              key={i}
              as="li"
              sx={{
                rowGap: 3,
                flexDirection: 'column',
              }}
            >
              <NavigationMenuDropdownContentList
                onClick={() => {
                  alert(label)
                }}
                {...item}
              />
            </Flex>
          ))}
        </Box>
      )}
      {/* <Box
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
      </Box> */}
    </Box>
  )
}
