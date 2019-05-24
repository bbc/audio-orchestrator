# Changelog

This changelog summarises changes for minor and major version bumps that end users might need to be aware of. The commit log should provide a more detailed list of changes for developers; most changes to internal systems are not discussed here.

---
# `0.2.0`

_2019-05-24_

* New feature: Custom zones may be specified to replace the default set (`nearFront`, `farSide`, etc.).
* Bugfix: Audio should no longer be repeated or missed at the end of DASH rendering items.
* Bugfix: The built application can now be launched by double-clicking the application bundle in Finder as normal.

# `0.1.0`

_2019-05-17_

This version is the first _almost_ complete implementation of the basic functional requirements.

* The app bundle contains all required runtimes and binaries (e.g. Node.js and ffmpeg)
* A graphical user interface is provided with the ability to create projects, add audio and metadata files to sequences, and edit basic settings.
* Projects can be exported as audio files and metadata, a template code bundle, or a compiled distribution bundle.
* Projects can be previewed using a built-in development web server.
* Project data is stored using LocalStorage, audio files are referenced from their original location, exports and intermediate files are written to the operating system's temporary directory.

## Known user-facing issues

* The images page for a sequence is non-functional.
* Some presentation settings are not correctly remembered, nor used to populate the exported template or preview.
* When audio files are not yet encoded when an export or preview is triggered, the user has to wait for the encoding to finish before re-starting the export. This frequently happens if temporary encoded files are cleaned up by the operating system.
