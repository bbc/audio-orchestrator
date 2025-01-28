# Controls page

Controls are displayed on the listeners' devices so they can make choices that affect object allocation. There are different types of control ([radio buttons](#control-radio), [checkboxes](#control-checkbox), a [range slider](#control-range), and a [button](#control-button)), and you can add as many as you need. After you've created controls, use the [Audio page](audio.md) to define how the controls affect object allocation and the [Monitoring page](monitoring.md) to check that they're working how you expected.

!!! Tip
    Controls are tied to the devices that they're shown on—they can only affect the audio that is sent to that device.

<a name="control-values"></a>
## Control values

Each control in your experience has a *value* that can be used by the object behaviours to determine how that object should be allocated. The value is set by the listener. Depending on the control type, controls can have one value, multiple values, or their value can be empty. Controls can have default values.

<a name="setting-up-a-control"></a>
## Setting up a control

A new project does not have any controls. To add a control, click "Add control". This will open a list of control types (detailed below). To add a control card, select the type that you need.

Click on the control name to change it. The name you set here will be shown to the listener.

At the top of every control card there are three buttons.

* The left and right arrow buttons can be used to **re-order the controls**. The further left the control is, the higher up it will be shown to the listener in the exported experience.

* The delete button can be used to **delete a control**.   

At the bottom of every control card, there are two further settings.

* **Device role**. This setting lets you select which devices the control is visible on. Choose from *any device role*, *main device only*, or *aux devices only*.

* **Sequences**. This setting lets you choose which [sequences](sequences.md) the control is visible in. Choose from any of the sequences that you've defined.

!!! Tip
    If you add a new sequence, that sequence will automatically be added to the allowed sequences list for any existing controls. So if you don't want those controls to be visible in your new sequence, remember to update the control settings.

The different control types are customisable in different ways.

<a name="control-radio"></a>
### Radio buttons control

The radio buttons control shows a group of options from which the listener can select only one.

* Click "Add option" to add a new option. Give the option a label (this will be seen by the user).

* If required, a default option can be selected. If no default is selected, the control value will be empty when the experience starts.

* Options can be deleted by pressing the delete button.

* Options in the group of radio buttons will be shown in the order in which they appear in the table.

<a name="control-checkbox"></a>
### Checkboxes control

The checkbox control shows a group of options from which the listener can select zero, one, or more options.

* Click "Add option" to add a new option. Give the option a label (this will be seen by the user).

* Choose whether you want each option to be checked or unchecked by default.

* Options can be deleted by pressing the delete button.

* Options in the group of radio buttons will be shown in the order in which they appear in the table.

<a name="control-range"></a>
### Range control

The range control shows a slider that the listener can use to set a numerical value.

* Set the minimum and maximum value of the slider.

* Set the step size—the smallest incremental change that can be made by moving the slider.

* Set the default value of the slider.

<a name="control-button"></a>
### Button control

The button control allows the listener to increment or decrement a counter by clicking a button.

* Set the label—this is the text that the listener will see on the button.

* Set the step size. The value of the control will be changed by this amount on each click. Use a positive number to increment the counter, or a negative number to decrement the counter.

* Set the default value, which is the initial numerical value of the control.

!!! Tip
    The button click could be used to trigger a [change in object allocation](allocation-algorithm.md) without taking its numerical value into account.

<a name="controls-examples"></a>
## Examples

!!! Example "Example 1"
    **Set device location**

    A radio buttons control can be used to let the listener tell you where they've put their device.

    * A radio buttons control is added and renamed *Where's your device?*.

    * The control has four options: *Left side*, *Right side*, *Front*, and *Rear*.

    * It is only shown on aux devices.

    * The *Where's your device* control can be linked to objects on the Audio page so that some objects are only allowed to play from devices in certain positions. For example, the narrator in a drama might only be allowed in devices with the *Front* option selected.

!!! Example "Example 2"
    **Select from extra content**

    A checkboxes control can be used to let the listener choose which extra content they'd like to hear on aux devices.

    * A checkboxes control is added and renamed *Select content*.

    * The control has three options: *Director's commentary*, *Audio description*, and *Extra crowd ambience*.

    * It is only shown on aux devices, and only in the *Main piece* sequence.

    * None of the options are checked by default.

    * On the Audio page, the appropriate objects are set up so they're only allowed to play if the corresponding *Select content* value is checked.


!!! Example "Example 3"
    **Fear factor control**

    A range control can be used to let the listener specify how scary they'd like the content to be.

    * A range control is added and renamed *Fear factor*.

    * The control has a range from 0 to 100, with a default value of 50 and a step size of 1.

    * On the Audio page, some objects (those with "scary" content) are set up so they're only allowed to play if the *Fear factor* range control is greater than 75.
