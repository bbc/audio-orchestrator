# Appearance page

On the Appearance page, you can make settings to customise the appearance of your prototype application (see the [prototype application](prototype.md) documentation for more information about the different components).

## Text

In the top row of text fields, you can give your application a **title**, **subtitle**, and an **introduction** paragraph. The title and subtitle will be visible on every page of the prototype application. The introduction text will only be visible on the home page.

In the second row, you can set labels for the **start** and **join buttons**. The defaults are *Start new session* and *Join existing session* respectively.

## Accent colour

The **accent colour** is used for various components of the prototype application, including buttons and the play bar. You can specify the colour with a [hex triplet](https://en.wikipedia.org/wiki/Web_colors#Hex_triplet), or use one of the preset colours.

<a name="cover-image"></a>
## Cover image

The **cover image** is shown on the prototype application home page and all playing pages. Click "Add cover image", select an image file, then click "Open".

* You should use a square image, ideally at least 600 x 600 pixels. Images that aren't squares will be cropped to square.
* Images should use the JPEG (`.jpg` or `.jpeg`) or PNG (`.png`) formats.

The prototype application will use the default image if you don't add one here.

!!! Tip

    * The prototype application is designed to work with a square image, but will display rectangular images too.

    * The width of the displayed image will be 600 pixels. Smaller images will lack resolution, and larger images will be scaled.


When you've imported a cover image, you'll see a text box labelled *Image alt text*. Use this to add **alternative text** to the image. Alternative (or alt) text is important for accessible design; among other benefits, it enables those using screen readers to better understand the page.

!!! Tip
    Good alt text provides a concise but complete description of the image. See, for example, the [BBC mobile accessibility guidelines](https://www.bbc.co.uk/guidelines/futuremedia/accessibility/mobile/text-equivalents/alternatives-for-non-text-content) for more details.

<a name="interface-options"></a>
## Interface options

There are three customisable aspects of the prototype application in the *Interface options* section.

* **Display list of active audio objects.** The prototype application can display the filenames of the audio objects that are currently being played on each device. This is helpful for checking that your [behaviours](audio.md#behaviours) are acting how you expect without necessarily needing to listen to the full piece. This is turned on by default.

* **Enable calibration**. The prototype application can include a calibration mode that enables the listener to adjust for a time offset between the main and aux devices. Calibration mode is accessed through the instructions page; see the [prototype application](prototype.md#calibration-mode) documentation for a description of how it works. Calibration is turned off by default.

!!! Tip
    The orchestrated audio system underlying the prototype application uses a cloud-based synchronisation server to keep devices in sync, but this can't account for delay introduced by the software and hardware on individual devices. On some devices, this can be negligible, but on others, it's large enough (~200 ms) to make orchestration unsuitable for some types of sound that require very accurate synchronisation (such as rhythmic music). The manual calibration mode can help to correct for this, potentially making orchestration suitable for more experiences.

* **Show Play and Pause buttons on aux devices**. When this option is checked, the aux devices will have a play/pause button allowing them to control the session playback. By default (i.e. when this option is unchecked), playback can only be controlled from the main device.

## Audio compression

Audio compression can be applied to the output of aux devices. This might be useful if the main device has significantly better or louder loudspeakers than the aux devices (for example, if the aux devices are all mobile phones), and it's consequently beneficial to increase the playback volume of quiet audio that's sent to aux devices.

The compressor works by reducing the level of the loud parts of the sound (those above the *threshold*) and not affecting the quiet parts. Then, the level of the whole signal is increased—so there's less dynamic range in the signal, but the quiet parts are relatively louder.

The compressor has two customisable parameters.

* **Compressor ratio** is the amount of level reduction applied to the audio above the *threshold* level. A ratio of 2 means that a 2 dB increase in input level produces a 1 dB increase in output level.

* **Compressor threshold** is a decibel value above which the compression will start taking effect.

To disable compression, set the *Compressor threshold* to 0. This is the default value.

!!! Tip
    * Audio compression is implemented by a Web Audio API [DynamicsCompressorNode](https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode).

    * The compressor has auto make-up gain based on the threshold, ratio, and knee.

    * The compressor uses the following settings.

        * Attack time: 0.01 s.
        * Release time: 0.25 s.
        * Knee: 30 dB.

<a name="object-fade-out"></a>
## Object fade out

This value sets the length (in seconds) of the linear fade out that is applied to an object when a change means that it is no longer allocated to a device by the [allocation algorithm](allocation-algorithm.md). By default, it is set to 0 seconds (i.e. the object will immediately stop playing).

!!! Tip
    After a change in object allocations, there can sometimes be a short delay before an object starts playing in a new device. Setting a fade out can help to mitigate the effects of this in some circumstances.
