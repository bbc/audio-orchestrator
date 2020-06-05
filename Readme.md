# bbcat-orchestration-builder (_Orchestrator_)

Prototype an orchestrated audio experience that works with mobile devices from per-object audio tracks exported from a DAW all in one place. It outputs a live preview, encoded audio files and metadata, a template code bundle, or a ready-to-deploy application build based on our [device orchestration template](https://github.com/bbc/bbcat-orchestration-template).

End-user documentation is currently being compiled in the [bbcat-orchestration-docs](https://github.com/bbc/bbcat-orchestration-docs/) repository.

The tool requires `ffmpeg` and `ffprobe` to be available in the system path. Both are most easily installed with [homebrew](https://brew.sh) by running `brew install ffmpeg`. If installing them manually, ensure that links to the binaries are created in `/usr/bin`, or `/usr/local/bin`, or `~/bbcat-orchestration-ffmpeg/bin`.

# Architecture

This project is a desktop application for authoring, previewing, and exporting orchestrated audio experiences. Users can create a project, import audio files and images, and author metadata to define the experience. The result can be previewed with real devices on their local network through an integrated web server included with the tool.

Orchestrator is implemented in the electron framework, using React for the front-end, and providing a background task service that access the file systems and spawns media analysis and encoding child processes. Communication between electron’s two processes (main and renderer) is done securely via IPC channels.

![Architecture overview](docs/OrchestratorArchitecture_KH_2020-05-27.png)

# Development

We use `yarn` as our package manager ([configure it for artifactory access](https://confluence.dev.bbc.co.uk/display/audioteam/bbcat-orchestration+libraries+and+tools) to get our private packages). To install the dependencies, run the following command at the top level:

```
yarn install # runs yarn install in each package directory
```

This installs dependencies in all the packages and creates symlinks to local dependencies where required. Local dependencies also contained in this repository are referenced using the `link:../foo-bar` syntax in `package.json` files, instead of specifying a version number.

The packages are designed to be used together to build the Electron app. The current structure looks like this:

  * `react-frontend/`: The user interface, written with _React_ and _Redux_, interacting with electron APIs through globals set in a preload script.
  * `background-tasks/`: Tasks interacting with subprocesses and the file system, used by the `electron-app` to provide a REST API to the `react-frontend`.
  * `electron-app/`: The `electron-app` bundling and configuring all the other components to create a standalone desktop application.
  * `logging/`: A common logging module for server-side packages based on `winston`.

To start a development version of the app, run `yarn dev`. This rebuilds the `background-tasks`, starts a development server with hot-reloading for the `react-frontend`, and runs the `electron-app`.

To build the app for the current platform, run `yarn build`. This creates a self-contained electron app. `yarn dist` creates a `.dmg` macOS installer image for distribution - stored in `electron-app/dist/mac`.

The versions of all packages in this repo are kept in sync by running the `yarn bump` script at the top level to apply the same version change across all packages.

We currently track development tasks and feature requests as issues in this repository (best viewed in the [Github Project](https://github.com/bbc/bbcat-orchestration-builder/projects/3)).

# Releases

We do not currently publish releases.

The Changelog and GitHub Releases are updated manually on a new major/minor version (we do not currently follow strict semantic versioning). Creating a Github release also generates a git tag for that version.

To create a release build and `.dmg` installer run the `yarn dist:signed` task (ensuring you have an Apple development certificate in your keychain - see xcode/preferences/accounts/apple id/manage certificates). We do not yet notarise our builds.

For reproducible builds, release builds should be created in an isolated environment such as a CI system, and use [environment variables](https://www.electron.build/code-signing) to set the signing certificate. This process is not yet set up.
