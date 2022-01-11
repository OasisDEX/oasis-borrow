// in theory this is available within 0.1.3 version but eventually types folder is missing within package
declare module 'react-jazzicon' {
  import * as React from 'react'

  type JazziconProps = {
    diameter?: number
    paperStyles?: object
    seed?: number
    svgStyles?: object
  }

  const Jazzicon: React.FunctionComponent<JazziconProps>

  export function jsNumberForAddress(address: string): number

  // eslint-disable-next-line import/no-default-export
  export default Jazzicon
}
