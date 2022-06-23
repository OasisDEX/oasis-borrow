import { useHash } from 'helpers/useHash'
import React, { useEffect } from 'react'
import { Flex, Grid, Button, Box } from 'theme-ui'

type TabSection = {
  hash: string,
  label: JSX.Element | string,
  content: JSX.Element
}



export function UnderlineTabs({ sections } : { sections: TabSection[] }) {
  const [currentHash, setHash] = useHash<string>()

  useEffect(() => setHash(sections[0].hash), [])

  function isCurrentHash(sectionHash: string) {
    return `#${sectionHash}` === currentHash
  }

  return <Grid gap={0} sx={{ width: '100%', mt: 4 }}>
    <Flex
      sx={{
        borderBottom: '3px solid',
        borderColor: 'rgba(37, 39, 61, 0.1)',
        width: '100%',
        mb: 4,
      }}
    >
      {sections.map(({hash, label}) => <Button 
        key={hash} 
        variant={isCurrentHash(hash) ? 'vaultTabActive' : 'vaultTab'} 
        onClick={() => {setHash(hash)}}
      >
        {label}
      </Button>)}
    </Flex>
    <Box sx={{ zIndex: 1 }}>
      {sections.find(s => isCurrentHash(s.hash))?.content}
    </Box>
  </Grid>
}