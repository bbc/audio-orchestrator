# Export page

The output from using *Audio Orchestrator* is a [prototype web application](prototype.md) for the orchestrated audio experience that you've built. From the Export page, the application can either be [previewed](#export-preview) or [exported](#export-export).

* If you preview the application, all you need to do is point your browser at the right URL (which will be shown in *Audio Orchestrator*)—but you'll have to have *Audio Orchestrator* running and can only connect devices on the same network.

* If you export, you'll need to set up a server to host the application somewhere. It can then be accessed by anyone with the link, and devices can even connect to the same session from different networks.

The Export page has a [validation section](export.md#export-validation), where you can see if there are any problems that will stop the preview or export from working. It has some [advanced settings](export.md#export-settings)—in the majority of cases, these can be safely left at their defaults. And finally, it has [buttons](export.md#export-buttons) for starting a preview or exporting the application.

<a name="export-validation"></a>
## Validation

The **validation** section shows whether or not valid settings have been made throughout the project.

* Boxes with a tick and a green background show that the settings are fine.

* Boxes with an exclamation mark and a yellow background indicate a warning. You'll still be able to preview or export the application, but might want to consider making adjustments.

* Boxes with a cross and a red background indicate an error. You won't be able to preview or export without fixing these.  

If you see a warning or error, there'll be a button on the right hand side of the box that will take you to the page in *Audio Orchestrator* where you can fix the problem.

There are two columns of status boxes.

* The left hand column shows the status of various **settings**.

    * **Appearance settings** shows whether the settings on the [Appearance page](appearance.md) are complete and valid.

    * **Advanced settings** shows whether the [advanced settings](#export-settings) on the Export page are complete and valid.

    * **Image file** shows whether the [image](appearance.md#cover-image) added on the Appearance page is valid.

* The right hand column shows the status of each [sequence](sequences.md).


<a name="export-settings"></a>
## Export settings

!!! Tip
    The export settings section includes various advanced settings related to the [prototype application](prototype.md). These are hidden by default, and in most situations you will not need to change them.

To edit the **advanced settings**, click on the arrow or "Advanced settings" label.

* **Short joining link**. On the instructions page of the [prototype application](prototype.md), there is a link to the connect page for adding an aux device. It's possible to shorten this link using a URL-shortening service. You can change the link that's displayed to the listener here.

* **Synchronisation Service**. Synchronisation between devices can either utilise a synchronisation server (Cloud-Sync) or be performed in the browser (PeerJS). See below for more information on these.

* **Custom Cloud-Sync service hostname** and **Port number**. By default, a server hosted by BBC R&D is used. If you are running your own [Cloud-Sync server](https://github.com/2-IMMERSE/cloud-sync), you can point to its hostname here. The port number is only required for servers not using an SSL certificate and should be left empty to use a default secure WebSocket (`wss://`) connection.

* **Audio base URL**. If the audio files are served from a separate content delivery network, the URL can be set in this field.

* **Custom template path**. You can point to a template directory on your computer to use instead of the built-in prototype application template, if you wish to make additional changes to its functionality or appearance in the source code. See [Using a custom template](custom-template.md) for more information on this feature.

!!! Info Cloud-Sync
    [Cloud-Sync](https://github.com/2-IMMERSE/cloud-sync) is a collection of programs running on a server and facilitates synchronisation, messaging, and sharing of content timelines between devices in all sessions. The BBC is running a public server for Audio Orchestrator users to evaluate it, but it is recommended to set up your own server for larger-scale production use. It was developed by the BBC and others as part of the 2-IMMERSE project.

!!! Info PeerJS
    [PeerJS](https://peerjs.com/) is a library for making peer-to-peer connections directly between devices. The authors run a public server to facilitate the initial connection, but all information about the content and synchronisation is then exchanged directly between devices. In effect, some key parts of the Cloud-Sync software are running within the web browser on the main device for each session, instead of a central server.

    Support for PeerJS in the prototype application is experimental and may not be as reliable or achieve as accurate synchronisation as Cloud-Sync.

<a name="export-buttons"></a>
## Export

The **export** section has two options: "Start preview" and "Export".

If there are any errors in the [validation settings](#export-validation), you won't be able to preview or export. Fix the errors then return to the Export page.

<a name="export-preview"></a>
### Previewing your project

Clicking "Start preview" will run the prototype application locally. All you'll need to do is point your browser at the right URL (which will be shown in *Audio Orchestrator*)—but you'll have to have *Audio Orchestrator* running and can only connect devices on the same network.

When you click "Start preview", the "Export as preview" dialogue will open. You'll see a progress bar whilst *Audio Orchestrator* prepares your application. This may take a bit of time, particularly for projects with many audio files. When this process has finished, you'll see a web link that lets you try out your experience on any device that's connected to the same network as the device on which you're running *Audio Orchestrator*. There are a few ways to open the link.

* Type the link into your browser (or copy and paste it).
* Scan the QR code.
* Click the "Open in browser" button.

!!! Tip
    The link to your application might look slightly different to the type of link you're used to—it will be made up of numbers separated by fullstops and colons. This is an IP address and will work just like a normal web link in your browser.

Clicking "Stop preview" will stop the preview so you can make changes to the experience.

<a name="export-export"></a>
### Exporting your project

Clicking "Export" will allow you to save the code and audio files that make up your experience. This means that you can host the experience wherever you like, and that devices connecting to a session will not need to be on the same network.

When you click "Export", you'll see a progress bar whilst *Audio Orchestrator* prepares your application. This may take a bit of time, particularly for projects with many audio files. When this process has finished, you'll see a save dialogue. Choose where you'd like to save your application then click "Save". Then click "Close" to return to *Audio Orchestrator*, or "Show in folder" to reveal your exported files.

!!! Tip
    To try out your exported application locally, you won't just be able to open the `index.html` file; you'll need to serve the application. A simple way of doing this is using the *Python 3* `http.server`.

    * Open *Terminal*.
    * Navigate to the `dist` folder of your exported application.
    * Run `python -m http.server 8000`.
    * In the browser, navigate to `localhost:8000`.

    Note that these commands assume that you're using *Python 3*. You can check which version you're using by typing `python -V` into *Terminal*.

    With a local server, you'll only be able to connect devices that are connected to the same network as the hosting device.
