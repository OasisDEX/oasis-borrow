import { Icon } from '@makerdao/dai-ui-icons'
import React, { ReactNode, useState } from 'react'
import { Box, Button, Flex, Text } from 'theme-ui'

import { TokenSelect } from './TokenSelect'

interface TokenTabsProps {
  tabs: { name: string; icon: string }[]
  children: (token: string) => ReactNode
}

export function TokenTabs({ tabs, children }: TokenTabsProps) {
  const [currentTab, setCurrentTab] = useState(tabs[0].name)
  const [hover, setHover] = useState('')

  function handleTabClick(token: string) {
    setCurrentTab(token)
  }

  function handleSelectChange(tab: string) {
    setCurrentTab(tab)
  }

  function handleHover(tab: string) {
    console.log(tab)
    setHover(tab)
  }

  return (
    <>
      <Box sx={{ display: ['none', 'block'] }}>
        <Flex sx={{ justifyContent: 'space-around', mb: 4 }}>
          {tabs.map((tab) => {
            return (
              <Button variant="unStyled" onClick={() => handleTabClick(tab.name)} key={tab.name}>
                <Flex
                  sx={{ flexDirection: 'column', alignItems: 'center' }}
                  onMouseEnter={() => handleHover(tab.name)}
                  onMouseLeave={() => handleHover('')}
                >
                  <Icon
                    name={
                      tab.icon +
                      `_${tab.name === currentTab || hover === tab.name ? 'color' : 'mono'}`
                    }
                    size="32px"
                    sx={{ verticalAlign: 'sub' }}
                  />
                  <Text variant="paragraph2" sx={{ fontWeight: 'semiBold' }}>
                    {tab.name}
                  </Text>
                </Flex>
              </Button>
            )
          })}
        </Flex>
      </Box>
      <Flex sx={{ width: '100%', justifyContent: 'center', display: ['block', 'none'], mb: 3 }}>
        <TokenSelect tabs={tabs} handleChange={handleSelectChange} />
      </Flex>

      {children(currentTab)}
    </>
  )
}
