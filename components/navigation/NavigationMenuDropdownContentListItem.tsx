import { Icon } from '@makerdao/dai-ui-icons'
import { NavigationMenuDropdownContentIcon } from 'components/navigation/NavigationMenuDropdownContentIcon'
import type { NavigationMenuPanelList } from 'components/navigation/NavigationMenuPanel'
import React from 'react'
import type { SxStyleProp } from 'theme-ui'
import { Box, Flex, Heading, Text } from 'theme-ui'

type NavigationMenuDropdownContentListItemProps =
  NavigationMenuPanelList['items'] extends readonly (infer ElementType)[] ? ElementType : never

export function NavigationMenuDropdownContentListItem({
  description,
  hoverColor,
  icon,
  promoted,
  tags,
  title,
}: NavigationMenuDropdownContentListItemProps) {
  const textHoverEffect = {
    content: 'attr(data-value)',
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0,
    transition: 'opacity 200ms',
    WebkitBackgroundClip: 'text',
  }

  return (
    <Flex sx={{ alignItems: 'center', columnGap: '12px' }}>
      {icon && icon.position === 'global' && <NavigationMenuDropdownContentIcon {...icon} />}
      <Box>
        <Flex sx={{ alignItems: 'center', columnGap: 2 }}>
          {icon && icon.position === 'title' && <NavigationMenuDropdownContentIcon {...icon} />}
          <Heading
            as="h3"
            variant="boldParagraph3"
            {...(hoverColor && {
              'data-value': title,
              className: 'heading-with-effect',
            })}
            sx={
              {
                color: 'primary100',
                ...(hoverColor && {
                  position: 'relative',
                  transition: 'color 200ms',
                  '&::after': {
                    ...textHoverEffect,
                    backgroundImage: hoverColor,
                  },
                }),
              } as SxStyleProp
            }
          >
            {promoted && (
              <Box as="span" className="star-with-effect" sx={{ transition: 'color 200ms' }}>
                <Icon name="star" size={16} sx={{ mr: 1, verticalAlign: 'text-top' }} />
              </Box>
            )}
            {title}
          </Heading>
        </Flex>
        {description && (
          <Text
            variant="paragraph4"
            sx={{ mt: 1, color: 'neutral80', em: { color: 'primary100', fontStyle: 'normal' } }}
          >
            {description}
          </Text>
        )}
        {tags && (
          <Flex as="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
            {tags.map((tag, i) => (
              <Box
                key={i}
                as="li"
                variant="text.paragraph4"
                {...(Array.isArray(tag) && {
                  'data-value': tag[0],
                  className: 'tag-with-effect',
                })}
                sx={
                  {
                    color: 'neutral80',
                    ...(i > 0 && {
                      ml: 3,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 2,
                        left: '-10px',
                        width: 1,
                        height: 1,
                        backgroundColor: 'neutral80',
                        borderRadius: 'ellipse',
                      },
                    }),
                    ...(Array.isArray(tag) && {
                      position: 'relative',
                      transition: 'color 200ms',
                      '&::after': {
                        ...textHoverEffect,
                        backgroundImage: tag[1],
                      },
                    }),
                  } as SxStyleProp
                }
              >
                {Array.isArray(tag) ? tag[0] : tag}
              </Box>
            ))}
          </Flex>
        )}
      </Box>
    </Flex>
  )
}
