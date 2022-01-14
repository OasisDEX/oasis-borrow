import React, { MouseEvent, ReactNode, useCallback, useState } from 'react'
import { Box, Button, Flex, Grid, SxStyleProp } from 'theme-ui'
import ReactSelect from 'react-select'
import { Icon } from '@makerdao/dai-ui-icons'

type ArrayWithAtLeastOne<T> = {
  0: T
} & Array<T>

type TabSwitcherTab = {
  tabLabel: string
  tabContent: ReactNode
}

export function TabSwitcher(props: {
  tabs: ArrayWithAtLeastOne<TabSwitcherTab>
  narrowTabsSx: SxStyleProp
  wideTabsSx: SxStyleProp
}) {
  const [selectedTab, setSelectedTab] = useState('0')

  const selectTab = useCallback(
    (event: MouseEvent<HTMLButtonElement>) =>
      setSelectedTab((event.currentTarget.value as unknown) as string),
    [],
  )

  const WideTabSelector = () => {
    return (
      <Grid columns={props.tabs.length} variant="tabSwitcher" sx={props.wideTabsSx}>
        {props.tabs.map(({ tabLabel }, index) => {
          return (
            <Button
              key={index}
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
    )
  }

  const NarrowTabSelector = () => {
    return (
      <Box sx={props.narrowTabsSx}>
        <ReactSelect
          value={{
            value: parseInt(selectedTab),
            label: props.tabs[parseInt(selectedTab)].tabLabel,
          }}
          options={props.tabs.map(({ tabLabel }, index) => ({ label: tabLabel, value: index }))}
          onChange={(option) =>
            option && 'value' in option && setSelectedTab(option.value.toString())
          }
          components={{
            IndicatorsContainer: ({ selectProps: { menuIsOpen } }) => (
              <Flex
                sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  mr: 3,
                  transform: `rotate(${menuIsOpen ? '180deg' : 0})`,
                  transition: 'transform 0.2s ease-in-out',
                }}
              >
                <Icon name="chevron" />
              </Flex>
            ),
            Control: ({ children, innerProps }) => (
              <Flex
                sx={{
                  border: 'light',
                  px: 2,
                  py: 3,
                  borderRadius: 'medium',
                  cursor: 'pointer',
                  background: 'white',
                }}
                {...innerProps}
              >
                {children}
              </Flex>
            ),
          }}
        />
      </Box>
    )
  }

  return (
    <Flex
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <NarrowTabSelector />
      <WideTabSelector />
      {props.tabs[parseInt(selectedTab)].tabContent}
    </Flex>
  )
}
