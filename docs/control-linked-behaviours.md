# Control-linked behaviours

Behaviours determine how each object should be allocated to devices (see the [Handling audio objects](audio.md) page). In addition to the [fixed behaviours](audio.md#fixed-behaviours), which define the device roles and number of devices that should be used for an object, you can also add control-linked behaviours and [custom behaviours](custom-behaviours.md) for more detailed control.

Control-linked behaviours, as the name suggests, are directly related to [controls](controls.md) that you've set up. They allow you to quickly and easily enable those controls to influence object allocation in simple ways.

With control-linked behaviours, you can specify the control values for which devices will be *allowed* or *prohibited* for an object. For more information on exactly what that means, see the [allocation algorithm description](allocation-algorithm.md). Or, keep reading to find out how to use control-linked behaviours.

!!! Tip
    [Custom behaviours](custom-behaviours.md) can also be linked to controls if you need more flexibility than is offered by control-linked behaviours.

To add a control-linked behaviour, click the "Add behaviour" button in the [audio object table](audio.md#audio-object-table). If you have set up any controls, the control-linked behaviours will appear at the top of the dropdown list with orange dots, labelled *User control: [Control name]*. You can only add one instance of each control-linked behaviour to each object.

Once you've selected a control-linked behaviour, the *Initial settings* dialogue box will appear. Make the settings you'd like (as described below for the different control types), then click "Add to object".

!!! Tip
    It should be noted that if you add [control-linked behaviours](control-linked-behaviours.md) and [custom behaviours](custom-behaviours.md) to an object, these might affect each other. For example, a device that is *prohibited* by a control-linked behaviour will not be able to be used to play back that object regardless of any [custom behaviours](custom-behaviours.md) that you've set.

## Radio buttons control and checkboxes control

You can use the control-linked behaviour to determine whether or not an object can be allocated to a device depending on the control value.

The radio buttons control and checkboxes control have the same interface for control-linked behaviour settings.

Under the *Control values* heading, you'll see a list of potential options. For each of these, you can select *Allowed* or *Prohibited*.

* The object to which you've added the behaviour will be *allowed* on any devices where the listener has selected control values that are set to *Allowed*.
* The object to which you've added the behaviour will be *prohibited* from any devices where the listener has selected control values that are set to *Prohibited*.

If the control-linked behaviour references a control that doesn't have any options, a warning will be shown.


## Range control and button control

You can use the control-linked behaviour to set a range of values for which the object is allowed to be allocated to a device.

The range control and button control have the same interface for control-linked behaviour settings.

Under the *Control values* heading, you'll see two boxes labelled *Min* and *Max*.

* The object to which you've added the behaviour will be *allowed* on any devices where the listener has set a control value that falls within the range of values that you set in the *Min* and *Max* boxes.

* The object to which you've added the behaviour will be *prohibited* on any devices where the listener has set a control value that falls outside of the range of values that you set in the *Min* and *Max* boxes.

!!! Tip
    The range that you set in the *Min* and *Max* boxes includes those numbers and all numbers in between.

## Examples

!!! Example "Example 1"
    **Set device location**

    * A radio buttons control named *Where's your device?* was set up, with four options: *Left side*, *Right side*, *Front*, and *Rear*.

    * The producer wants the *Narrator* audio object to only be allowed to play from devices set to *Front*.

    * A control-linked behaviour is added to the *Narrator* audio object by clicking "Add behaviour" then "User control: Where's your device?".

    * The *Front* option is set to *Allowed*, and all other options are left as *Prohibited*.

    * The "Add to object" button is used to add the behaviour.


!!! Example "Example 2"
    **Select from extra content**

    * A checkboxes control named *Select content* was set up, with three options: *Director's commentary*, *Audio description*, and *Extra crowd ambience*.

    * The producer wants the extra content audio objects to only play on aux devices, and only when they're selected. They should play on all of the devices it's selected on.

    * The fixed behaviours for the *Director's commentary*, *Audio description*, and *Extra crowd ambience* audio object are set to *Aux devices only* and *All applicable devices*.

    * A control-linked behaviour is added to the *Director's commentary* audio object by clicking "Add behaviour" then "User control: Select content".
        * The *Director's commentary* option is set to *Allowed*.
        * The "Add to object" button is used to add the behaviour.

    * A control-linked behaviour is added to the *Audio description* audio object by clicking "Add behaviour" then "User control: Select content".
        * The *Audio description* option is set to *Allowed*.
        * The "Add to object" button is used to add the behaviour.

    * A control-linked behaviour is added to the *Extra crowd ambience* audio object by clicking "Add behaviour" then "User control: Select content".
        * The *Extra crowd ambience* option is set to *Allowed*.
        * The "Add to object" button is used to add the behaviour.


<!---
Select from extra content

A checkboxes control can be used to let the listener choose which extra content they'd like to hear on aux devices.

    A checkboxes control is added and renamed Select content.

    The control has three options: Director's commentary, Audio description, and Extra crowd ambience.

    It is only shown on aux devices, and only in the Main piece sequence.

    None of the options are checked by default.

    On the Audio page, the appropriate objects are set up so they're only allowed to play if the corresponding Select content value is checked.


-->


!!! Example "Example 3"
    **Fear factor control**

    * A range control named *Fear factor* was set up with a range from 0 to 100, a default value of 50, and a step size of 1.

    * The producer wants the *Monster sounds* audio object to only play on devices where the listener sets a *Fear factor* greater than 75.

    * A control-linked behaviour is added to the *Monster sounds* audio object by clicking "Add behaviour" then "User control: Fear factor".

    * The *Min* and *Max* control values are set to 76 and 100 respectively.

    * The "Add to object" button is used to add the behaviour.
