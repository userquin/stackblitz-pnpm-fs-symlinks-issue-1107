import './styles.css'
import 'xterm/css/xterm.css'
import { load } from './setup-container.ts'

document.querySelector('#app')!.innerHTML = `
    <header>
      <h1>@webcontainer/api filesystem repro - Issue 1107</h1>
    </header>
    <div>
      <h2>Reproduction</h2>
      <ol>
        <li>Run <pre>pnpm install</pre> in the terminal once dev server started.</li>
        <li>Run <pre>ls -l node_modules</pre>, you'll see the packages (some with symlinks created by PNPM) and <pre>.pnpm</pre> folder.</li>
        <li>Run <pre>ls -l node_modules/vite</pre>, you won't see any file.</li>
        <li>Click <pre>List Vite Folder</pre> button.</li>
        <li>You won't get any file when <pre>fs.readdir('/node_modules/vite', { withFileTypes: true })</pre> is called.</pre>.</li>
      </ol>
      <button id="button" disabled>List Vite Folder</button>
    </div>
    <div>
      <h2>node_modules/vite content</h2>
      <ol id="node-modules"></ol>
    </div>
    <div>
      <h2>List Vite Folder Output</h2>
      <ol id="ls-l-command"></ol>
    </div>
    <div id="terminal" class="terminal"></div>
`

window.addEventListener('load', async () => {
  const button = document.querySelector<HTMLButtonElement>('#button')!
  const lsElement = document.querySelector<HTMLOListElement>('#ls-l-command')!
  const terminalElement = document.querySelector<HTMLDivElement>('#terminal')!

  const webContainerInstance = await load(terminalElement)

  button.removeAttribute('disabled')

  button.addEventListener('click', async () => {
    const files = await webContainerInstance.fs.readdir('/node_modules/vite', { withFileTypes: true })
    if (files.length) {
      lsElement.innerHTML = ''
      for (const file of files) {
        const li = document.createElement('li')
        li.textContent = `${file.name}${file.isDirectory() ? '/' : ''}`
        lsElement.appendChild(li)
      }
    }
    else {
      const entry = document.createElement('strong')
      entry.textContent = 'No files found in /node_modules/vite/'
      const li = document.createElement('li')
      li.appendChild(entry)
      lsElement.appendChild(li)
    }
  })
})
