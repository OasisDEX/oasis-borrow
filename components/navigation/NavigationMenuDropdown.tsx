import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { AssetPill } from 'components/AssetPill'
import { AppLink } from 'components/Links'
import { NavigationMenuPanelType } from 'components/navigation/NavigationMenuPanel'
import { WithArrow } from 'components/WithArrow'
import { getAjnaWithArrowColorScheme } from 'features/ajna/common/helpers'
import React, { useEffect, useRef, useState } from 'react'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

export interface NavigationMenuDropdownProps {
  arrowPosition: number
  currentPanel: string
  isPanelOpen: boolean
  isPanelSwitched: boolean
  panels: NavigationMenuPanelType[]
}

function getDropdownTranslation(
  labelsMap: string[],
  activePanel: string,
  currentPanel: string,
): string {
  if (activePanel === currentPanel) return '0'
  else if (labelsMap.indexOf(currentPanel) > labelsMap.indexOf(activePanel)) return '-20%'
  else return '20%'
}

export function NavigationMenuDropdown({
  arrowPosition,
  currentPanel,
  isPanelOpen,
  isPanelSwitched,
  panels,
}: NavigationMenuDropdownProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number>(0)
  const [height, setHeight] = useState<number>(0)

  const labelsMap = panels.map((panel) => panel.label)

  useEffect(() => {
    if (ref.current) {
      setWidth(ref.current.offsetWidth)
      setHeight(ref.current.offsetHeight)
    }
  }, [currentPanel, isPanelOpen])

  return (
    <Flex
      sx={{
        opacity: isPanelOpen ? 1 : 0,
        pointerEvents: isPanelOpen ? 'auto' : 'none',
        transition: 'opacity 200ms',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '100%',
          left: '-7px',
          mt: '-6px',
          transform: isPanelOpen ? 'translateY(0)' : 'translateY(20px)',
          transition: 'transform 200ms',
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            width: '14px',
            height: '14px',
            borderRadius: 2,
            bg: 'neutral10',
            transform: `translateX(${arrowPosition}px) scaleY(1.3) rotate(45deg)`,
            ...(isPanelSwitched && { transition: 'transform 200ms' }),
          }}
        />
      </Box>
      <Flex
        sx={{
          position: 'absolute',
          top: '100%',
          left: '-100%',
          right: '-100%',
          justifyContent: 'center',
          transform: isPanelOpen ? 'translateY(0)' : 'translateY(-5px)',
          transition: 'transform 200ms',
          pointerEvents: 'none',
        }}
      >
        <Flex
          sx={{
            position: 'relative',
            p: 4,
            borderRadius: 'large',
            bg: 'neutral10',
            boxShadow: 'buttonMenu',
            pointerEvents: 'auto',
            overflow: 'hidden',
          }}
        >
          <Flex
            sx={{
              flexDirection: 'column',
              ...(width > 0 && { width }),
              ...(height > 0 && { height }),
              ...(isPanelSwitched && { transition: 'width 200ms, height 200ms' }),
            }}
          >
            {panels.map(({ description, label, learn, links, otherAssets }, i) => (
              <Flex sx={{ ml: '-100%', transform: 'translateX(50%)' }}>
                <Flex
                  key={i}
                  sx={{
                    position: 'absolute',
                    flexDirection: 'column',
                    rowGap: 4,
                    // ml: '100%',
                    ...(isPanelSwitched && { transition: 'opacity 200ms, transform 200ms' }),
                    ...(currentPanel === label
                      ? { opacity: 1, pointerEvents: 'auto' }
                      : { opacity: 0, pointerEvents: 'none' }),
                    transform: `translateX(${getDropdownTranslation(
                      labelsMap,
                      label,
                      currentPanel,
                    )})`,
                  }}
                  {...(currentPanel === label && { ref })}
                >
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
                      <Text
                        as="p"
                        sx={{ fontSize: '14px', color: 'neutral80', lineHeight: '22px' }}
                      >
                        {description}
                      </Text>
                      {learn && (
                        <AppLink href={learn.link}>
                          <WithArrow
                            gap={1}
                            sx={{ display: 'inline-block', ...getAjnaWithArrowColorScheme() }}
                          >
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
                    {links.map(({ icon, footnote, link, title }, i) => (
                      <Flex key={i} as="li" sx={{ flexGrow: 1, flexBasis: 0 }}>
                        <AppLink
                          href={link}
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
                            <Text
                              as="p"
                              sx={{ fontSize: 2, color: 'neutral80', whiteSpace: 'nowrap' }}
                            >
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
                        Other assets you can borrow against
                      </Heading>
                      <Flex as="ul" sx={{ columnGap: 3, rowGap: 2, listStyle: 'none', p: 0 }}>
                        {otherAssets.map(({ link, token }, i) => (
                          <Box key={i} as="li">
                            <AssetPill
                              icon={getToken(token).iconCircle}
                              label={token}
                              link={link}
                            />
                          </Box>
                        ))}
                      </Flex>
                    </Box>
                  )}
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}
