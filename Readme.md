# bbcat-orchestration-builder

Prototype an orchestrated audio experience that works with mobile devices from per-object audio tracks exported from a DAW and a Metadata file generated using the [S3A plugins](http://www.s3a-spatialaudio.org/plugins), all in one place.

This graphical tool replaces the packaging scripts and build process from the [bbcat-orchestration library](https://github.com/bbc/bbcat-orchestration) and the associated [user interface template](https://github.com/bbc/bbcat-orchestration-template), making it more accessible for prototyping with a graphical user interface.

Builds are available from `/audioteam/2-inprogress-projects/MDO-Builder-Tool/builds`.

The tool requires `ffmpeg` and `ffprobe` to be available in the system path. Both are most easily installed with [homebrew](https://brew.sh) by running `brew install ffmpeg`. If installing them manually, ensure that links to the binaries are created in `/usr/bin` or `/usr/local/bin`.

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
