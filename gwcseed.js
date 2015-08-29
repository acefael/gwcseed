// -*-js-indent-level:2-*-
//
//
// GeoWebCache Seeder
//
// Written to run on node.js
//
// 2015, acefael.es
//
//

var http   = require("http")
var async  = require("async")
var fs     = require("fs")
var lazy   = require("lazy")

var gwc_port = 8001
var gwc_context = '/geowebcache'
var gwc_credentials = 'geowebcache:secured'

/// max number of tasks gwc can have in the queue
var MAX_TASKS = 2

/// index of 'current' task in 'tasks'
var ctask = 0

/// interval between checks for if new tasks can be published
var producerInterval = 500

/// array of seed request details
var tasks = new Array()

/// receives one of the item in tasks as a parameter
var consumerFunction = function( item , cb ) {
  var req = http.request( { port: gwc_port ,
                            path: gwc_context + '/rest/seed/'+item['layer']+'.json' ,
                            auth: gwc_credentials ,
                            keepAlive: true ,
                            method: 'POST' ,
                            headers: { 'Content-type': 'application/json' } } )
  var rdata = { name: item['layer'] ,
                bounds: {coords: { double: item['coords'] } } ,
                srs: {number: item['srs']} ,
                zoomStart: item['zoomStart'],
                zoomStop: item['zoomStop'],
                format:'image/png',
                type: item['type'],
                threadCount: 1 }
  rdata = { seedRequest: rdata }
  rdata = JSON.stringify(rdata)
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message)
  })
  req.write(rdata)
  req.end()
  cb()
}

/// a queue
var q = async.queue(consumerFunction,1)

/// producer timer
var int1

/// queries gwc for number of cached tasks
var producerFunction = function(){

  // seed status response
  var body = '';

  // called when response is here
  var endFunction = function() {
    var numTasks = JSON.parse(body)['long-array-array'].length
    while( numTasks++ < MAX_TASKS ) {
      // TODO it would be ideal to pull from a stream
      q.push(tasks[ctask++])
      if( ctask == tasks.length ) {
	clearInterval(int1)
	break
      }
    }
  }

  // send the task info request
  http.request( { port: gwc_port ,
                  path: gwc_context + '/rest/seed.json' ,
                  auth: gwc_credentials ,
                  keepAlive: true } ,
		function(res) {
		  res.on( 'data' , function(chunk) { body+=chunk } )
		  res.on( 'end' , endFunction ) } )
    .end()
}

//
// read tasks and fire off seeding
//
new lazy( fs.createReadStream("tasks.js") )
  .lines
  .map( function(l) { return JSON.parse(l.toString()) } )
  .forEach( function( task ) { tasks.push( task ) } )
  .on( 'pipe' , function(){
    // this fires off the check for number of tasks
    int1 = setInterval( producerFunction , producerInterval )
  })

