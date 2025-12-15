import { describe, expect, it } from 'vitest'
import { parseClipboardData, stripJsonComments } from '../src/utils'

describe('parseClipboardData', () => {
  it('strips JSONC comments', () => {
    const input = `{
      // comment
      "a": 1, /* block */
      "b": 2,
    }`
    expect(stripJsonComments(input).includes('comment')).toBe(false)
  })

  it('parses JSON with comments', () => {
    const input = `{
      // comment
      "a": 1,
      "b": [1, 2, 3,],
    }`
    expect(parseClipboardData(input)).toEqual({ a: 1, b: [1, 2, 3] })
  })

  it('parses JS object literal (single quotes + unquoted keys)', () => {
    const input = `{ a: 'x', b: true, c: null, d: undefined }`
    expect(parseClipboardData(input)).toEqual({ a: 'x', b: true, c: null, d: undefined })
  })

  it('parses const assignment', () => {
    const input = `const data = { a: 1, b: { c: 2 } };`
    expect(parseClipboardData(input)).toEqual({ a: 1, b: { c: 2 } })
  })

  it('does not execute expressions', () => {
    const input = `(() => { throw new Error('boom') })()`
    expect(parseClipboardData(input)).toBeUndefined()
  })
})
