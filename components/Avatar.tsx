import React from 'react'
import { Image } from 'theme-ui'

export function Avatar({ image, ...props }: any) {
  return <Image variant="avatar" src={image} {...props} />
}

export function AvatarSimple(image: string) {
  return <Avatar image={image} />
}
