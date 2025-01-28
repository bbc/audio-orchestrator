# Frequently asked questions

These frequently asked questions cover some of the common difficulties with using *Audio Orchestrator* to build orchestrated audio experiences.

## Audio Orchestrator

### Audio files

!!! Question "Can I import stereo files?"
    Yes, as of [v0.18.0](change-log.md#v18), *Audio Orchestrator* can use stereo files. See [Preparing audio assets](preparing-audio.md) for more details.

### Sequences

!!! Question "How do I control the user journey through my experience?"
    [*Sequence destinations*](sequences.md#sequence-destinations) and [*sequence settings*](sequences.md#sequence-settings) are used to control the user journey.

    If you want the experience to progress through sequences with no user input, you can leave all three *sequence settings* unchecked. At the end of a sequence, the experience will automatically progress to whichever *sequence destination* is at the top of the list. Note that this means that each sequence (apart from the very last) will need at least one destination.

    More complexity (including sequences that loop or need the listener to make a choice) can be set up using combinations of the sequence *destinations* and *settings*. See the [Sequences page](sequences.md) documentation for more details.

    Some experiences will only require one sequence.

!!! Question "Can I link different images to different sequences?"
    As of *Audio Orchestrator* [v0.20.0](change-log.md#v20), an [Images and effects behaviour](image-behaviour.md) can be used to add images to audio objects. This can be used to display a different image for each sequence.

### Controls and behaviours

!!! Question "Can I choose which devices the controls show on?"
    You can set controls so that they appear on *any device role*, *main device only*, or *aux devices only*. See the [Controls page](controls.md#setting-up-a-control) documentation for information on how to do this.

!!! Question "Can I use information about the location of the aux devices?"
    We've not currently implemented a way to automatically detect device location. You could ask the listener to tell you where they've put devices by setting up a location control (for example, a [*radio button control*](controls.md#control-radio) with options for *Left side*, *Right side*, *Front*, and *Rear*). See *Example 1* in the [Controls page](controls.md#controls-examples) documentation.


## The prototype application

!!! Question "I can't hear any audio on my iPhone"
    Many iPhones have a hardware button on the side of the phone that puts the phone into silent mode. Check that your phone is not on silent mode and that the volume is turned up.

!!! Question "Can I connect devices on different WiFi networks?"
    If you preview your experience, you'll only be able to connect devices that are on the same network as the device that's running *Audio Orchestrator*. If you want to connect devices on different networks, you'll need to export your experience and host it somewhere. See the [Export page](export.md#export-export) documentation for more details on how to do this.

!!! Question "I get an error when I try to start a new session"
    When you click "Start new session", you might see an error message: *"Sorry; there was an error. Please reload the page to try again."* There are a number of possible reasons for this.

    * Check that the preview is still running from *Audio Orchestrator*.

    * Check that you're connected to the Internet.

    If the problem persists, there may be an issue with the synchronisation service. Try switching to an alternative synchronisation server on the [export page](export.md#export-settings)

!!! Question "The audio stops playing when the tab isn't open or the phone goes to sleep"
    The browsers on mobile phones may stop audio playback when the browser tab is not in the foreground, the browser is not in the foreground, or the phone goes to sleep. This is intended to conserve battery and improve mobile performance, but may be undesirable for orchestrated experiences.

    The prototype application will try to keep the device awake while the browser is in the foreground; however, this is an experimental feature and not supported in all browsers.

    Device settings can also be used to prevent a phone from sleeping for as long as possible. The way to do this will vary across phones.

    * On Android phones, try `Settings > Display > Screen timeout`.
    * On iPhones, try `Settings > Display & Brightness > Auto-Lock`.

    Another possibility is to design the experience in such as manner as to encourage regular interaction with the device by the listener—for example, requiring them to set control values at various points during the experience. Of course, this might not work well for the type of experience that you are building.

!!! Question "The audio playback isn't in sync"
    The synchronisation service that we use tends to be accurate to within the region of 10 to 20 milliseconds. However, there can also be significant delays whilst the audio is processed, particularly on some mobile phones. This can result in delays of up to 200 ms or so.

    On the [Appearance](appearance.md) page of *Audio Orchestrator*, you can enable calibration mode—this adds a tool that allows the listener to manually calibrate devices to remove this delay. See the [prototype application](prototype.md#calibration-mode) documentation for more details.

    It's more important for some audio content to be very accurately synchronised than other content. For example, music elements are more critical than voiceover speech. If you're struggling with synchronisation problems, you might want to consider the types of sounds that are sent to the main device and any aux devices.

    It's also worth checking that you've connected all devices to the same session, rather than starting a new session on multiple devices.
