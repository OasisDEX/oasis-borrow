import type {
  NavigationMenuPanelIcon,
  NavigationMenuPanelType,
} from 'components/navigation/NavigationMenuPanel'
import React from 'react'
import type { SxStyleProp } from 'theme-ui'
import { Box, Flex, Heading, Image, Text } from 'theme-ui'

export type NavigationMenuDropdownContentProps = NavigationMenuPanelType

export function NavigationMenuDropdownContentIcon({
  source,
  position = 'global',
  type = 'icon',
}: NavigationMenuPanelIcon) {
  return (
    <Box sx={{ flexShrink: 0, width: '32px', height: '32px', p: '3px' }}>
      {/* <Box sx={{ flexShrink: 0, my: '-4px', mr: '12px', ...(image && { p: '3px' }) }}> */}
      {/* {icon && <Icon size={32} name={icon} sx={{ verticalAlign: 'bottom' }} />} */}
      {type === 'image' && <Image src={source} />}
    </Box>
  )
}
export function NavigationMenuDropdownContent({ lists }: NavigationMenuDropdownContentProps) {
  return (
    <Flex>
      <Box
        as="ul"
        sx={{
          listStyle: 'none',
          width: '310px',
          m: 0,
          p: 3,
          borderRight: '1px solid',
          borderColor: 'neutral20',
        }}
      >
        {lists.map(({ items }) => (
          <Box as="li">
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
                    p: 3,
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
                    {icon && <NavigationMenuDropdownContentIcon {...icon} />}
                    <Heading
                      className="heading"
                      data-value={title}
                      variant="boldParagraph3"
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
                  {description && (
                    <Text as="p" variant="paragraph4" sx={{ mt: 1, color: 'neutral80' }}>
                      {description}
                    </Text>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Flex>
  )
}
