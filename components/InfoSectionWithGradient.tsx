import { InfoSection } from 'components/infoSection/InfoSection'
import type { ItemProps } from 'components/infoSection/Item'
import type { FC } from 'react'
import React from 'react'

interface InfoSectionWithGradientProps {
  items: ItemProps[]
  title: string
  gradient?: string
}

export const InfoSectionWithGradient: FC<InfoSectionWithGradientProps> = ({
  items,
  title,
  gradient = 'linear-gradient(48.37deg, rgba(252, 132, 91, 0.15) -7.41%, rgba(231, 167, 127, 0.15) 41.26%, rgba(0, 167, 217, 0.15) 100%)',
}) => {
  return (
    <InfoSection
      title={title}
      items={items}
      wrapperSx={{
        background: gradient,
        // TODO add fancy gradient border
        border: '1px solid',
        borderColor: 'transparent',
      }}
      itemWrapperSx={{ fontSize: 2 }}
    />
  )
}
