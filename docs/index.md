# Getting started with Audio Orchestrator

*Audio Orchestrator* is a production tool from BBC Research & Development for building immersive, interactive sound experiences for connected everyday devices.

!!! Info
    If you already know all about Audio Orchestrator, you can go straight to the [downloads and installation instructions](installation.md) pages.

*Audio Orchestrator* was designed to explore a technology called [audio device orchestration](#what-is-orchestration). To try out audio device orchestration, have a look at our [trial productions](productions.md).

This documentation contains detailed guidance on how to use all of the features of *Audio Orchestrator*. If you just want to get started, it's probably best to read the [tool summary](#what-is-orchestrator) first. There's also an [example project](example.md) that's great for learning about the technology and the tool.

If you run into problems, try this documentation, especially the [FAQ](faq.md) or see if a similar issue was discussed in the [GitHub issues](https://github.com/bbc/bbcat-orchestration-builder/issues).

<a name="what-is-orchestration"></a>
## What is audio device orchestration?

Audio device orchestration is the concept of using multiple connected devices to play back an audio experience. Traditionally, audio playback has been limited to specific formats—for example, stereo or five-channel surround sound, which require a fixed number of loudspeakers in defined positions. However, it's becoming more and more common for listeners to have access to a number of devices that are capable of reproducing sound, including Internet-connected devices like mobile phones, tablets, and laptops. To make the most of these loudspeakers, it's necessary to have an audio system that is adaptive and flexible. That's where audio device orchestration comes in.

There are three key components to an orchestrated audio system.

* **Pairing.** The system needs to know about the available devices and how to send audio to them. In our system, this is handled by sharing a *pairing code*—a short numeric code that can be entered on a device to link it into a session. The pairing code can be embedded into a web link or shared as a QR code to make it as easy as possible to connect a device into a session.

* **Synchronisation.** The devices that are connected into a session need to be able to play the right audio at the right time. This is achieved by linking all of the devices to a *synchronisation server*—basically, they all agree on what time it is, so they can play back sounds when they're told. Different experiences require different levels of synchronisation accuracy. For example, narration might need to play back within a second of the intended time, spot effects within tens of milliseconds, and musical elements at exactly the same time. Our synchronisation system tends to get within 10 to 200 milliseconds, depending on the playback hardware used—and we also have a [tool for manual calibration](prototype.md#calibration-mode) that can improve synchronisation between devices.

* **Audio playback.** Once devices are connected and synchronised, they need to be able to play back some sound—and not necessarily the same sound on all of the devices. Object-based audio is a way of transmitting all of the different sounds that make up an experience separately so that they can be arranged in the best possible way. So if there's only one device, all sounds are played on that device. But if there are many devices, the different sounds can be spread out. How sounds are allocated to devices is up to you as the creator of an experience; *Audio Orchestrator* was designed to make this process as simple as possible.

If you're interested in seeing what an orchestrated audio experience might look like, you can try out the [various orchestrated productions that we've made](productions.md) (including audio drama and music). But remember, these are just a few possibilities, and the technology can be used for much more.

!!! Info
    We've published a large body of academic research exploring the concept of device orchestration—including collaborations as part of the [S3A project](http://www.s3a-spatialaudio.org/). If you're interested in finding out more, there are some links on blog posts [here](https://www.bbc.co.uk/rd/blog/2019-11-audio-experiences-device-orchestration) and [here](https://www.bbc.co.uk/rd/blog/2020-06-audio-sound-aes-convention).


<a name="what-is-orchestrator"></a>
## What is Audio Orchestrator?

*Audio Orchestrator* is a production tool that lets you try out audio device orchestration with your own content. It handles the three components of an orchestrated system detailed above (pairing, synchronisation, and playback), so that you can design and build immersive and interactive audio experiences that adapt to the available devices.

The output of this process is a [prototype web application](prototype.md) that lets listeners connect devices to listen to the content.

<a name="workflow"></a>
The overall workflow has three steps.

1. **Create your audio files.** You can create audio files however you like, or use existing files, but there are some [strict requirements on how the audio is formatted](preparing-audio.md) before it's loaded into *Audio Orchestrator*.

2. **Use *Audio Orchestrator* to build an experience**. Once you've [installed *Audio Orchestrator*](installation.md), use the [Home page](projects.md) to create a new project or load an existing one. Then work through the following steps to set up your experience.

    * Add different sections of content on the [Sequences page](sequences.md)—anything from a single standalone section to a complex branching narrative where the listener can choose what comes next.

    * Add the ability for the listener to interact with the experience on the [Controls page](controls.md). The listener can make choices that affect how the audio objects are allocated to devices.

    * Decide how objects should be allocated to devices on the [Audio page](audio.md). This is where you determine how your experience will flexibly adapt to the available devices.

    * Test out your behaviours on the [Monitoring page](monitoring.md). You can see how your audio objects will be allocated to any number of virtual devices, as well as connecting *Audio Orchestrator* up to a digital audio workstation so you can hear your experience while you work on it.

    * Customise the look and feel of your prototype application on the [Appearance page](appearance.md).

3. **Preview or export your experience**. On the [Export page](export.md), you can test out the experience that you've set up by previewing the web application in your browser and connecting devices. Make any changes, and when you're ready, export the application to share with others.

!!! Tip
    If you just want to start making something without adding sequences or controls, you can go straight to the [Audio page](audio.md).

!!! Tip
    We've found it helpful to have a good idea of how you'd like to use the orchestration capabilities in advance of starting production. Think about how listeners will consume your experience, what types of device they'll be able to connect, and what device orchestration can add to the listening experience. Having a good idea of this will make it easier to use the production tool. Though that's not to say that you can't just jump in and experiment!
