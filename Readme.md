# Audio Orchestrator

_Audio Orchestrator_ is a desktop application for prototyping orchestrated audio experiences.

Create a project, import audio files, and author metadata for audio objects, sequence destinations, and user controls to define the experience; then start a preview with real devices on your local network or export a web application bundle to host it on a server.

The software was distributed to BBC staff and external users (subject to a licence agreement) via [MakerBox](https://www.bbc.co.uk/makerbox) from 2018-2024. It is currently only available to BBC staff by emailing [Kristian Hentschel](mailto:kristian.hentschel@bbc.co.uk); third-parties may require a bespoke agreement.

 * Preview an [example project](https://orchestrator-demos.virt.ch.bbc.co.uk/getting-started-with-orchestration) made with it.
 * [Read the user guide](https://bbc.github.io/bbcat-orchestration-docs).
 * See also these related repositories:
    * the [template](https://github.com/bbc/bbcat-orchestration-template/) application used for the preview and export,
    * the [library](https://github.com/bbc/bbcat-orchestration/) for handling audio rendering and communication between devices in the template, and
    * the [docs](https://github.com/bbc/bbcat-orchestration-docs/).

_Audio Orchestrator_ requires `ffmpeg` and `ffprobe` to be available in the system path or a specific location in your home directory. For a manual installation, place the binaries in `~/audio-orchestrator-ffmpeg/bin` on macOS and `%HOME%\audio-orchestrator-ffmpeg\bin` on Windows. See the [installation instructions](https://bbc.github.io/bbcat-orchestration-docs/installation/) for more details.

# Architecture overview

_Audio Orchestrator_ is implemented in the [Electron](https://www.electronjs.org/) framework, using [React](https://reactjs.org/) for the front-end, and providing a background task service that accesses the file systems and spawns media analysis and encoding child processes. Communication between Electron's two processes (main and renderer) is done via IPC channels.

![Architecture overview](docs/OrchestratorArchitecture_KH_2020-05-27.png)

_NB the update service shown in the diagram was not implemented._

# Development

## Getting started

You'll need:

  * [Node.js](https://nodejs.org/en/) (version 12+ recommended)
  * [yarn](https://classic.yarnpkg.com/lang/en/) (notes may be for 1.x)

Log in to the GitHub packages NPM registry using a personal access token with at least the `read:packages` permission as the password ([GitHub docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)):

```
npm login --registry https://npm.pkg.github.com --scope @bbc
```

Install the dependencies:

```
yarn install # runs yarn install in each package directory
```

Run a development version of the app:

```
yarn dev
```

Stop the development server with `CTRL-C`.

Build the installers:

```
yarn dist
```

The results can be found in `electron-app/dist/`:

* macOS DMG installer disk image
  * Intel/ARM universal binary: `BBC R&D Audio Orchestrator-{version}.dmg`
* Windows NSIS installer executable
  * Intel 64-bit: `BBC R&D Audio Orchestrator Setup {version}.exe`

Building the installer for macOS will use an Apple development certificate if there is one in your keychain; otherwise code signing will be skipped. The app is however not notarised by Apple, so will still require administrator approval to run.

## Repository structure

The packages are designed to be used together to build the Electron app. The current structure looks like this:

  * `react-frontend/`: The user interface, written with _React_ and _Redux_, interacting with electron APIs through globals set in a preload script.
  * `background-tasks/`: Tasks interacting with subprocesses and the file system, used by the `electron-app` to provide a REST API to the `react-frontend`.
  * `electron-app/`: The `electron-app` bundling and configuring all the other components to create a standalone desktop application.
  * `logging/`: A common logging module for server-side packages based on `winston`.

Running `yarn install` at the top level installs dependencies for all of these packages. References between them are expressed using the link syntax (e.g. `link:../logging`) in `package.json` files. We do not use any special monorepo management scripts such as _lerna_ or _yarn workspaces_.

The development version (`yarn dev`) builds the `background-tasks`, `electron-app`, and `logging` packages; and runs a development server for the `react-frontend`. Changes to the frontend source code are automatically reflected after a few seconds, but you may need to reload the page (CMD-R in the electron app). Changes to the other packages require the `yarn dev` command to be run again (CTRL-C in the terminal session to stop it). _NB the frontend development server runs on port 8080; make sure this is not used by something else._

## Releases and versions

The [Changelog](./Changelog.md) and [GitHub Releases]() are updated manually, usually on minor version increments (e.g. `0.17.0` to `0.18.0`). We create a Github release linked to a git tag for that version.

To create a release build and the `.dmg` installer run the `yarn dist` task.

The versions of all packages in this repo should be kept in sync by running the `yarn bump` script at the top level to apply the same version change across all packages. Generally, we increment the patch version for every PR, and increment the minor version for new releases (NB this is not strictly compatible with semantic versioning).

## Status

_Audio Orchestrator_ was originally developed in the BBC R&D Audio Team ([confluence](https://confluence.dev.bbc.co.uk/display/audioteam/)) by Kristian Hentschel with contributions from Jon Francombe, Emma Young, Danial Haddadi, and Sonal Tandon between 2019 and 2022. Further feature updates are not planned as the associated R&D workstream has been retired.