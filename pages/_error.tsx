import type { NextPage } from 'next'
import type { ErrorProps } from 'next/error'
import NextErrorComponent from 'next/error'
import React from 'react'

const CustomErrorComponent: NextPage<ErrorProps> = (props) => (
  <NextErrorComponent statusCode={props.statusCode} />
)

CustomErrorComponent.getInitialProps = async (contextData) => {
  // This will contain the status code of the response
  return NextErrorComponent.getInitialProps(contextData)
}

export default CustomErrorComponent
