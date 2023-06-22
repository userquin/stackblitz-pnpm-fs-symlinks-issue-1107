# @webcontainer/api filesystem repro - Issue 1107

This is the reproduction for issue 1107: https://github.com/stackblitz/webcontainer-core/issues/1107.

This repo when starting the `dev server`, it will download the project itself and mount it using `@webcontainer/api`.

Check [vite client plugin](./plugins/client.ts) and [setup container module](./src/setup-container.ts) for more details.

## The problem

When listing `node_modules`, the packages are there, but if we try to filter their content, the children are missing when there are `symlinks`.

## The reproduction

This reproduction will list `node_modules` folder when clicking `List Node Modules` button.

Filtering [fs.readdir](./src/main.ts#L75) will not return nor follow symlinks, steps to reproduce it:
1) Run `pnpm install` in the terminal once the dev server is started.
2) Run `ls -l node_modules`, you'll see the packages (some with symlinks created by PNPM) and `.pnpm` folder.
3) Write `ls -l node_modules` and press additional slash, the content will be displayed (do not press ENTER).
4) Click `List Vite Folder` button.
5) You will get the files when `fs.readdir('/node_modules/', { withFileTypes: true })` is called.
6) You won't get all the files when `fs.readdir('/node_modules/', { withFileTypes: true })` is called and filtered by `isDirectory()`.
7) You can also click `Install Deps and List Node Modules` button, in both cases we have the same problem.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/userquin/webcontainer-fs-symlink-repro)


## Additional Problem

If you click `Install Deps and List Node Modules` button, the terminal hangs, focusing it and pressing ENTER the prompt will be shown.

Is there something we need to do?
