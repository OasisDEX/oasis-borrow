import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { Icon } from 'components/Icon'
import { useToggle } from 'helpers/useToggle'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React, { Fragment } from 'react'
import { close, dots_v, exchange, plus } from 'theme/icons'
import { Button, Flex, Text } from 'theme-ui'

const IconWrapper: FC = ({ children }) => (
  <Flex
    sx={{
      backgroundColor: 'neutral30',
      width: '34px',
      height: '34px',
      borderRadius: 'round',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </Flex>
)

const list = [
  {
    label: 'refinance.sidebar.whats-changing.route.item-1',
    iconSize: 13,
    icon: close,
  },
  {
    label: 'refinance.sidebar.whats-changing.route.item-2',
    iconSize: 20,
    icon: exchange,
  },
  {
    label: 'refinance.sidebar.whats-changing.route.item-3',
    iconSize: 25,
    icon: plus,
  },
]

export const RefinanceRouteSection = () => {
  const { t } = useTranslation()

  const [isBreakdownOpen, toggleIsBreakdownOpen] = useToggle(false)

  return (
    <Flex sx={{ flexDirection: 'column' }}>
      <Button
        variant="unStyled"
        onClick={toggleIsBreakdownOpen}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          alignItems: 'center',
        }}
      >
        <Text variant="paragraph4" sx={{ color: 'neutral80' }}>
          {t('system.route')}
        </Text>
        <ExpandableArrow direction={isBreakdownOpen ? 'up' : 'down'} sx={{ ml: 2, mb: '1px' }} />
      </Button>
      {isBreakdownOpen && (
        <Flex
          sx={{
            p: 3,
            flexDirection: 'column',
          }}
        >
          <Text variant="paragraph4" sx={{ color: 'neutral80', mb: 3 }}>
            {t('refinance.sidebar.whats-changing.route.title')}
          </Text>
          <Flex sx={{ flexDirection: 'column', alignItems: 'flex-start', rowGap: 2 }}>
            {list.map((item, i) => (
              <Fragment key={i}>
                <Flex sx={{ alignItems: 'center', gap: 2 }}>
                  <IconWrapper>
                    <Icon icon={item.icon} size={item.iconSize} />
                  </IconWrapper>
                  <Text variant="paragraph4" sx={{ color: 'neutral80' }}>
                    {t(item.label)}
                  </Text>
                </Flex>
                {list.length > i + 1 && (
                  <Icon icon={dots_v} size={13} color="neutral20" sx={{ ml: '10px' }} />
                )}
              </Fragment>
            ))}
          </Flex>
        </Flex>
      )}
    </Flex>
  )
}
