# Error message: required audio encoding tools were not found

!!! Error "The required audio encoding and analysis tools (ffmpeg and ffprobe) were not found in the default locations."

    This error might be shown when the application starts, if either:

     * *ffmpeg* or *ffprobe* were not found; or
     * *ffmpeg* or *ffprobe* were found, but reported an unsupported version.

    These are third-party tools that must be installed alongside *Audio Orchestrator*.

    The system installation can be used, or the software can be manually downloaded and placed in a specific directory as described in the [installation instructions](../installation.md).

    Quit *Audio Orchestrator* (Windows: close the window. macOS: use the shortcut `Command + Q`) and restart it after installing or upgrading *ffmpeg*, so that the new versions can be detected.

    See also: [Installing Audio Orchestrator](../installation.md).
