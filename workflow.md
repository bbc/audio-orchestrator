## Workflow overview

### 1. Edit audio content in a digital audio workstation (DAW)

Use one track (or output bus) per object, and use the S3A Metadata Editor plugin to add orchestration metadata to each object.

Use track names beginning with the object number as used in the Metadata Editor.

Export a mono audio file for each object. Take care that the exported files are named according to the convention: starting with the object number, and ending with a channel specification (`M` for mono, equally routed to both speakers, or `L`/`R` for left and right stereo legs). For example, your files might be called `01_myFirstMonoObject_M.wav`, `02_aStereoObject_R.wav`, and `03_aStereoObject_R.wav`.

Export the orchestration metadata file from the S3A plugins. _TODO: Exporting is not yet implemented in the published version of the plugin -- you may have to use a metadapter plugin to get this information out._

### 2. Create a project and import audio and metadata

Open the _Orchestration Builder_ app and create a new project. You can edit its name by clicking it in the top left corner.

In the _Sequences_ tab, open the _Initial Sequence_.

In the _Audio_ section, link audio files (selecting all the exported files from the previous step).

In the _Metadata_ section, import the metadata file.

### 3. Wait for encoding to finish and start a preview

Go to the _Preview and Export_ tab and wait until the _Encoding Audio_ task reaches 100% -- encoding happens in the background so it may already be done.

NB: The _presentation settings_ and _loop sequence_ status checks may display errors, these can be safely ignored for an initial preview.

NB: If you are in R&D, connect to the `interwebs` network before starting the preview.

Click the _Preview_ button at the bottom of the page to build the application and start a web server. The build process may take a few minutes.

When it is finished, click _Open in browser_ to preview the application. You may be able to connect mobile devices if they are on the same Wi-Fi network.

After you have tried it, select _Stop preview_ to stop the server and close the preview dialogue.

### 4. Export options

The app supports three different export options, which can be selected after clicking the _Export_ button in the _Preview and Export_ tab.

  * _Audio only_ -- this exports the audio and metadata only. It is most useful to replace the audio if you previously created a distribution package for the project.
  * _Template code_ -- this creates a source code folder for the template application, including your audio and metadata. This can be a starting point for developing a custom application.
  * _Ready-built distribution_ -- this compiles the template code folder for you and creates a distribution package that can be uploaded to a web server without any further changes.
