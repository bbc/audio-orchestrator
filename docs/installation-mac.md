<a name="macos"></a>
# Installing Audio Orchestrator on macOS

To use _Audio Orchestrator_ on a macOS device, follow the instructions below.

!!! Info
    The minimum version of macOS required for *Audio Orchestrator* is macOS 11 (Big Sur).

## Install Audio Orchestrator

1. Open the *BBC R&D Audio Orchestrator* `.dmg` file.

2. Drag *BBC R&D Audio Orchestrator* into the *Applications* folder.

3. In your *Applications* folder, click the *BBC R&D Audio Orchestrator* icon to open the application.

    * The first time you open the application, you may see a warning saying that *BBC R&D Audio Orchestrator* is an application downloaded from the Internet. Click "Open" to continue.

    * If you cannot open _Audio Orchestrator_, you may have to allow _installing apps from the App Store and identified developers_ in _System Preferences > Security and Privacy > General_ and try again. You can also try right-clicking the application icon and choosing _Open_.

4. If you already have *ffmpeg* and *ffprobe* installed, that's it—you're ready to go. If not, read on for instructions on installing these.

<a name="ffmpeg"></a>
## Install ffmpeg and ffprobe

To use *Audio Orchestrator*, you need to have an installation of *ffmpeg* and *ffprobe* version 4.1.0 or later. If you're not sure whether you have these, just try opening *Audio Orchestrator*. You'll see an error message if you don't have the required software installed.

There are two ways to install these dependencies.

* Follow the steps [below](#ffmpeg-brew) for the quick installation using the *Homebrew* package manager.
* If you prefer, you can follow the [steps to manually install ffmpeg](installation-mac-manual.md) instead.

<a name="ffmpeg-brew"></a>
### Installing ffmpeg and ffprobe using Homebrew

To install *ffmpeg* and *ffprobe* using *Homebrew*, follow these instructions. You might already have installed *Homebrew* if you've done development work or installed certain software packages before.

!!! Info
    The automated installation via *Homebrew* may take a few minutes (especially if this is the first time you are using *Homebrew*) and you will see a lot of text messages scroll through the terminal during this time. Wait for the command to complete before opening _Audio Orchestrator_ again.

1. If you don't already have *Homebrew* installed, follow the instructions at [https://brew.sh/](https://brew.sh/).
    1. Open _Terminal_.
    2. Copy and paste the installation script from the _Homebrew_ website and press `Enter`.
    3. You may be asked for your password. Note that _Terminal_ does not indicate each typed character of your password, but it will accept it when you press `Enter`.
2. Install _ffmpeg_ using _Homebrew_
    1. Open *Terminal* if it is not open already.
    2. Type `brew install ffmpeg` and press `Enter`.
    3. If you see an error message saying that you already have a version of *ffmpeg* installed, you can update to the latest version by typing `brew upgrade ffmpeg`.
3. Close _Terminal_ and restart _Audio Orchestrator_.
