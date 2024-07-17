import { createExtension, getCopyText, getSelection, nextTick, registerCommand, setSelection, updateText } from '@vscode-use/utils'
import { Position } from 'vscode'
import { useJSONParse } from 'lazy-js-utils'
import { getBeforeFirstNotSpaceChar, getType } from './utils'

export = createExtension(() => {
  return [
    registerCommand('to-ts-type.transform', async () => {
      const text = await getCopyText()
      if (!text)
        return
      // text 需要过滤 一些注释比如// 或者 /** */
      let obj
      try {
        obj = useJSONParse(text)
      }
      catch (error) {
        console.error(error)
      }

      const type = getType(obj) || getType(text)
      const { line, character, lineText } = getSelection()!
      const beforeChar = getBeforeFirstNotSpaceChar(lineText, character)

      let insertText = ''
      if (beforeChar === '(') {
        insertText = `<${type}>`
      }
      else if (/[:<=]/.test(beforeChar)) {
        insertText = type
      }
      else if (beforeChar) {
        insertText = `: ${type}`
      }
      else {
        insertText = `type IType = ${type}`
        nextTick(() => {
          setSelection([line, character + 'type '.length], [line, character + 'type IType'.length])
        })
      }
      updateText((edit) => {
        edit.insert(new Position(line, character), insertText)
      })
    }),
  ]
})
