import React, { MouseEvent, ReactNode, useCallback, useState } from 'react'
import { Button, Flex, Grid } from 'theme-ui'
import { SystemStyleObject } from '@styled-system/css'

type ArrayWithAtLeastOne<T> = {
  0: T
} & Array<T>

type TabSwitcherTab = {
  tabLabel: string
  tabContent: ReactNode
}

export function TabSwitcher(props: {
  tabs: ArrayWithAtLeastOne<TabSwitcherTab>
  tabsSx?: SystemStyleObject
}) {
  const [selectedTab, setSelectedTab] = useState('0')

  const selectTab = useCallback(
    (event: MouseEvent<HTMLButtonElement>) =>
      setSelectedTab((event.currentTarget.value as unknown) as string),
    [],
  )

  return (
    <Flex
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Grid columns={props.tabs.length} variant="tabSwitcher">
        {props.tabs.map(({ tabLabel }, index) => {
          return (
            <Button
              onClick={selectTab}
              value={index}
              variant={
                selectedTab === index.toString() ? 'tabSwitcherTabActive' : 'tabSwitcherTabInactive'
              }
            >
              {tabLabel}
            </Button>
          )
        })}
      </Grid>
      {props.tabs[parseInt(selectedTab)].tabContent}
    </Flex>
  )
}
