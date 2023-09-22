import { Icon } from '@makerdao/dai-ui-icons'
import { AppLink } from 'components/Links'
import type {
  NavigationMenuPanelIcon,
NavigationMenuPanelType,
} from 'components/navigation/NavigationMenuPanel'
import { WithArrow } from 'components/WithArrow'
import React from 'react'
import type { SxStyleProp } from 'theme-ui'
import { Box, Flex, Heading, Image, Text } from 'theme-ui'

export type NavigationMenuDropdownContentProps = NavigationMenuPanelType

export function NavigationMenuDropdownContentIcon({
  source,
  // position,
  type,
}: NavigationMenuPanelIcon) {
  return (
    <Flex
      sx={{
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
      }}
    >
      {/* <Box sx={{ flexShrink: 0, my: '-4px', mr: '12px', ...(image && { p: '3px' }) }}> */}
      {type === 'icon' && <Icon size={30} name={source} />}
      {type === 'image' && <Image src={source} width={26} />}
    </Flex>
  )
}
export function NavigationMenuDropdownContent({ lists }: NavigationMenuDropdownContentProps) {
  return (
    <Flex
      as="ul"
      sx={{
        flexDirection: 'column',
        rowGap: 3,
        listStyle: 'none',
        width: '294px',
        ml: 0,
        mr: 3,
        pl: 0,
        pr: 3,
        borderRight: '1px solid',
        borderColor: 'neutral20',
      }}
    >
      {lists.map(({ header, items, link, tight }) => (
        <Flex as="li" sx={{ rowGap: 2, flexDirection: 'column', width: '100%' }}>
          {header && (
            <Heading variant="paragraph4" sx={{ color: 'neutral80' }}>
              {header}
            </Heading>
          )}
          <Box
            as="ul"
            sx={{
              listStyle: 'none',
              m: 0,
              p: 0,
            }}
          >
            {items.map(({ description, hoverColor, icon, title }) => (
              <Box
                as="li"
                sx={{
                  py: tight ? 2 : '12px',
                  px: tight ? 2 : 3,
                  cursor: 'pointer',
                  backgroundColor: 'neutral10',
                  borderRadius: 'mediumLarge',
                  transition: '200ms background-color',
                  '&:hover': {
                    backgroundColor: 'neutral30',
                    ...(hoverColor && {
                      '.heading': {
                        color: 'transparent',
                        '&::after': {
                          opacity: 1,
                        },
                      },
                    }),
                  },
                }}
              >
                <Flex sx={{ alignItems: 'center', columnGap: 2 }}>
                  {icon && icon.position === 'global' && (
                    <NavigationMenuDropdownContentIcon {...icon} />
                  )}
                  <Flex sx={{ alignItems: 'center', columnGap: 2 }}>
                    {icon && icon.position === 'title' && (
                      <NavigationMenuDropdownContentIcon {...icon} />
                    )}
                    <Heading
                      as="h3"
                      variant="boldParagraph3"
                      className="heading"
                      data-value={title}
                      sx={
                        {
                          position: 'relative',
                          color: 'primary100',
                          transition: 'color 200ms',
                          ...(hoverColor && {
                            '&::after': {
                              content: 'attr(data-value)',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              opacity: 0,
                              transition: 'opacity 200ms',
                              '-webkit-background-clip': 'text',
                              backgroundImage: hoverColor,
                            },
                          }),
                        } as SxStyleProp
                      }
                    >
                      {title}
                    </Heading>
                  </Flex>
                </Flex>
                {description && (
                  <Text as="p" variant="paragraph4" sx={{ mt: 1, color: 'neutral80' }}>
                    {description}
                  </Text>
                )}
              </Box>
            ))}
          </Box>
          {link && (
            <AppLink href={link.url} sx={{ mr: 'auto', display: 'inline-block' }}>
              <WithArrow gap={1} sx={{ fontSize: 1, color: 'interactive100' }}>
                {link.label}
              </WithArrow>
            </AppLink>
          )}
        </Flex>
      ))}
    </Flex>
  )
}
