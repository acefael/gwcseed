# GWC Seeder

acefael, 2015

A tool for seeding GeoWebCache Layers through the GeoWebCache REST interface.

# Motivation

For performance reasons it is useful to seed GeoWebCache cached WMS layers.  Seeding a whole layer is an option, in case you can configure the area of interest as the gridSubset in the layer configuration.

If you want to seed dispersed areas, or want to automate the seeding process, then this tool is for you.

The GWC Seeder can be used to seed any number of areas in any number of layers and coordinate systems.  You can set up a nightly job to to the seeding.  You can split up big tasks to have good control over when the seeding process stops (when the node process terminates).

It is a requirement, but not yet implemented, to generate the layer / area configuration automatically (from a difference stream).

# Setup

    git clone https://github.com/acefael/gwcseed.git
    cd gwcseed
    npm install async
    npm install lazy

# Configuration

*You may have to edit a JavaScript file to adapt GWC Seeder to your environment.*

## Basic Settings

In `gwcseed.js` there are some configuration variables at the top, e.g. the GeoWebCache context path and server port.  These may need changing in your environment.

## Runtime Options

You might want to tweak:

* `gwcseed.js` configures `MAX_TASKS`.  That's the number of items in the Task Queue inside GeoWebCache that, when reached, makes the Seeder not post any more Tasks.
* inside `consumerFunction()`, `threadCount` is something for the GWC seeding engine.

## Seed Area and GWC Layers

The `tasks.js` file must be provided/changed to configure the seed area.  It contains a JSON object per line, each conforming to the following protocol:

* `srs`: EPSG code you want to seed
* `coords`: area to seed in this request
* `layer`: name of WMS layer in GeoWebCache
* `zoomStart`: zoom level to start seeding from
* `zoomStop`: zoom level to seed to
* `type`: allowed seed types are 'reseed', 'seed', 'truncate'

The items in the git repo sample seed tasks file `tasks.js` are somewhere over Madrid as I have used a WMS from CartoCiudad for testing purposes.

# The Way Forward

What I am thinking of changing in the future:

- [DONE] Read `tasks` from an external file
- [DONE] Add all currently in `consumerFunction()` hardcoded parameters of the GWC seed request to the items in `tasks`.
- Use configuration mechanism for the server settings.
- Logging
- Read tasks from a directory of files.
- Make consumer function parameters configurable, e.g. `threadCount` and `format`.
