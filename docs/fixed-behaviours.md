# Fixed behaviours

The two fixed behaviours are shown for every object. Their values can be selected from dropdown lists.

## Device role

The **device role** fixed behaviour lets you limit an object to certain device roles. There are three options.

* **Any device role** (default). The audio object is allowed to be allocated to the main device and/or to aux devices.
* **Main device only**. The audio object is only allowed to be allocated to the main device.
* **Aux devices only**. The audio object is only allowed to be allocated to aux devices.

!!! Tip
    * Note that this setting does not necessarily mean that the object *will* be allocated to the device roles on which it is allowed. This will depend on other behaviours that you add.
    * There can only be one main device. Therefore, if *Main device only* is selected, the *Number of devices* fixed behaviour will have no effect.

<a name="number-of-devices"></a>
## Number of devices

The **number of devices** fixed behaviour lets you determine whether an object is only allowed to be played by one device, or whether it can be played on as many appropriate devices as possible. There are three options.

* **One device only** (default). The audio object is only allowed to play from one device. The most suitable device will be selected based on other behaviours that you've set.
* **All applicable devices**. The audio object will play from all devices that are suitable (depending on other behaviours).
* **All applicable with gain reduction**. The audio object will play from all devices that are suitable (depending on other behaviours), but a gain reduction will be applied for each additional device to keep the overall reproduction level approximately consistent.

## Example

!!! Example
    A project has two sequences.

    * Two audio files have been imported into the first sequence. They are the left and right legs of a stereo file, so they have been panned 100% left and 100% right respectively. The fixed behaviours are set so that both objects can only play from the main device.

    * Two audio files have been imported into the second sequence. The first can only play from the main device. The second can play from any device role, and will play from all applicable devices. There are no other behaviours, so the second object will play from the main device and all aux devices.
