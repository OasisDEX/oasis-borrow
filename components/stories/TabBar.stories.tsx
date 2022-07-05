import { TabBar } from 'components/TabBar'
import React from 'react'

const sections = [
  {
    value: 'overview',
    label: 'Overview',
    content: <></>,
  },
  {
    value: 'protection',
    label: 'Protection',
    tag: {
      include: true,
      active: false,
    },
    content: <></>,
  },
  {
    value: 'optimization',
    label: 'Optimization',
    tag: {
      include: true,
      active: true,
    },
    content: <></>,
  },
  {
    value: 'vault-info',
    label: 'Vault Info',
    content: <></>,
  },
]

export const LargeTabBar = () => {
  return <TabBar variant="large" sections={sections} />
}

export const MediumTabBar = () => {
  return <TabBar variant="medium" sections={sections} />
}

export const SmallTabBar = () => {
  return <TabBar variant="small" sections={sections} />
}

export const UnderlineTabBar = () => {
  return <TabBar variant="underline" sections={sections} />
}

// eslint-disable-next-line import/no-default-export
export default {
  title: 'TabBar',
}
