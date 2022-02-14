import { ComponentStory } from '@storybook/react'
import BigNumber from 'bignumber.js'
import React from 'react'

import { VaultHeader, VaultIlkDetailsItem } from './VaultHeader'

export default {
  title: 'Vault Header',
  component: VaultHeader,
}

const Template: ComponentStory<typeof VaultHeader> = (args) => <VaultHeader {...args} />

export const JustOneItem = Template.bind({})
JustOneItem.args = {
  header: 'Vault Header',
  id: new BigNumber(12345),
  children: [<VaultIlkDetailsItem label="label" value="value" tooltipContent="tooltip content" />],
}

export const ManyItems = Template.bind({})
ManyItems.args = {
  header: "Really long title institutional vault yes let's keep it going",
  id: new BigNumber(12345),
  children: [
    <VaultIlkDetailsItem label="label" value="value" tooltipContent="tooltip content" />,
    <VaultIlkDetailsItem label="label" value="value" tooltipContent="tooltip content" />,
    <VaultIlkDetailsItem label="label" value="value" tooltipContent="tooltip content" />,
    <VaultIlkDetailsItem label="label" value="value" tooltipContent="tooltip content" />,
    <VaultIlkDetailsItem label="label" value="value" tooltipContent="tooltip content" />,
  ],
}
