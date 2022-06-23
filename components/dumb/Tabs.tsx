import { useHash } from 'helpers/useHash'
import React, { useEffect, useState } from 'react'
import { Flex, Grid, Button, Box } from 'theme-ui'

type TabSection = {
  hash: string,
  label: JSX.Element | string,
  content: JSX.Element
}

export function UnderlineTabs({ sections } : { sections: TabSection[] }) {
  const [hash, setHash] = useHash<string>()
  const [mode, setMode] = useState<string>(hash || sections[0].hash)

  useEffect(() => {
    setHash(mode)
  }, [mode])

  return <Grid gap={0} sx={{ width: '100%', mt: 4 }}>
    <Flex
      sx={{
        borderBottom: '3px solid',
        borderColor: 'rgba(37, 39, 61, 0.1)',
        width: '100%',
        mb: 4,
      }}
    >
      {sections.map(({hash, label}) => <Button key={hash} variant={mode === hash ? 'vaultTabActive' : 'vaultTab'} onClick={() => {setMode(hash)}}>
        {label}
      </Button>)}
    </Flex>
    <Box sx={{ zIndex: 1 }}>
      {sections.find(s => { return `#${s.hash}` == hash; console.log('current hash:', hash, 'section hash', s.hash)})?.content}
    </Box>
  </Grid>
}