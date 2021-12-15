
# Comment Analysis Connector
This project allows to analyze and visualize class-comments here in Github. It was build as a seminar project for the Software Composition Seminar at the University of Bern and serves as a proof of concept.

## Installation
### API 
* To install the API, you first need to compile [Maenu's Comment-Analysis-Neon Repo](https://github.com/maenu/comment-analysis-neon) with `mvn package`  
  The reason is, that the outputted jar file is too big for the common maven package hosters.
* If the generation failes on the tests, your platform somehow doesn't behave as expected and you might try to run everything in a docker container or .
* Copy the generated jar to `/api/lib/comment-analysis-neon.jar`
* Now it's a standard Maven Project you can either run or compile to a jar

### Chrome-Plugin
* Go to [chrome://extensions/](chrome://extensions/) and enable the developer-mode in the top right corner
* Now click on "Load unpacked" and just select the local `chrome-plugin` directory
* Now, in the top bar, when clicking on the icon ![](https://github.com/fadnincx/comment-analysis-connector/blob/master/chrome-plugin/images/icon16.png?raw=true) a small window should appear in which you can first enable and disable this plugin and secondly, you can configure the address at which the API can be reached.


## Getting started / Usage
The usage is relatively simple. After the installation of both parts, if the API is running and configured in the plugin (only necessary if you change the default), and you enabled the plugin in the configuration window, just browse to any Java, Python or Pharo repository on Github and you should see a result.

As an information, if the plugin is activated, a small colored triangle appears in the top right corner. This can be disabled in `chrome-plugin/content.js` on line 24 `const cornerEnable = false`. There you can also change the different colors. The default color are 
* ![](https://via.placeholder.com/15/0000ff/000000?text=+)There has been done nothing. Either there is no appropriate code on this page, or we still wait for a response from the API
* ![](https://via.placeholder.com/15/00ff00/000000?text=+)Analysis successfully added to the page
* ![](https://via.placeholder.com/15/ff0000/000000?text=+)There is an error when calling the AP

Once the corner is green, you should see some parts of your comments underlined. If you hover at any location, you can see in a tooltip, the label placed at that location. If you want to see all locations with a specific label, there is a small overlay on the right side (which is movable), and if you hover over a label there, all appearances get highlighted.


## Repo Structure
### `api/Docker` and `api/docker-compose.yml`
A docker and docker-compose file is provided, to run the API in a docker container, as we experienced some systems don't behave as expected applying the analysis algorithm of the `comment-analysis-neon`-packet.

### `api/src/main/java/ch/unibe/scg/comment/analysis/connectorapi/`
The folder is, where our REST-API is defined.
* `AnalysisRange.java`  
   Defines an object, with a range (from, to) and an array of labels for this range. It's used as part of the API output.
* `AnalysisResult.java`  
   Defines the object which is returned in JSON format from the API. It contains a list of `AnalysisRange` and further a `code` and `msg` to have the possibility to forward errors to the user.
* `ApiController.java`  
   Defines the REST endpoints. I.e. `/hello` to check if the API is successfully running and `/analysis` used by the Chrome plugin.
* `CliWrapper.java`  
   Is just a wrapper to use the `T12Classify.label` method from the `comment-analysis-neon`-packet and then wrap the output into an `AnalysisResult`.
* `ConnectorApiApplication.java`  
   Is the main Java file and starts the entire Spring framework.
* `MockAnalysis.java`  
   Is a class used in development of the Chrome plugin, to return a static output independent of the `comment-analysis-neon` CLI, as development was mostly parallel.

### `chrome-plugin`
This folder is, where the entire Chrome plugin is defined.
* `background.js`  
   This file contains the background service handler, doing everything that not be done on the page in the `content.js`
* `config.js`  
   Is the javascript file needed in `index.html`, the plugin configuration window
* `content.js`  
   This is the main file. It gets added to the scripts, when you browse github.com and does all the DOM handling there. In the top part, there are some styling and configuration possibilities, to adjust the appearance to your preferences.
* `index.html`  
   Describes the small window for the plugin configuration.
* `manifest.json`  
   The manifest describing the plugin and some meta data to Chrome, defines the active pages, request additional permissions and so on.
