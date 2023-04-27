import { render } from '@testing-library/react'
import React from 'react'

import { interpolate } from './interpolate'

describe('Interpolate', () => {
  it('should parse string without any components', () => {
    const result = interpolate('plain text', {})
    const { container } = render(<div>{result}</div>)

    expect(container).toHaveTextContent('plain text')
  })

  it('should be able to return single component', () => {
    const result = interpolate('<0>inside</0>', {
      '0': ({ children }) => <div>{children}</div>,
    })
    const { container } = render(<div>{result}</div>)

    expect(container).toHaveTextContent('inside')
  })

  it('should wrap text with provided component', () => {
    const result = interpolate('start <0>inside</0>', {
      '0': ({ children }) => <div>{children}</div>,
    })
    const { container } = render(<div>{result}</div>)

    expect(container).toHaveTextContent('start inside')
  })

  it('should be able parse starting with wrapped component', () => {
    const result = interpolate('<0>inside</0>end', {
      '0': ({ children }) => <div>{children}</div>,
    })
    const { container } = render(<div>{result}</div>)

    expect(container).toHaveTextContent('insideend')
  })

  it('should be able to wrap more than one group', () => {
    const result = interpolate('start <0>inside</0> out <0>inside</0> end', {
      '0': ({ children }) => <div>{children}</div>,
    })
    const { container } = render(<div>{result}</div>)

    expect(container).toHaveTextContent('start inside out inside end')
  })

  it('should be able to wrap with multiple components', () => {
    const result = interpolate('start <0>inside</0> out <1>inside</1>', {
      '0': ({ children }) => <div className="test_0">{children}</div>,
      '1': ({ children }) => <div className="test_1">{children}</div>,
    })
    const { getAllByText } = render(<div>{result}</div>)

    const allElements = getAllByText('inside')

    expect(allElements).toHaveLength(2)
    expect(allElements[0]).toHaveClass('test_0')
    expect(allElements[1]).toHaveClass('test_1')
  })

  it('should handle undefined components', () => {
    const result = interpolate('<0> in </0>', {})
    const { container } = render(<div>{result}</div>)
    expect(container).toHaveTextContent('in')
  })
})
