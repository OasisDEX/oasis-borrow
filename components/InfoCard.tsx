import { Card, Flex, Grid, Heading, Image, SxStyleProp, Text } from 'theme-ui'
import { staticFilesRuntimeUrl } from '../helpers/staticPaths'
export function InfoCard() {
  return (
    <Card
      sx={{
        border: 'unset',
        background: 'linear-gradient(127.5deg, #EEE1F9 0%, #FFECE8 56.77%, #DDFFF7 100%)',
        backgroundImage: `url(${staticFilesRuntimeUrl('/static/img/info_cards/cubes_nov27.png')})`,
      }}
    >
      hey hey
    </Card>
  )
}
