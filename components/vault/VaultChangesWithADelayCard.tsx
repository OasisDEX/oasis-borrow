import { MessageCard } from 'components/MessageCard'
import React from 'react'

export function VaultChangesWithADelayCard() {
  return (
    <MessageCard
      {...{
        messages: ['Heads up! It can take up to 30 seconds for your Vault position to update.'],
        type: 'warning',
        withBullet: false,
      }}
    />
  )
}
