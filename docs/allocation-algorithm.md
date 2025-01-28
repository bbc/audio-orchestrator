# The allocation algorithm

[Audio device orchestration](index.md#what-is-orchestration) is the concept of using multiple connected devices to play back an audio experience. It is capable of flexible, adaptable sound reproduction that takes into account the available loudspeaker devices.

In our orchestration system, audio objects are allocated to devices by an *allocation algorithm*. The allocations depend on:

* the [behaviours](audio.md#behaviours) that you've attached to each object;
* the properties of the available devices; and
* [control](controls.md) values that the listener has set.

Every time that some of this information changes, the objects are processed one at a time, in the order in which they appear in the [audio object table](audio.md#audio-object-table).

For each object, each available device is categorised as *preferred*, *allowed*, or *prohibited*. Devices can be given more than one of these labels, but in the final stage, any devices with a *prohibited* label cannot be used for the object.

In the final device selections:

* an object with the *All applicable devices* fixed behaviour setting will be allocated to all remaining *preferred* and *allowed* devices;

* an object with the *One device only* fixed behaviour setting will be assigned to a single device selected at random from any *preferred* devices, or from any *allowed* devices if there are no *preferred* devices;

* if there are no *preferred* or *allowed* devices, an object will not be allocated during that particular run of the allocation algorithm.

This gives a great degree of flexibility in how objects are assigned to devices, and means that the reproduction can adapt to any number of devices whilst still being controlled by you as the content producer.

## Change management

As noted above, the allocation algorithm runs every time there is a change in some of the information it uses (for example, if a new device is added, a device drops out, or the listener uses a control). This means that the experience is flexible and adaptable.

In some circumstances, there is an element of randomness to audio object allocations. If more than one device is *allowed* or *preferred*, but the object is only allowed into one device, then a random device will be selected. And this might change each time the allocation algorithm runs. Objects might even drop in and out as the available devices change.

In certain situations, that's the desired behaviour. But if you want to encourage consistency in allocations (for example, keeping an object in the same device wherever possible), a [*Change management behaviour*](custom-behaviours.md#change-management) can be added. This gives the producer much greater control of exactly what happens to the objects when there is some change.

If no *Change management behaviour* is applied to an object, it will be able to stop and start freely and will be allocated to any suitable devices as described above. See the [*Change management behaviour*](custom-behaviours.md#change-management) documentation for more information on how this can be customised.
