import { describe, expect, it } from 'vitest'
import { getType } from '../src/utils'

describe('should', () => {
  const data1 = {
    name: 'simon',
  }
  const data2 = {
    name: 'simon',
    data: [{
      name: 'simon',
      age: 14,
    }],
  }
  const data3 = 1
  const data4 = '123'
  const data5 = {
    get() {
      return '123'
    },
  }
  const data6 = ['123']
  it('data1', () => {
    expect(getType(data1)).toMatchInlineSnapshot('"{\\"name\\":\\"string\\"}"')
  })

  it('data2', () => {
    expect(getType(data2)).toMatchInlineSnapshot('"{\\"name\\":\\"string\\",\\"data\\":\\"{\\\\\\"name\\\\\\":\\\\\\"string\\\\\\",\\\\\\"age\\\\\\":\\\\\\"number\\\\\\"}[]\\"}"')
  })

  it('data3', () => {
    expect(getType(data3)).toMatchInlineSnapshot('"number"')
  })

  it('data4', () => {
    expect(getType(data4)).toMatchInlineSnapshot('"string"')
  })

  it('data5', () => {
    expect(getType(data5)).toMatchInlineSnapshot('"{\\"get\\":\\"Function\\"}"')
  })

  it('data6', () => {
    expect(getType(data6)).toMatchInlineSnapshot('"string[]"')
  })
})
