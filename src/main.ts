import './styles.css'
import 'xterm/css/xterm.css'
import { installDependencies, load } from './setup-container.ts'

document.querySelector('#app')!.innerHTML = `
    <header>
      <h1>@webcontainer/api filesystem repro - Issue 1107</h1>
    </header>
    <div>
      <h2>Reproduction</h2>
      <ol>
        <li>Run <pre>pnpm install</pre> in the terminal once dev server started.</li>
        <li>Run <pre>ls -l node_modules</pre>, you'll see the packages (some with symlinks created by PNPM) and <pre>.pnpm</pre> folder.</li>
        <li>Write <pre>ls -l node_modules</pre> and press additional slash, the content will be displayed (do not press ENTER).</li>
        <li>Click <pre>List Vite Folder</pre> button.</li>
        <li>You will get the files when <pre>fs.readdir('/node_modules/', { withFileTypes: true })</pre> is called.</li>
        <li>You won't get all the files when <pre>fs.readdir('/node_modules/', { withFileTypes: true })</pre> is called and filtered by <pre>isDirectory()</pre>.</li>
        <li>You can also click <pre>Install Deps and List Node Modules</pre> button, in both cases we have the same problem.</li>
      </ol>
      <button id="button-1" disabled>List Node Modules Folder</button>
      <button id="button-2" disabled>Install Deps and List Node Modules Folder</button>
    </div>
    <div>
      <h2>node_modules content</h2>
      <ol id="ls-command"></ol>
    </div>
    <div>
      <h2>node_modules filtered by <pre>isDirectory</pre></h2>
      <ol id="ls-command-2"></ol>
    </div>
    <div id="terminal" class="terminal"></div>
`

window.addEventListener('load', async () => {
  const button1 = document.querySelector<HTMLButtonElement>('#button-1')!
  const button2 = document.querySelector<HTMLButtonElement>('#button-2')!
  const lsElement = document.querySelector<HTMLOListElement>('#ls-command')!
  const ls2Element = document.querySelector<HTMLOListElement>('#ls-command-2')!
  const terminalElement = document.querySelector<HTMLDivElement>('#terminal')!

  const webContainerInstance = await load(terminalElement)

  button1.removeAttribute('disabled')
  button2.removeAttribute('disabled')

  function clearLs(message: string, element: HTMLOListElement) {
    const entry = document.createElement('strong')
    entry.textContent = message
    const li = document.createElement('li')
    li.appendChild(entry)
    element.appendChild(li)
  }

  function clearLs1() {
    clearLs('No files found in /node_modules/', lsElement)
  }

  function clearLs2() {
    clearLs('No filtered directories found in /node_modules/', ls2Element)
  }

  async function listViteFolder() {
    const nodeModules = await webContainerInstance.fs.readdir(
      '/node_modules/',
      { withFileTypes: true },
    )

    if (nodeModules.length) {
      nodeModules.forEach((file) => {
        const li = document.createElement('li')
        li.textContent = `${file.name}${file.isDirectory() ? '/' : ''}`
        lsElement.appendChild(li)
      })

      const filteredNodeModules = nodeModules.filter(file => file.isDirectory())
      if (filteredNodeModules.length) {
        filteredNodeModules.forEach((file) => {
          const li = document.createElement('li')
          li.textContent = `${file.name}${file.isDirectory() ? '/' : ''}`
          ls2Element.appendChild(li)
        })
      }
      else {
        clearLs2()
      }
    }
    else {
      clearLs1()
      clearLs2()
    }
  }

  async function execute(callback: () => Promise<void>) {
    button1.toggleAttribute('disabled', true)
    button2.toggleAttribute('disabled', true)
    lsElement.innerHTML = ''
    try {
      await callback()
    }
    finally {
      button1.toggleAttribute('disabled', false)
      button2.toggleAttribute('disabled', false)
    }
  }

  button1.addEventListener('click', async () => {
    await execute(listViteFolder)
  })

  button2.addEventListener('click', async () => {
    await execute(async () => {
      await installDependencies()
      await listViteFolder()
    })
  })
})
