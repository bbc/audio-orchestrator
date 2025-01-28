# Changelog

This changelog summarises changes for minor and major version bumps that end users might need to be aware of. The commit log should provide a more detailed list of changes for developers; most changes to internal systems are not discussed here.

---
# `0.23.1`
  * Change location of support and log files to `~/Library/Application Support/Audio Orchestrator` / `%APPDATA%/Audio Orchestrator`

# `0.23.0`
  _2025-01-17_
  * Re-organise the repository and build scripts for open source release
  * Update to use ES Modules and remove babel build step for main process code, update various build dependencies
  * Fix bug where new audio files could not be selected due to Electron API change
  
# `0.22.2`
  _2024-12-12_
  * Update external dependencies (Electron 33, etc.); fixing `node-gyp` build issues with Python 3.12

# `0.22.1`
  _2024-01-09_

  * Update external dependencies (Electron 28, etc.)
  * Prefer preview server addresses beginning with `192.` if multiple interfaces are present (to avoid binding to VPN interfaces in corporate settings)

# `0.22.0` (public release)
  * Replace artifactory with github package registry and switch to the new open-source `audio-orchestration` repository for template and library.
  * Add advanced export settings to use a custom template, and to switch between cloud-sync and peer-sync adapters.
  * Upgrade external dependencies (Electron 18.0.3).

# `0.21.2` (public release)

  * Fix a problem on Windows where DASH streams were not included in the export.
  * Fix a problem on newer versions of macOS where `ffmpeg` is not found if installed with homebrew.

# `0.21.1` (public release)

  * Fix a problem with the monitoring system where the number of connected devices did not update correctly when some devices are switched off.

# `0.21.0`
_2021-07-22_

  * Add a monitoring page for checking object allocations with virtual device setups, and control DAW rendering, as well as additional controls for this on the audio page.
  * When checking if image files are present, only warn on the export page if the current title image is missing.
  * Add a flag to the sequence settings to show the connection instructions on the main screen while it is active.
  * Fix a problem in the allocation algorithm where the `anyOf` conditional operator in custom behaviours did not work with boolean properties (like `deviceIsMain`).
  * Show a prompt on aux devices if calibration mode is available.
  * Upgrade external dependencies (Electron 13.1.4)

# `0.20.1` (public release)

  * Accept ffmpeg versions of the form `n4.4-tag` too, to support alternative available Windows builds.

# `0.20.0` (public release)
_2021-03-22_

  * Add new `gainAdjustmentIf` behaviour (total adjustment limited to +12dB per object in the allocation algorithm).
  * Replace `moduloIsZero` conditional operator with `modulo` and support an offset.
  * Allow configuring the object fade-out duration on the Appearance page.
  * Various small fixes in image authoring and exporting.
  * Experimental builds for Windows and Apple M1 Macs.
  * Upgraded to Electron version 12.0, and upgrade other external dependencies.
  * Upgraded the orchestration template, including displaying the number of devices in the status bar and several features only available by editing the exported index.html: a per-sequence title and image, a list of sequence destinations displayed with thumbnails and titles, and automatic transitions once a minimum number of aux devices have been connected.

# `0.19.2`
_2021-01-21_

 * Fix problem where no windows were opened on app launch.
 * Upgrade external dependencies.

# `0.19.1`
_2020-12-07_

**This version does not run properly under some circumstances, please use `0.19.2` instead.**

 * Support authoring and displaying timed images and coloured lighting effects attached to audio objects. These are authored as a new behaviour type.
 * Use a graphical colour picker.
 * Add an option to enable play/pause control on aux devices.
 * Various small fixes to the application template layout.
 * Update external dependencies, including Electron framework.

# `0.18.0` (public release)
_2020-08-18_

 * Encode and play objects imported as stereo .wav files, to avoid a problem where left and right channels could be allocated to different devices.
 * Display the list of connected devices on the instruction screen for all devices.
 * Include nosleep.js in the prototype application to keep mobile devices awake while playing.
 * Increase threshold for silence detection to -70dB, to avoid dithering noise (enabled by default in Audacity) not being recognised as silence.
 * Fix handling of silent audio segments ending at an integer-second position, improving playback performance problems in some projects.
 * Correct link to fixed behaviours documentation.

# `0.17.0`
_2020-07-20_

 * Adjust some colours in the production tool and experience template to improve contrast.
 * Add option to specify alt-text for the cover image.
 * Add new search paths for locating ffmpeg.
 * Move log file to Application Support.
 * Disable dynamic range compression on auxiliary devices by default.
 * Use relative file paths for audio and image files where appropriate.
 * Add a new behaviour type, `mute if`, and enable conditional behaviours to referr to other objects allocated to the current or any device.
 * Allow sequences to be re-ordered on the Sequences page (no effect on exported experience).
 * Add an option to enable manual latency calibration in exported experiences (controlled by a new checkbox the Appearance page).

# `0.16.0`
_2020-06-18_
 * Remove _template code_ and _audio only_ export options -- only the built prototype can be exported now, as the template source code is no longer included with the application. Template customisation is still possible by copying the exported _index.html_ and _audio/_ folder into a copy of the template repository obtained separately.
 * Update application icon.
 * Upgrade to Electron 9.0 and review security measures.
 * Ensure that imported image files have a valid image header.
 * Ensure that files for previously encoded items still exist during export.
 * Fix _StereoPanner_ causing a crash in Safari.
 * Change the gain calculation for objects sent to _all applicable devices with gain adjustment_, it is now compensated as if adding incoherent sources.
 * Add version to project files, to be able to convert project files created by older versions and reject those created by newer versions.
 * Add documentation links to common error messages.

# `0.15.0`
_2020-06-05_

 * Change the application name to _BBC R&D Audio Orchestrator_
 * Changes to copy and UX throughout the tool; including renaming of some concepts and pages to be more consistent with documentation.
 * Store Cloud-Sync host name in project file (requiring old projects to be updated in advanced settings).
 * Fixed a bug preventing controls from being allocated to devices correctly, and a related issue with the `anyOf` operator in object behaviours.
 * Added a BBC R&D logo to the Audio Orchestrator credits page, and to the template application footer.
 * Fixed a bug where new range and button controls were exported without a default value.
 * Added help links opening in default browser (but the documentation is not yet public).
 * Fixed a bug where multiple preview servers would remain active if there was an error during the export process.
 * Output panning metadata in a new format to support stereo panning, rather than just mapping to a left/right/mono output.
 * Allow the user to change which sequence is used as the entry point.

# `0.14.0`
_2020-05-18_

 * Add ability to add behaviours with custom settings to multiple objects at once.
 * Add 'fixed behaviours' for determining which device roles (main, aux, or both) an object can be allocated to, and whether it can be allocated to just one or multiple devices at the same time (these replace the _main device only_, _aux devices only_, _allowed everywhere_, and _spread_ behaviours).
 * Add 'control linked behaviours' based on a user-defined control, to select the control values for which an object will be allowed or prohibited.

# `0.13.0`
_2020-04-22_

 * Major change: Projects are now stored in files, instead of in an internal database. **Projects authored with an earlier version than 0.13.0 cannot be opened anymore.**
 * Change: the template will now output in stereo on all devices, including auxiliary devices.
 * Change: simplified sequences page look and feel.
 * Internals: improved security of background tasks interface.

# `0.12.0`
_2020-04-06_

This is a major change from `0.11.0` and incorporates ~ 35 PR's previously maintained on the `v2-dev` branch. There are major changes to the internals, output template, and user interface, not least including an entirely new metadata model.

**Projects authored with earlier versions may not open anymore**.

 * Upgrade to electron 8 and apply new IPC model (#302)
 * Add additional ffmpeg search path so we can use a different binary than the system installation (#301)
 * Fix for behaviour deletion not being able to be confirmed (#300)
 * Fix QR code and joining link in previewed template (#299)
 * Change default perDeviceGainAdjust to 0 (#298)
 * Store spread gain adjustments in dB (#297)
 * Upgrade template dependency for getting the instructions page (#295)
 * Allow selection and deletion of multiple objects (#294)
 * Fix exported image file names (#293)
 * Update presentation settings defaults to match the template and allow empty fields. (#292)
 * More consistent delete button with confirmation (#291)
 * Disable audio compression and set a default colour for new projects. (#289)
 * Move project steps to the top (#288)
 * Check ffmpeg version (#287)
 * Update credits.html (#286)
 * Use new template design and rework look & feel page to match, including images. (#285)
 * Move electron-builder config into separate file, and add a restricted config that does not include sources for our libraries (#283)
 * Remove ffmpeg binaries from build (#278)
 * Help messages inside the tool (#277)
 * Show advanced settings on export page (#259)
 * Refactor ConditionInput and allow control values to be referenced in behaviours (#257)
 * Allow reordering of controls (#256)
 * Allow authoring control parameters for range and counter controls (#255)
 * Allow authoring of control parameters and defaults for radio and checkbox (#253)
 * First pass on look and feel of sequence settings (#254)
 * Enable linting for JSX files and fix old linter errors (#252)
 * Basic authoring for control behaviours (#251)
 * Creating, renaming, and deleting controls (#248)
 * Setup Jenkins for continuous integration (#250)
 * Implement sequence list on condition behaviour parameter. (#249)
 * Behaviour parameters refactor (#247)
 * Add type-specific input interfaces for behaviour parameters (#243)
 * Add warning for importing invalid project file (#242)
 * Fix display bug for file input on import dialog and correct removal when Cancel is clicked
 * Upgrade semantic-ui-react dependency (#241)
 * New object metadata with rudimentary behaviour editing (#240)
 * Move sequence settings from objects page to sequences page (#239)
 * Add a step bar at the bottom of the page (#238)

# `0.11.0`
_2019-09-26_

* New feature: Can now specify port number for a custom cloud-sync service, to allow using a locally running version.
* Improvement: Reduced size of the installed application (by only shipping relevant ffmpeg and ffprobe binaries for the current platform).
* Improvement: Detect sample rate for each imported file, rather than requiring all files to use 48KHz.
* Improvement: Allow the expanded metadata table to take up the entire width of the window.
* Improvement: Removed external web font dependency, allowing the app to work offline (a system font is used instead).
* Change: Simplified dependency management; referring to unpublished packages maintained in this repository by a relative path instead of a version number, so that yarn can be used to manage each individual package.

# `0.10.0`
_2019-09-12_

* Improvement: Default keyboard shortcuts are now available in system dialogues and text input fields (Select All, Copy, Paste, etc.).
* Improvement: Export tasks will now wait for file analysis and encoding to finish, instead of failing.
* For developers: Refactored the background tasks to re-use more functionality between similar tasks and added unit tests.
* For developers: Upgraded to electron 6 and changed the build and monorepo management tools.

# `0.9.0`
_2019-08-14_

* Improvement: The _preview_ and _distribution_ exports are now much, much faster because a pre-built version of the template is shipped with the tool.
* New feature: A _baseUrl_ can now be set in _Advanced settings_, for hosting environments that require absolute URLs.
* Bugfix: The project is now re-validated after an object with an error state is deleted.

# `0.8.0`
_2019-07-19_

* Change: Importing a metadata file is now optional, and can only be done after linking audio files. Basic object metadata is automatically generated when a file is added.
* Change: Panning column can now be edited, as left, right, or centre. It is initially populated from the filename suffix (`_L` or `_R`).
* Change: User interface for the sequence objects table has been improved.
* New feature: A QR code is displayed when the preview is completed.
* New feature: An object row's metadata can be reset to the default settings.
* New feature: An object can be removed from a sequence.

# `0.7.0`
_2019-07-05_

* New feature: Object metadata fields can now be edited on the sequence page.
* Change: The device tags are now edited on the sequence page, instead of on a separate page.
* Change: The last opened sequence is now remembered when changing project pages.
* Bugfix: An error is displayed if the API server is unreachable, instead of a never-ending loading screen.

# `0.6.0`
_2019-06-21_

* New feature: Home screen developer menu to toggle developer tools and export project data files.
* Change: File errors are now also shown on the export screen, and the export screen layout has been changed.

# `0.5.0`
_2019-06-20_

* New feature: Indicators of object metadata fields are now shown in metadata table, redundant file information has been removed.
* Change: Audio, Metadata, and Settings page for sequences have been combined into a single page.
* Caveat: Developer tools are now disabled in production builds, and cannot easily be brought back.
* Bugfix: Avoid errors during export when the accentColour has not been selected.

# `0.4.2`
_2019-06-19_

* New feature: Projects and sequences can now be deleted.
* New feature: Presentation settings are now applied to the compiled template and preview.
* New feature: Success of replacing audio files or metadata is now indicated next to the buttons.
* Change: New projects are now created with only one sequence.
* Change: Various UI elements have been tweaked.
* Change: The Export buttons are disabled if there are errors in any sequence.
* Bugfix: The review buttons now link to the relevant sequence or project settings page.

# `0.3.0`
_2019-06-11_

* New feature: Branching narratives may be defined by adding multiple choices in the new _Settings_ tab when editing a sequence.
* New feature: The looping behaviour of a sequence may now be specified in the interface.
* Caveat: The format for the permanent project storage has been changed, old projects may not open correctly anymore.

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
