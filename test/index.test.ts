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
  const dataEmptyArray: any[] = []

  const data7 = ['123', 123]
  const data8 = [{ a: 1 }, { b: 'x' }]
  const data9 = { maybe: null }
  it('data1', () => {
    expect(getType(data1)).toMatchInlineSnapshot('"{ name: string; }"')
  })

  it('data2', () => {
    expect(getType(data2)).toMatchInlineSnapshot('"{ name: string; data: { name: string; age: number; }[]; }"')
  })

  it('data3', () => {
    expect(getType(data3)).toMatchInlineSnapshot('"number"')
  })

  it('data4', () => {
    expect(getType(data4)).toMatchInlineSnapshot('"string"')
  })

  it('data5', () => {
    expect(getType(data5)).toMatchInlineSnapshot('"{ get: Function; }"')
  })

  it('data6', () => {
    expect(getType(data6)).toMatchInlineSnapshot('"string[]"')
  })

  it('dataEmptyArray', () => {
    expect(getType(dataEmptyArray)).toMatchInlineSnapshot('"unknown[]"')
  })

  it('data7', () => {
    expect(getType(data7)).toMatchInlineSnapshot('"(string | number)[]"')
  })

  it('data8', () => {
    expect(getType(data8)).toMatchInlineSnapshot('"({ a: number; } | { b: string; })[]"')
  })

  it('data9', () => {
    expect(getType(data9)).toMatchInlineSnapshot('"{ maybe: null; }"')
  })
})
