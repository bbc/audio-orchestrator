# Version change log

<a name="v23.1"></a>
## Version 0.23.1

**Released:** 29th January 2025.

* Open-source release -- Audio Orchestrator can now be built from our public [GitHub repository](https://github.com/bbc/audio-orchestrator).
* The application name has been changed to "Audio Orchestrator", default exports are now prefixed with `audio-orchestrator`, and the log files are now in an "Audio Orchestrator" folder.
* If multiple network interfaces are present, the preview server preferably picks one with an IPv4 address beginning with `192.` -- this may help in some corporate environments or when VPNs are used.

<a name="v22.0"></a>
## Version 0.22.0

**Released:** 21st April 2022.

* Added an option to [use a custom template](custom-template.md) based on the open-source [audio orchestration repository](https://github.com/bbc/audio-orchestration/) to the [Export page](export.md).
* Added an option to use an alternative synchronisation adapter to the [advanced export settings](export.md#export-settings).
* Onboarding instructions and hidden sequence destinations can now be enabled by [customising the prototype application](customise-prototype.md).

<a name="v21.2"></a>
## Version 0.21.2

**Released:** 7th October 2021.

* Fixed a bug in the Windows version where some audio files were not exported.

* Fixed a bug where *ffmpeg* was not found on some newer Macs.

<a name="v21.1"></a>
## Version 0.21.1

**Released:** 23rd August 2021.

* A tool for monitoring experiences inside *Audio Orchestrator* has been added. On the [Monitoring page](monitoring.md), you can add virtual devices with different properties and see how your audio objects will be allocated to them. You can also connect *Audio Orchestrator* to your digital audio workstation to hear the effect on the mix. This means that you don't need to [preview your experience](export.md#export-preview) every time you want to test it out. Some monitoring controls can also be accessed from the [Audio page](audio.md#audio-page-monitoring).

* The connection instructions can now be shown on the main playing page. An extra checkbox in the [sequence settings](sequences.md#sequence-settings) is used to specify which sequences the instructions are shown in.

* When [calibration mode](prototype.md#calibration-mode) is enabled, a prompt to calibrate the device is shown on aux devices, and a calibration button is included with the playback controls.

* The documentation has been updated to include some [hidden features of the prototype application](customise-prototype.md) that can be customised outside of *Audio Orchestrator*. For example, sequence destinations can be shown as thumbnail images.

* Various small bug fixes, including a fix for the *Any of* comparison operator in [custom behaviours](custom-behaviours.md#comparison-operators) and for error checking missing image files.

<a name="v20.1"></a>
## Version 0.20.1

**Released:** 10th May 2021.

* The Windows version of *Audio Orchestrator* now accepts *ffmpeg* builds with a slightly different version format, available via one of the sources linked from ffmpeg.org.

<a name="v20"></a>
## Version 0.20.0

**Released:** 21st April 2021.

* Versions of *Audio Orchestrator* for Windows and for Macs with the M1 chip are now available, in addition to the Intel Mac version.

* An [Images and effects behaviour](image-behaviour.md) has been added, allowing authoring of timed images and lighting effects as part of an orchestrated audio production (e.g. as used in the trial production [*Monster*](productions.md#monster)). The images and effects are attached to audio objects and therefore can be flexibly allocated to devices in the same way that audio objects are.

* A new [*Gain adjustment if*](custom-behaviours.md#gain-adjustment) behaviour has been added. This can be used to modify the gain of an object (i.e. make it louder or quieter) depending on some conditions.

* The *Modulo is zero* [comparison operator](custom-behaviours.md#comparison-operators) has been replaced with a new operator *Every Nth value*, which makes it simpler to match repeating patterns of values and now allows an offset at the start of the number sequence.

* An option to enable playing and pausing a session from an aux device has been added to the [Appearance page](appearance.md#interface-options).

* A fade out can now be applied to objects when they stop being allocated. The fade out length is customisable on the [Appearance page](appearance.md#object-fade-out).

* The main device and aux devices now show the number of connected devices with a loudspeaker icon in the [status bar](prototype.md).

<a name="v18"></a>
## Version 0.18.0

**Released:** 21st August 2020.

* *Audio Orchestrator* and the [prototype application](prototype.md) can now handle stereo files. See [Preparing audio assets](preparing-audio.md) for more details.

* The [example project](example.md) was updated to use stereo files.

* The list of connected devices is now shown on the joining instructions page for all devices, not just for the main device.

* A script has been included to try to keep devices awake while the browser is in the foreground.

* Some bugs related to audio encoding have been fixed.

* The link to the [fixed behaviours documentation](fixed-behaviours.md) from the Audio page in *Audio Orchestrator* has been fixed.

<a name="v17"></a>
## Version 0.17.0

**Released:** 20th July 2020.

* Initial release.
