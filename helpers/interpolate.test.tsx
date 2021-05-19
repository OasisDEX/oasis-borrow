import { expect } from 'chai'
import { render } from 'enzyme'
import React from 'react'

import { interpolate } from './interpolate'

describe('Interpolate', () => {
  it('should parse string without any components', () => {
    const result = interpolate('plain text', {})
    const wrapper = render(<div>{result}</div>)

    expect(wrapper.text()).to.eq('plain text')
  })

  it('should be able to return single component', () => {
    const result = interpolate('<0>inside</0>', {
      '0': ({ children }) => <div>{children}</div>,
    })
    const wrapper = render(<div>{result}</div>)

    expect(wrapper.html()).to.eq('<div>inside</div>')
  })

  it('should wrap text with provided component', () => {
    const result = interpolate('start <0>inside</0>', {
      '0': ({ children }) => <div>{children}</div>,
    })
    const wrapper = render(<div>{result}</div>)

    expect(wrapper.html()).to.eq('start <div>inside</div>')
  })

  it('should be able parse starting with wrapped component', () => {
    const result = interpolate('<0>inside</0>end', {
      '0': ({ children }) => <div>{children}</div>,
    })
    const wrapper = render(<div>{result}</div>)

    expect(wrapper.html()).to.eq('<div>inside</div>end')
  })

  it('should be able to wrap more than one group', () => {
    const result = interpolate('start <0>inside</0> out <0>inside</0> end', {
      '0': ({ children }) => <div>{children}</div>,
    })
    const wrapper = render(<div>{result}</div>)

    expect(wrapper.html()).to.eq('start <div>inside</div> out <div>inside</div> end')
  })

  it('should be able to wrap with multiple components', () => {
    const result = interpolate('start <0>inside</0> out <1>inside</1>', {
      '0': ({ children }) => <div className="test_0">{children}</div>,
      '1': ({ children }) => <div className="test_1">{children}</div>,
    })
    const wrapper = render(<div>{result}</div>)

    expect(wrapper.html()).to.eq(
      'start <div class="test_0">inside</div> out <div class="test_1">inside</div>',
    )
  })

  it('should handle special characters', () => {
    const result = interpolate('start <0><0.001 WBTC</0> out <0>inside</0> end', {
      '0': ({ children }) => <div>{children}</div>,
    })
    const wrapper = render(<div>{result}</div>)
    // in the viewport &lt; will be displayed ad >
    // this was the primary reason behind implementation of interpolate function
    // <Trans /> from i18n do not handle > < characters when interpolating components
    expect(wrapper.html()).to.eq('start <div>&lt;0.001 WBTC</div> out <div>inside</div> end')
  })

  it('should handle undefined components', () => {
    const result = interpolate('<0> in </0>', {})
    const wrapper = render(<div>{result}</div>)
    expect(wrapper.html()).to.eq('<span> in </span>')
  })
})
