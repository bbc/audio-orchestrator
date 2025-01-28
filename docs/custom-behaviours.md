# Custom behaviours

Custom behaviours give you more flexibility to determine how objects should be allocated than [fixed behaviours](fixed-behaviours.md) or [control-linked behaviours](control-linked-behaviours.md).

There are seven custom behaviour types ([*Preferred if*](#if-conditions), [*Allowed if*](#if-conditions), [*Prohibited if*](#if-conditions), [*Gain adjustment if*](#gain-adjustment), [*Exclusive*](#exclusive), [*Change management*](#change-management), and [*Mute if*](#mute-if)), which are detailed below.

!!! Tip
    To understand and use custom behaviours, it is useful to understand a bit about how objects are allocated to devices. See the [allocation algorithm description](allocation-algorithm.md) for more information.

## Custom behaviour types

The custom behaviours detailed below give you very detailed and flexible control of how objects are allocated to loudspeakers, and what happens when something changes (such as the number of devices available, or the listener changing a control setting on a device).

<a name="if-conditions"></a>
### Preferred if, Allowed if, and Prohibited if

The *Preferred if*, *Allowed if*, and *Prohibited if* behaviours can be used for detailed control of the conditions under which devices will be *preferred*, *allowed*, or *prohibited* for the object to which the behaviour is applied. See the [allocation algorithm description](allocation-algorithm.md) for more details.

* **Preferred if**. Any device that fulfils all of the conditions added to this behaviour will be *preferred* for the object. Objects set to play from a single device will play from a *preferred* device if possible (and an *allowed* device if not). Objects set to play from multiple devices will play from all *preferred* and *allowed* devices.

* **Allowed if**. Any device that fulfils all of the conditions added to this behaviour will be *allowed* for the object. Objects set to play from a single device will play from an *allowed* device if a *preferred* device is not available. Objects set to play from multiple devices will play from all *preferred* and *allowed* devices.

* **Prohibited if**. Any device that fulfils all of the conditions added to this behaviour will be *prohibited* for the object. That means that the device won't be able to play the object regardless of any other behaviours.

!!! Tip
    A device being *prohibited* for an object will mean that the object will not be played by that device even if it is *preferred* or *allowed* by some other behaviours.

<a name="adding-a-condition"></a>
#### Adding a condition

To add a condition, click the "Add condition" button. You will see a card with the title *Condition* and three fields.

!!! Tip
    If you don't add any conditions, the behaviour will apply to all devices. So, an *Allowed if* behaviour with no conditions will mean the the object is allowed on every device. And a *Prohibited if* behaviour with no conditions will mean that the object is prohibited on every device.

* The first field specifies the **metadata that the condition will act on**. This can relate to controls, devices, or the session. It includes the items detailed in [Metadata that behaviour conditions can act on](#metadata).

* The second field specifies a **comparison operator** that will be used to compare the value of the metadata selected in the first field against the condition value set in the third field. The available operators depend on the metadata selected; the possible settings are detailed in [Comparison operators](#comparison-operators).

* The third field specifies a **condition value**, which is used in the comparison. Devices for which the condition value is met will be *preferred* for the object. For some metadata types, you'll be able to select from the available condition values. You might be able to set one value or multiple values depending on the comparison operator set in the second field.

If any of the three fields are empty, you will not be able to add the behaviour (you'll see an error message *"Not all settings are complete"*).

You'll also see an **invert condition** checkbox. This has the effect of reversing the [comparison operator](#comparison-operators) that you've set.

!!! Example

    **Using the *invert condition* checkbox**

    If you wanted an audio object to play on any device types apart from mobile phones, you could set the following condition.

    * Metadata: *Device type*.
    * Comparison operator: *Any of*.
    * Condition value: *Tablet*, *Desktop/laptop*.
    * Invert condition: unchecked.

    But it might be more efficient to use the *invert condition* checkbox, and to set the following condition.

    * Metadata: *Device type*.
    * Comparison operator: *Equal to*.
    * Condition value: *Mobile*.
    * Invert condition: checked.

    These two conditions would have exactly the same effect.

#### Handling multiple conditions and behaviours

If a single *Preferred if*, *Allowed if*, or *Prohibited if* behaviour has multiple conditions, all of them will need to be met for the object to be *preferred*, *allowed*, or *prohibited* respectively.

Multiple *Preferred if* behaviours can be added to the same object. In this case, the object will be *preferred* if the conditions in one or more of the *Preferred if* behaviours are met. The same is true for the *Allowed if* and *Prohibited if* behaviours.

<a name="gain-adjustment"></a>
### Gain adjustment if

The *Gain adjustment if* behaviour works like the *Preferred if*, *Allowed if*, and *Prohibited if* behaviours described above, only rather than changing whether or not the object is allocated to a device, it changes the gain at which it is rendered on each device to which it is allocated.

The value by which the gain will be adjusted (on devices where the conditions are met) is specified in dB. A negative gain will make the object quieter, and a positive gain will make it louder.

Conditions are added as [detailed above](#adding-a-condition).

!!! Tip
    * If no conditions are added, then the object's gain will be adjusted on every device that it's allocated to.

    * Multiple gain adjustments, including those from the [*All applicable with gain reduction* fixed behaviour](fixed-behaviours.md#number-of-devices), will be compounded. However, there is a cap at a +12 dB gain increase.  

<a name="exclusive"></a>
### Exclusive

The *Exclusive* behaviour is used to ensure that only one object is played from a certain device.

When the *Exclusive* behaviour is added to an object, that object will not be allowed to play from a device that already has one or more objects allocated, and no other objects will be allowed into the device that the exclusive object is allocated to.

The *Exclusive* behaviour has no additional settings.

!!! Tip
    **Exclusive objects and object order**

    Objects are allocated one at a time by the algorithm. Therefore, the order of objects is particularly important when dealing with exclusive objects for two reasons.  

    * Exclusive objects will not be allowed to play from any devices that already have one or more allocated objects. So, for example, if an object that is processed before the exclusive object is allocated to all of the available devices, the exclusive object will not be allocated.

    * No other objects will be allowed to be allocated to the device that the exclusive object is allocated to. So if an exclusive object is the first to be allocated to a device, then other objects won't be played from that device (and therefore might not be played at all if no other suitable devices are available).

    This can be managed by careful combination of behaviours to ensure that exclusive objects are handled as you desire. For example, you might consider prohibiting the exclusive object from playing unless there are a number of aux devices available.  

    Objects are processed in the order in which they appear in the [audio object table](audio.md). See the [Preparing audio assets](preparing-audio.md) page for more information on how to set the object order.

<a name="change-management"></a>
### Change management

As discussed in the [allocation algorithm description](allocation-algorithm.md), the allocation algorithm (which allocates objects to loudspeakers) runs every time there is a change in metadata. This happens, for example, when a device joins or leaves the session, or when the listener changes a control value.

Rerunning the allocation algorithm ensures that the reproduction can adapt to the available devices even if this changes. However, in many cases there is some element of randomness to object allocation (for example, when an object's *Number of devices* fixed behaviour is set to *One device only* but there is more than one *preferred* or *allowed* device).

In some situations, it may be desirable to make objects stay in their current devices even if something changes. In other cases, you may want to force objects to change loudspeakers as often as possible.

It's also possible that objects could drop in and out as changes mean that at some times there is a suitable device available, and at other times there isn't. Maybe you want an object to stop playing if there's no suitable device and to never come back. Or maybe if an object isn't playing at the start of a sequence, it should never start.

All of these possibilities—and more—can be set up by using the ***Change management*** behaviour. It's possible that you'd like a different approach to handling these changes for different audio objects. This can be achieved by applying different *Change management* behaviours to different objects.

The *Change management* behaviour has two parameters: *When can the object start?* and *When can the object move?*.

* **When can the object start?** Determines under what circumstances the object is allowed to start playing (or restart if it had been played before and then stopped due to lack of a suitable device). One of the following options can be selected.

    * **Can always start**. There are no restrictions on when the object can start; if there is a suitable device, it will be allocated.
    * **Can never restart**. The object can be allocated for the first time at any point during the sequence. If after starting, the object cannot be allocated, it will not restart for the remainder of the sequence.
    * **Can only start at the beginning of the sequence**. If the object is not allocated at the very beginning of the sequence, it will not be allowed to start at any time during the sequence. If it is allocated at the very beginning of the sequence but subsequently drops out, it will not restart for the remainder of the sequence.

* **When can the object move?** Determines when the object can or should move to a different device. Multiple values of this parameter can be selected. The selected values will be attempted in the order specified below (from 1 to 4). If an option is attempted by the algorithm but can't be met (for example, if there are no suitable devices), then the next selected option will be tried, and so on. If none of the selected options can be applied, or if no options are selected, then the object will not be allocated.

    * **1: Move to more preferred device**. The object will move to a more *preferred* device. If the object was already in a *preferred* device, and that device is still available, then it will not move. If the object was in a *preferred* device and that device is no longer available, then it will move to another *preferred* device. If the object was in an *allowed* device and a *preferred* device becomes available, it will move to that *preferred* device.
    * **2: Stay in previous device**. The object will stay in the device to which it was previously allocated.
    * **3: Move to allowed device (can't stay in previous device)**. The object will move to a different *allowed* device (prioritising *preferred* devices if any are available).
    * **4: Move to any allowed device**. The object will play from any *allowed* device, including the device to which it was previously allocated. *Preferred* devices will be prioritised.

!!! Tip
    **Combining *When can the object move?* options**

    The *When can the object move?* options are designed to be used individually or in conjunction with each other.

    For example, if option 1 (*Move to more preferred device*) is the only option selected but there are no more *preferred* devices available, then the object will not be allocated. So, to move to a *preferred* device if there's one available but to continue playing from any suitable device if not, it's necessary to select options 1 and 4.

    Likewise, if you'd like the object to *Stay in previous device* (option 2), but the previous device is not available, then the object will stop playing unless option 3 and/or option 4 are also selected.

    This gives a great deal of control over what happens to objects when there is a change.

If *Change management* is applied to an object that is allowed into more than one device, then the *When can the object move?* parameter will have no effect.

If no *Change management* behaviour is applied, the object *Can always start* and will be allocated to any suitable devices as described in the [allocation algorithm description](allocation-algorithm.md).

!!! Tip
    **Default settings of the *Change management* behaviour**

    If a *Change management* behaviour is added to an object and the default settings are not changed, the result will be as follows.

    * There will be no restrictions on when the object can start.
    * The object will move to a more *preferred* device if possible. If that is not possible, it will stay in the previous device. If that is also not possible, it will move to any *allowed* device. Finally, if that is not possible, it will stop playing.

<a name="mute-if"></a>
### Mute if

The *Mute if* behaviour is used to mute an object if a different, specified object (the *reference object*) is currently allocated.

Select a *reference object* from the dropdown list, then click "Save" to add the behaviour.

Whenever the reference object is allocated to any device, the object to which the behaviour is added will be muted.

If you have not specified a reference object, you will not be able to add the behaviour (you'll see an error message *"Not all settings are complete"*).

Multiple *Mute if* behaviours can be added to the same object. In this case, the object will be *muted* if any of the reference objects are allocated.

!!! Tip
    * *Mute if* is achieved by reducing the object gain; the object is technically still allocated. Consequently, the object label will still be displayed on the [prototype application](prototype.md) if that option is selected on the [Appearance page](appearance.md#interface-options).
    * A similar result can be achieved by using a *Prohibited if* behaviour with the *Objects allocated to any device* condition. However, that solution will not work if the object to which the behaviour applies is processed before the reference object by the [allocation algorithm](allocation-algorithm.md). With *Mute if*, the muting does not depend on the object order.

!!! Example
    An audio drama has two objects: *Extra content*, which is unlocked by adding an aux device; and *Filler*, which is played when the listener hasn't connected an aux device (i.e. to fill the gap left by the absence of the *Extra content*).

    * For the *Extra content* object, the [number of devices](fixed-behaviours.md#number-of-devices) fixed behaviour is set to *Aux devices only*.

    * The *Filler* object has a *Mute if* behaviour with the reference object set to *Extra content*.

    * If there is only a main device, the *Extra content* won't be allocated, so the *Filler* won't be muted. But if an aux device is added, the *Extra content* will be allocated and the *Filler* will be muted.  

<a name="metadata"></a>
## Metadata that behaviour conditions can act on

The [*Preferred if*](#preferred-if), [*Allowed if*](#allowed-if), and [*Prohibited if*](#prohibited-if) behaviour conditions can act on the following metadata types.

### Device controls metadata

* **Controls** that you've set up (see the [Controls](controls.md#control-values) page documentation).

### Device metadata

* **Main device**. Whether or not the device is the main device (*true* or *false*).
* **Device type**. The type of device (*tablet*, *mobile*, or *desktop/laptop*).
* **Joining number**. A number specifying the order in which aux devices join the session. The main device has joining number 1.
* **Current number**. The joining number corrected for any devices that have dropped out of the session. For example, if there are three devices, then the device with joining number 2 drops out, the device with joining number 3 will have current number 2.
* **Objects allocated to same device**. For each device, the audio objects that have already been allocated to it. Note that this will only include objects that have been processed earlier than the object to which the behaviour is being added (i.e. those with lower object numbers).

!!! Example
    The *Objects allocated to same device* metadata can be used, for example:

    * with a *Prohibited if* behaviour to prevent two objects from being allocated to the same device as each other; or
    * with a *Preferred if* behaviour to encourage objects into the same device where possible.

### Session metadata

* **Number of devices currently connected**. The number of devices currently connected to the session, including the main device and any aux devices.
* **Objects allocated to any device**. The audio objects that have already been allocated to any device. Note that this will only include objects that have been processed earlier than the object to which the behaviour is being added (i.e. those with lower object numbers).

<a name="comparison-operators"></a>
## Comparison operators

The following comparison operators are available to make comparisons for one or more of the metadata types listed above.

* **Equal to**. The value of the selected metadata must be equal to the condition value.
* **Less than**. The value of the selected metadata must be less than the condition value.
* **Less than or equal to**. The value of the selected metadata must be less than or equal to the condition value.
* **Greater than**. The value of the selected metadata must be greater than the condition value.
* **Greater than or equal to**. The value of the selected metadata must be greater than or equal to the condition value.
* **Any of**. The value of the selected metadata may be any of the condition values.
* **Every Nth value**. For numerical metadata, this operator matches a repeating pattern of values, and is specified with a gap and an offset (e.g. *Every 4th, starting at 3* matches {3, 7, 11, 15, ...}).

!!! Example
    The *Every Nth value* operator can be used to assign objects sequentially to devices as they're added, looping back around to the first object when there are more devices than objects. For example, in a situation with four objects, you could set the following behaviours.

    * Object 1: *Allowed if* `Joining number` `Every Nth value` `Every 4th, starting at 1`.
    * Object 2: *Allowed if* `Joining number` `Every Nth value` `Every 4th, starting at 2`.
    * Object 3: *Allowed if* `Joining number` `Every Nth value` `Every 4th, starting at 3`.
    * Object 4: *Allowed if* `Joining number` `Every Nth value` `Every 4th, starting at 4`.

    In this situation, the four objects would be allocated to the first four devices in the session. If a further device joined, object 1 would be allocated to the fifth device. Object 2 would be allocated to a sixth device, and so on.
