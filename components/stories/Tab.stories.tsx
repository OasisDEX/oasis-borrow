import { Tab } from 'components/Tab'
import React from 'react'

export const Large = () => {
  return <Tab variant="large" label="Tab" value="Tab" onClick={() => null} />
}

export const LargeSelected = () => {
  return <Tab variant="large" label="Tab" value="Tab" selected onClick={() => null} />
}

export const Medium = () => {
  return <Tab variant="medium" label="Tab" value="Tab" onClick={() => null} />
}

export const MediumSelected = () => {
  return <Tab variant="medium" label="Tab" value="Tab" selected onClick={() => null} />
}

export const Small = () => {
  return <Tab variant="small" label="Tab" value="Tab" onClick={() => null} />
}

export const SmallSelected = () => {
  return <Tab variant="small" label="Tab" value="Tab" selected onClick={() => null} />
}

export const Underline = () => {
  return <Tab variant="underline" label="Tab" value="Tab" onClick={() => null} />
}

export const UnderlineWithTag = () => {
  return (
    <Tab
      variant="underline"
      label="Tab"
      value="Tab"
      tag={{
        include: true,
        active: false,
      }}
      onClick={() => null}
    />
  )
}

export const UnderlineSelected = () => {
  return <Tab variant="underline" label="Tab" value="Tab" selected onClick={() => null} />
}

export const UnderlineSelectedWithTag = () => {
  return (
    <Tab
      variant="underline"
      label="Tab"
      value="Tab"
      selected
      tag={{
        include: true,
        active: true,
      }}
      onClick={() => null}
    />
  )
}

// eslint-disable-next-line import/no-default-export
export default {
  title: 'Tab',
}
