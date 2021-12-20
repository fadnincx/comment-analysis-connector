
  
# Comment Analysis Connector
This project allows to analyze and visualize class-comments here in Github. It was build as a seminar project for the Software Composition Seminar at the University of Bern and serves as a proof of concept.

## Overview
 [1. Reqirements](#requirements) <br />
 [2. Installation](#installation) <br />
 [3. Getting started / Usage](#getting-started--usage) <br />
 [4. Repo Structure](#repo-structure) <br />
 [5. References](#references) <br />
 [6. License](#license) <br />

## Requirements
 - Chrome browser (tested with version 96.0)
 - Java (>= 17) with Maven (>=3.8.1) or Docker (tested with 20.10.7)

## Installation
### Comment-analysis-neon API 
1.  To install the Comment-analysis-neon API, you first need to compile [Maenu's Comment-Analysis-Neon Repo](https://github.com/maenu/comment-analysis-neon) with `mvn package`  
  The reason is, that the outputted jar file is too big for the common maven package hosters.
2.  If the generation failes on the tests, your platform somehow doesn't behave as expected and you might try to run everything in a docker container or simply use the provided [docker-compose file](api/docker-compose.yml).
3.  Copy the generated `target/comment-analysis-neon-0.0.2-SNAPSHOT.jar` file to [`/api/lib/comment-analysis-neon.jar`](api/lib)
4.  Now the [`api`](api/) directory is a standard Maven project you can either run directly using the Maven tools or compile it to a jar, to then run the Comment-analysis-neon API without Maven.

### Comment-analysis-neon Chrome-Plugin
1. Go to [chrome://extensions/](chrome://extensions/) and enable the developer-mode in the top right corner
2. Now click on "Load unpacked" and just go to your local clone of this repo and select the `chrome-plugin` directory
3. Now, in the extension list of Chrome, near the URL field, when clicking on the icon ![](https://github.com/fadnincx/comment-analysis-connector/blob/master/chrome-plugin/images/icon16.png?raw=true) a small window should appear in which you can first enable and disable this plugin and secondly, you can configure the address at which the API can be reached.


## Getting started / Usage
The usage is relatively simple. After the installation of both parts [see here](#Installation), if the Comment-analysis-neon API is running and configured in the plugin (only necessary if you change the default), and you enabled the plugin in the configuration window, just browse to any Java, Python or Pharo repository on Github and you should see a result.
Just as an example:
 * A Java Repository would be [Elasticsearch](https://github.com/elastic/elasticsearch)
 * A Python Repository would be [Django](https://github.com/django/django)
 * A Pharo Repository would be [Pharo](https://github.com/pharo-project/pharo)

If the plugin is activated, a small colored triangle appears in the top right corner. This can be disabled in [`chrome-plugin/content.js`](chrome-plugin/content.js) on line 24 `const cornerEnable = false`. There you can also change its colors. The default color are 
* ![](https://via.placeholder.com/15/0000ff/000000?text=+) There has been done nothing. Either there is no appropriate code on this page, or we still wait for a response from the API
* ![](https://via.placeholder.com/15/00ff00/000000?text=+) The source code has been successfully analyzed
* ![](https://via.placeholder.com/15/ff0000/000000?text=+) The page is not analyzed due to an error in the communication with the Comment-analysis-neon API. Ensure the API is running and configured in the plugin as described [here](#Installation).

#### For example:

![](https://github.com/fadnincx/comment-analysis-connector/blob/master/res/screenshot-corner-blue.png?raw=true)
![](https://github.com/fadnincx/comment-analysis-connector/blob/master/res/screenshot-corner-green.png?raw=true)
![](https://github.com/fadnincx/comment-analysis-connector/blob/master/res/screenshot-corner-red.png?raw=true)



Once the corner turned into green, you can see the class comments underlined. Hovering at any location inside comments, a tooltip appears on the hovered line with a label. 
![](https://github.com/fadnincx/comment-analysis-connector/blob/master/res/screenshot-example-tooltip.png?raw=true) 

The label indicates the assigned category (intent) of the sentence. In order to see all occurrences of a specific label inside comments, a small overlay is added on the right upper side of the page (movable). Hovering over a label should display all its occurrences in the text. 

![](https://github.com/fadnincx/comment-analysis-connector/blob/master/res/screenshot-example-label-list.png?raw=true)



## Repo Structure
### [`api/Dockerfile`](api/Dockerfile) and [`api/docker-compose.yml`](api/docker-compose.yml)
We also provide a [docker](api/docker) and [docker-compose](api/docker-compose.yml) file to run the Comment-analysis-neon API in a docker container, as we experienced some systems don't behave as expected when running the analysis algorithm in the [`comment-analysis-neon`-packet](https://github.com/maenu/comment-analysis-neon).

### [`api/src/main/java/ch/unibe/scg/comment/analysis/connectorapi/`](api/src/main/java/ch/unibe/scg/comment/analysis/connectorapi/)
The folder is, where our REST-API is defined.
* [`AnalysisRange.java`](api/src/main/java/ch/unibe/scg/comment/analysis/connectorapi/AnalysisRange,java)  
   Defines an object, with a range (from, to) and an array of labels for this range. It's used as part of the API output.
* [`AnalysisResult.java`](api/src/main/java/ch/unibe/scg/comment/analysis/connectorapi/AnalysisResult.java)  
   Defines the object which is returned in JSON format from the API. It contains a list of `AnalysisRange` and further a `code` and `msg` to have the possibility to forward errors to the user.
* [`ApiController.java`](api/src/main/java/ch/unibe/scg/comment/analysis/connectorapi/ApiController.java)  
   Defines the REST endpoints. I.e. `/hello` to check if the API is successfully running and `/analysis` used by the Chrome plugin.
* [`CliWrapper.java`](api/src/main/java/ch/unibe/scg/comment/analysis/connectorapi/CliWrapper.java)  
   Is just a wrapper to use the [`T12Classify.label`](https://github.com/maenu/comment-analysis-neon/blob/master/src/main/java/ch/unibe/scg/comment/analysis/neon/cli/task/T12Classify.java) method from the [`comment-analysis-neon`-packet](https://github.com/maenu/comment-analysis-neon) and then wrap the output into an [`AnalysisResult`](api/src/main/java/ch/unibe/scg/comment/analysis/connectorapi/AnalysisResult.java)  .
* [`ConnectorApiApplication.java`](api/src/main/java/ch/unibe/scg/comment/analysis/connectorapi/ConnectorApiApplication.java)  
   Is the main Java file and starts the entire Spring framework.
* [`MockAnalysis.java`](api/src/main/java/ch/unibe/scg/comment/analysis/connectorapi/MockAnalysis.java)  
   Is a class used in development of the Chrome plugin, to return a static output independent of the [`comment-analysis-neon` CLI](https://github.com/maenu/comment-analysis-neon), as development was mostly parallel.

### [`chrome-plugin`](chrome-plugin/)
This folder is, where the entire Chrome plugin is defined.
* [`background.js`](chrome-plugin/background.js)  
   This file contains the background service handler, doing everything that not be done on the page in the [`content.js`](chrome-plugin/content.js)
* [`config.js`](chrome-plugin/config.js)  
   Is the javascript file needed in [`index.html`](chrome-plugin/index.html), the plugin configuration window
* [`content.js`](chrome-plugin/content.js)  
   This is the main file. It gets added to the scripts, when you browse github.com and does all the DOM handling there. In the top part, there are some styling and configuration possibilities, to adjust the appearance to your preferences.
* [`index.html`](chrome-plugin/index.html)  
   Describes the small window for the plugin configuration.
* [`manifest.json`](chrome-plugin/manifest.json)  
   The manifest describing the plugin and some meta data to Chrome, defines the active pages, request additional permissions and so on.
## References
 * [comment-analysis-neon CLI](https://github.com/maenu/comment-analysis-neon)
 * [SCG Software Composition Seminar - University of Bern](http://scg.unibe.ch/wiki/softwarecompositionseminar)
 * [Spring](https://spring.io/)
 * [Docker](https://www.docker.com/)
 * [docker-compose](https://docs.docker.com/compose/)
## License
GNU General Public License v3.0 or later
See [LICENSE](LICENSE) to see the full text.
