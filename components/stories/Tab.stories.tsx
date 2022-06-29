import { Tab } from 'components/Tab'
import React from 'react'

const section = {
  label: 'Tab',
  value: 'Tab',
}

const hash = `#${section.label}`

export const Large = () => {
  return <Tab variant="large" section={section} hash={''} onClick={() => null} />
}

export const LargeActive = () => {
  return <Tab variant="large" section={section} hash={hash} onClick={() => null} />
}

export const Medium = () => {
  return <Tab variant="medium" section={section} hash={''} onClick={() => null} />
}

export const MediumActive = () => {
  return <Tab variant="medium" section={section} hash={hash} onClick={() => null} />
}

export const Small = () => {
  return <Tab variant="small" section={section} hash={''} onClick={() => null} />
}

export const SmallActive = () => {
  return <Tab variant="small" section={section} hash={hash} onClick={() => null} />
}

export const Underline = () => {
  return <Tab variant="underline" section={section} hash={''} onClick={() => null} />
}

export const UnderlineWithTag = () => {
  return (
    <Tab
      variant="underline"
      section={section}
      hash={''}
      tag={{
        include: true,
        active: false,
      }}
      onClick={() => null}
    />
  )
}

export const UnderlineActive = () => {
  return <Tab variant="underline" section={section} hash={hash} onClick={() => null} />
}

export const UnderlineActiveWithTag = () => {
  return (
    <Tab
      variant="underline"
      section={section}
      hash={hash}
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
