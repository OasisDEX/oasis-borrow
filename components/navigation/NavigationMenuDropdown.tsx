import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { AssetPill } from 'components/AssetPill'
import { AppLink } from 'components/Links'
import { NavigationMenuPanelType } from 'components/navigation/NavigationMenuPanel'
import { WithArrow } from 'components/WithArrow'
import { getAjnaWithArrowColorScheme } from 'features/ajna/common/helpers'
import React from 'react'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

export interface NavigationMenuDropdownProps {
  arrowPosition: number
  currentPanel?: string
  isPanelOpen: boolean
  isPanelSwitched: boolean
  panels: NavigationMenuPanelType[]
}

export function NavigationMenuDropdown({
  arrowPosition,
  currentPanel,
  isPanelOpen,
  isPanelSwitched,
  panels,
}: NavigationMenuDropdownProps) {
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
          mt: '10px',
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
          left: '-500px',
          right: '-500px',
          justifyContent: 'center',
          pt: 3,
          transform: isPanelOpen ? 'translateY(0)' : 'translateY(-5px)',
          transition: 'transform 200ms',
        }}
      >
        <Flex
          sx={{
            flexDirection: 'column',
            rowGap: 4,
            borderRadius: 'large',
            bg: 'neutral10',
            boxShadow: 'buttonMenu',
            p: 4,
          }}
        >
          {panels.map(({ description, label, learn, links, otherAssets }) => (
            <>
              {currentPanel === label && (
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
                    <Text as="p" sx={{ fontSize: '14px', color: 'neutral80' }}>
                      {description}{' '}
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
                    </Text>
                  </Box>
                  <Grid
                    as="ul"
                    sx={{
                      gap: 4,
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      p: '0',
                      listStyle: 'none',
                    }}
                  >
                    {links.map(({ icon, footnote, link, title }) => (
                      <Flex as="li">
                        <AppLink
                          href={link}
                          sx={{ display: 'flex', alignItems: 'center', fontWeight: 'regular' }}
                        >
                          <Icon size={48} name={icon} sx={{ flexShrink: 0 }} />
                          <Flex sx={{ flexDirection: 'column', ml: 3 }}>
                            <Text
                              as="span"
                              sx={{ fontSize: 4, fontWeight: 'semiBold', color: 'primary100' }}
                            >
                              {title}
                            </Text>
                            <Text as="span" sx={{ fontSize: 2, color: 'neutral80' }}>
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
                      <Flex
                        as="ul"
                        sx={{ flexWrap: 'wrap', columnGap: 3, rowGap: 2, listStyle: 'none', p: 0 }}
                      >
                        {otherAssets.map(({ link, token }) => (
                          <Box as="li">
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
                </>
              )}
            </>
          ))}
        </Flex>
      </Flex>
    </Flex>
  )
}
