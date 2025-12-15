<p align="center">
<img height="200" src="./assets/kv.png" alt="to ts type">
</p>
<p align="center"> English | <a href="./README_zh.md">简体中文</a></p>

Convert the data results of `copy` to `ts` type. You can directly copy the structure defined by the backend or the requested json into obj, and then use the shortcut keys to convert it into a type. This way you will get a good type hint when writing front-end code.

![demo](/assets/demo.gif)

Notes:
- Supports JSON with `//` and `/* */` comments, and simple JS object literals.
- Clipboard parsing is safe (does not execute code). If parsing fails, it falls back to `string`.

## Keybindings
- `ctrl+alt+t` or `cmd+alt+t` -> `to ts type`

## :coffee:

[buy me a cup of coffee](https://github.com/Simon-He95/sponsor)

## License

[MIT](./license)

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/Simon-He95/sponsor/sponsors.svg">
    <img src="https://cdn.jsdelivr.net/gh/Simon-He95/sponsor/sponsors.png"/>
  </a>
</p>
