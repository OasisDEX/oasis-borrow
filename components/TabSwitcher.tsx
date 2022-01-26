import { Icon } from '@makerdao/dai-ui-icons'
import React, { MouseEvent, ReactNode, useCallback, useState } from 'react'
import ReactSelect from 'react-select'
import { Box, Button, Flex, Grid, SxStyleProp } from 'theme-ui'

import { slideInAnimation } from '../theme/animations'

type ArrayWithAtLeastOne<T> = {
  0: T
} & Array<T>

type TabSwitcherTab = {
  tabLabel: string
  tabContent: ReactNode
}

const WideTabSelector = (props: {
  tabs: ArrayWithAtLeastOne<TabSwitcherTab>
  wideTabsSx: SxStyleProp
  selectedTab: string
  selectTab: (event: MouseEvent<HTMLButtonElement>) => void
}) => {
  return (
    <Grid columns={props.tabs.length} variant="tabSwitcher" sx={props.wideTabsSx}>
      {props.tabs.map(({ tabLabel }, index) => {
        return (
          <Button
            key={tabLabel}
            onClick={props.selectTab}
            value={index}
            variant={
              props.selectedTab === index.toString()
                ? 'tabSwitcherTabActive'
                : 'tabSwitcherTabInactive'
            }
          >
            {tabLabel}
          </Button>
        )
      })}
    </Grid>
  )
}

const NarrowTabSelector = (props: {
  narrowTabsSx: SxStyleProp
  selectedTab: string
  tabs: ArrayWithAtLeastOne<TabSwitcherTab>
  setSelectedTab: (tab: string) => void
}) => {
  return (
    <Box sx={props.narrowTabsSx}>
      <ReactSelect
        value={{
          value: parseInt(props.selectedTab),
          label: props.tabs[parseInt(props.selectedTab)].tabLabel,
        }}
        options={props.tabs.map(({ tabLabel }, index) => ({ label: tabLabel, value: index }))}
        onChange={(option) =>
          option && 'value' in option && props.setSelectedTab(option.value.toString())
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
              <Icon name="chevron_down" />
            </Flex>
          ),
          Control: ({ children, innerProps }) => (
            <Flex
              sx={{
                border: 'light',
                px: 2,
                py: 2,
                borderRadius: 'medium',
                cursor: 'pointer',
                background: 'white',
                fontWeight: 'semiBold',
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

  return (
    <Flex
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <NarrowTabSelector
        selectedTab={selectedTab}
        tabs={props.tabs}
        setSelectedTab={setSelectedTab}
        narrowTabsSx={props.narrowTabsSx}
      />
      <WideTabSelector
        wideTabsSx={props.wideTabsSx}
        selectTab={selectTab}
        selectedTab={selectedTab}
        tabs={props.tabs}
      />
      {props.tabs.map(({ tabLabel, tabContent }) => (
        <Box
          key={tabLabel}
          sx={{
            ...slideInAnimation,
            display: tabLabel === props.tabs[parseInt(selectedTab)].tabLabel ? 'block' : 'none',
            width: '100%',
          }}
        >
          {tabContent}
        </Box>
      ))}
    </Flex>
  )
}
