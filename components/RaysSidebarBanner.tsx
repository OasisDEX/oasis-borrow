import { Icon } from 'components/Icon'
import { getGradientColor } from 'helpers/getGradientColor'
import type { FC } from 'react'
import React from 'react'
import { clock_colorful, rays } from 'theme/icons'
import { Flex, Text } from 'theme-ui'

interface RaysSidebarBannerProps {
  title: string
  description?: string
  list?: string[]
  daysLeft?: string
  items?: { title: string; action: () => void }[]
}

export const RaysSidebarBanner: FC<RaysSidebarBannerProps> = ({
  title,
  description,
  daysLeft,
  items,
}) => {
  return (
    <Flex sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <Flex sx={{ flexDirection: 'column', rowGap: 2 }}>
        <Text
          as="p"
          variant="paragraph3"
          sx={{
            fontWeight: 'semiBold',
            ...getGradientColor(
              'linear-gradient(270.13deg, #007DA3 0.02%, #E7A77F 56.92%, #E97047 98.44%)',
            ),
            display: 'flex',
            alignItems: 'center',
            columnGap: 2,
          }}
        >
          <Flex sx={{ minWidth: '24px' }}>
            <Icon icon={rays} size={24} />
          </Flex>
          {title}
        </Text>
        {description && (
          <Text as="p" variant="paragraph3" color="neutral80" sx={{ mb: 2 }}>
            {description}
          </Text>
        )}
        {items && (
          <Flex sx={{ flexWrap: 'wrap', ml: 4, mb: 2 }}>
            {items.map((item) => (
              <Text
                key={item.title}
                as="p"
                variant="paragraph3"
                onClick={item.action}
                sx={{
                  fontWeight: 'semiBold',
                  cursor: 'pointer',
                  display: 'flex',
                  width: '50%',
                  color: 'neutral80',
                  '&:hover': {
                    color: 'primary100',
                  },
                }}
              >
                {item.title}
              </Text>
            ))}
          </Flex>
        )}
      </Flex>
      {daysLeft && (
        <Flex
          sx={{
            alignItems: 'center',
            backgroundColor: '#F2F3F4',
            paddingY: 2,
            paddingLeft: 2,
            paddingRight: 3,
            borderRadius: '100px',
            height: 'fit-content',
          }}
        >
          <Text
            variant="paragraph3"
            sx={{
              fontWeight: 'semiBold',
              ...getGradientColor(
                'linear-gradient(270.13deg, #007DA3 0.02%, #E7A77F 56.92%, #E97047 98.44%)',
              ),
              display: 'flex',
              alignItems: 'center',
              columnGap: '5px',
            }}
          >
            <Icon icon={clock_colorful} size={21} />
            {daysLeft} days left
          </Text>
        </Flex>
      )}
    </Flex>
  )
}
