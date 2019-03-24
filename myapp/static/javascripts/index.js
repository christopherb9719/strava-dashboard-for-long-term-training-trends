var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
var parseDate = d3.timeParse("%m/%d/%y");

var bb = document.querySelector ('#primary_graphs')
                    .getBoundingClientRect();

var width = bb.right - bb.left;

document.getElementById('mergeGraphs').style.display = "none";
$('#single_user').addClass( 'active' )



function showSecondarySliders() {
  var dom = document.getElementById("graph2sliders");
  var display = dom.style.display;
  if (display == "none") {
    dom.style.display = "";
  }
  else {
    dom.style.display = "none";
  }
}


showSecondarySliders();
var margin = {top: 20, right: 20, bottom: 50, left: 70},
    w = width - margin.left - margin.right,
    h = 500 - margin.top - margin.bottom;

var graphSets = [];
var dataObjects = [];

var secondaryFilterObject;
var graphSet2;
var dataObject2;
var clicked = false;

// Add the tooltip container to the vis container
// it's invisible and its position/contents are defined during mouseover
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

//Build Graphs
var globalFilters = new Filters(dataset);
var graphSet1 = new graphSet(margin, w, h, "primary_graphs");
var dataObject1 = new DataObject(dataset, "1", "#ff471a", graphSet1);
graphSet1.buildGraphs(dataObject1.getFilterObject(), dataset);
graphSet1.updatePlots(dataObject1.getFilteredData(), dataObject1.getFilterObject(), dataObject1.getColour(), dataObject1.getId());
updateTrendline(dataObject1.getFilteredData(), graphSet1.getScatter(), "line_primary", dataObject1.getId(), dataObject1.getColour());
graphSets.push(graphSet1);
dataObjects.push(dataObject1);


function split() {
  d3.select('#primary_graphs').selectAll('div').remove();

  document.getElementById('primary_graphs').className = "col-6";
  document.getElementById('secondary_graphs').className = "col-6";

  var bb = document.querySelector ('#primary_graphs')
                      .getBoundingClientRect();

  var width = bb.right - bb.left;

  var filterObject = new Filters(dataset)
  var graphSet1 = new graphSet(margin, width, h, "primary_graphs");
  dataObject1.setGraphSet(graphSet1);
  dataObject1.getGraphSet().buildGraphs(filterObject, dataObject1.getData());
  dataObject1.getGraphSet().updatePlots(dataObject1.getFilteredData(), dataObject1.getFilterObject(), dataObject1.getColour(), dataObject1.getId());
  updateTrendline(dataObject1.getFilteredData(), graphSet1.getScatter(), "line_primary", dataObject1.getId(), dataObject1.getColour());


  var bb = document.querySelector ('#secondary_graphs')
                      .getBoundingClientRect();

  var width = bb.right - bb.left;

  var graphSet2 = new graphSet(margin, width, h, "secondary_graphs");
  dataObject2.setGraphSet(graphSet2);
  dataObject2.getGraphSet().buildGraphs(filterObject, dataObject2.getData());
  dataObject2.getGraphSet().updatePlots(dataObject2.getFilteredData(), dataObject2.getFilterObject(), dataObject2.getColour(), dataObject2.getId());
  updateTrendline(dataObject2.getFilteredData(), graphSet2.getScatter(), "line_secondary", dataObject2.getId(), dataObject2.getColour());
}


function createGraphs(d, line_points, colour) {
  if (clicked == false) {
    //Upadate buttons
    document.getElementById('addChart').innerText = "Remove Data";
    document.getElementById('addChart').title = "Remove the Second Layer of Data from the graph";
    document.getElementById('mergeGraphs').style.display = "inline";
    document.getElementById('mergeGraphs').value = "true";
    document.getElementById('mergeGraphs').innerHTML = "Split Graphs";
    document.getElementById('mergeGraphs').title = "Merge the Data Layers back into one graph";

    clicked = true;

    //Update Graphs
    console.log("Creating new graphs");
    dataObject2 = new DataObject(d, "2", "#00e600", graphSet1);
    dataObjects.push(dataObject2);
    updateGlobalFilters();
    updateGraphScales();
    updateTrendline(dataObject2.getFilteredData(), dataObject2.getGraphSet().getScatter(), "line_secondary", dataObject2.getId(), dataObject2.getColour());

    //Set up sliders for second set of graphs
    showSecondarySliders();
    document.getElementById('sliders').className = "col-6";
    document.getElementById('graph2sliders').className = "col-6";

    $(function() {
      var min_date;
      var max_date;
      $( "#graph2slider" ).slider({
        range: true,
        min: new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000,
        max: new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000,
        values: [new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000, new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000],
        slide: function( event, ui ) {
          dataObject2.getFilterObject().setDates(ui.values[0] * 1000, ui.values[1] * 1000);
          globalFilters.setMinDate(getMinDate());
          globalFilters.setMaxDate(getMaxDate());
          updateGraphScales(dataObject2);

          min_date = new Date(ui.values[0]*1000);
          max_date = new Date(ui.values[1]*1000);
          $("#date2" ).val(min_date.getDay()+1 + "/" + parseInt(min_date.getMonth()+1) + "/" + min_date.getFullYear() +
              " - " + parseInt(max_date.getDay()+1) + "/" + parseInt(max_date.getMonth()+1) + "/" + max_date.getFullYear());
        }
      });
      d1 = new Date($( "#graph2slider" ).slider( "values", 0 )*1000);
      d2 = new Date($( "#graph2slider" ).slider( "values", 1 )*1000);
      $("#date2" ).val(d1.getDay()+1 + "/" + parseInt(d1.getMonth()+1) + "/" + d1.getFullYear() +
          " - " + parseInt(d2.getDay()+1) + "/" + parseInt(d2.getMonth()+1)+ "/" + d2.getFullYear());
    });

    $(function() {
      var min_time;
      var max_time;
      $( "#graph2timeSlider" ).slider({
        range: true,
        min: new Date(0, 0, 0, 0, 0, 0).getTime()/1000,
        max: new Date(0, 0, 0, 23, 59, 59).getTime()/1000,
        values: [new Date(0, 0, 0, 0, 0, 0).getTime()/1000, new Date(0, 0, 0, 23, 59, 59).getTime()/1000],
        slide: function( event, ui ) {
          dataObject2.getFilterObject().setTimes(ui.values[0] * 1000, ui.values[1] * 1000);
          globalFilters.setMinTime(getMinTime());
          globalFilters.setMaxTime(getMaxTime());
          updateGraphScales(dataObject2);

          min_time = new Date(ui.values[0]*1000);
          max_time = new Date(ui.values[1]*1000);
          $("#time2" ).val(buildTimeString(min_time.getHours(), min_time.getMinutes()) +
              " - " + buildTimeString(max_time.getHours(), max_time.getMinutes()));
        }
      });
      t1 = new Date($( "#graph2timeSlider" ).slider( "values", 0 )*1000);
      t2 = new Date($( "#graph2timeSlider" ).slider( "values", 1 )*1000);
      $("#time2" ).val(buildTimeString(t1.getHours(), t1.getMinutes()) +
      " - " + buildTimeString(t2.getHours(), t2.getMinutes()));
    });

    $(function() {
      $( "#graph2distanceSlider" ).slider({
        range: true,
        min: d3.min(dataset, function(d) { return d.distance }),
        max: d3.max(dataset, function(d) { return d.distance }),
        values: [0, d3.max(dataset, function(d) { return d.distance })],
        slide: function( event, ui ) {
          dataObject2.getFilterObject().setDistances(ui.values[0], ui.values[1]);
          globalFilters.setMinDistance(getMinDistance());
          globalFilters.setMaxDistance(getMaxDistance());
          updateGraphScales(dataObject2)

          $("#distance2" ).val(ui.values[0]+ "m" + " - " + ui.values[1] + "m");
        }
      })
      $("#distance2" ).val($( "#graph2distanceSlider" ).slider( "values", 0 ) + "m" +
          " - " + $( "#graph2distanceSlider" ).slider( "values", 1 ) + "m");
    });

    $(function() {
      $( "#graph2elevationSlider" ).slider({
        range: true,
        min: d3.min(dataset, function(d) { return d.total_elevation_gain }),
        max: d3.max(dataset, function(d) { return d.total_elevation_gain }),
        values: [0, d3.max(dataset, function(d) { return d.total_elevation_gain })],
        slide: function( event, ui ) {
          dataObject2.getFilterObject().setElevationGain(ui.values[0], ui.values[1]);
          globalFilters.setMinElevation(getMinElevationGain());
          globalFilters.setMaxElevation(getMaxElevationGain());
          updateGraphScales(dataObject2)

          $("#elevation2" ).val(ui.values[0]+ "m" + " - " + ui.values[1] + "m");
        }
      })
      $("#elevation2" ).val($( "#graph2elevationSlider" ).slider( "values", 0 ) + "m" +
          " - " + $( "#graph2elevationSlider" ).slider( "values", 1 ) + "m");
    });

    $(function() {
      $( "#graph2heartrateSlider" ).slider({
        range: true,
        min: d3.min(dataset, function(d) { return d.heart_rate }),
        max: d3.max(dataset, function(d) { return d.heart_rate }),
        values: [0, d3.max(dataset, function(d) { return d.heart_rate })],
        slide: function( event, ui ) {
          dataObject2.getFilterObject().setHeartRates(ui.values[0], ui.values[1]);
          globalFilters.setMinHeartRate(getMinHeartRate());
          globalFilters.setMaxHeartRate(getMaxHeartRate());
          updateGraphScales(dataObject2)
          $("#heartrate2" ).val(ui.values[0]+ "bpm" + " - " + ui.values[1] + "bpm");
        }
      });
      $("#heartrate2" ).val($( "#graph2heartrateSlider" ).slider( "values", 0 ) + "bpm" +
          " - " + $( "#graph2heartrateSlider" ).slider( "values", 1 ) + "bpm");
    });
  }
  else {
    document.getElementById('addChart').innerText = "Add Graph";
    document.getElementById('addChart').title = "Add a Second Layer of Data to the Graph";
    document.getElementById('mergeGraphs').style.display = "none";

    clicked = false;
    //Remove second set of graphs

    showSecondarySliders();
    d3.selectAll("[id='#threshold2']").remove();
    d3.selectAll("[id='#pace2']").remove()

    d3.select('#secondary_graphs').selectAll('div').remove();
    d3.select('#primary_graphs').selectAll('div').remove();
    document.getElementById('primary_graphs').className = "col-12";
    document.getElementById('sliders').className = "col-12";

    var bb = document.querySelector ('#primary_graphs')
                        .getBoundingClientRect();

    var width = bb.right - bb.left;

    //Update first set of graphs
    graphSet1 = new graphSet(margin, width, h, "primary_graphs");
    var filterObject = new Filters(dataset);
    dataObject1.setGraphSet(graphSet1);
    dataObject1.getGraphSet().buildGraphs(filterObject, dataObject1.getData());
    dataObject1.updateGraphs();
    updateTrendline(dataObject1.getFilteredData(), dataObject1.getGraphSet().getScatter(), "line_primary", dataObject1.getId(), dataObject1.getColour());
  }
}

$(function() {
  $( "#slider" ).slider({
    range: true,
    min: new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000,
    max: new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000,
    values: [new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000, new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000],
    slide: function( event, ui ) {
      dataObject1.getFilterObject().setDates(ui.values[0] * 1000, ui.values[1] * 1000);
      globalFilters.setMinDate(getMinDate());
      globalFilters.setMaxDate(getMaxDate());
      updateGraphScales(dataObject1);

      min_date = new Date(ui.values[0]*1000);
      max_date = new Date(ui.values[1]*1000);
      $("#date" ).val(min_date.getDay()+1 + "/" + parseInt(min_date.getMonth()+1) + "/" + min_date.getFullYear() +
          " - " + parseInt(max_date.getDay()+1) + "/" + parseInt(max_date.getMonth()+1)+ "/" + max_date.getFullYear());
    }
  });
  d1 = new Date($( "#slider" ).slider( "values", 0 )*1000);
  d2 = new Date($( "#slider" ).slider( "values", 1 )*1000);
  $("#date" ).val(d1.getDay()+1 + "/" + parseInt(d1.getMonth()+1) + "/" + d1.getFullYear() +
      " - " + parseInt(d2.getDay()+1) + "/" + parseInt(d2.getMonth()+1)+ "/" + d2.getFullYear());
});

$(function() {
  $( "#timeSlider" ).slider({
    range: true,
    min: new Date(0, 0, 0, 0, 0, 0).getTime()/1000,
    max: new Date(0, 0, 0, 23, 59, 59).getTime()/1000,
    values: [new Date(0, 0, 0, 0, 0, 0).getTime()/1000, new Date(0, 0, 0, 23, 59, 59).getTime()/1000],
    slide: function( event, ui ) {
      min_time = new Date(ui.values[0]*1000);
      max_time = new Date(ui.values[1]*1000);
      dataObject1.getFilterObject().setTimes(ui.values[0] * 1000, ui.values[1] * 1000);
      globalFilters.setMinTime(getMinTime());
      globalFilters.setMaxTime(getMaxTime());
      updateGraphScales(dataObject1);

      $("#time" ).val(buildTimeString(min_time.getHours(), min_time.getMinutes()) +
          " - " + buildTimeString(max_time.getHours(), max_time.getMinutes()));
    }
  });
  t1 = new Date($( "#timeSlider" ).slider( "values", 0 )*1000);
  t2 = new Date($( "#timeSlider" ).slider( "values", 1 )*1000);
  $("#time" ).val(buildTimeString(t1.getHours(), t1.getMinutes()) +
      " - " + buildTimeString(t2.getHours(), t2.getMinutes()));

});


$(function() {
  $( "#distanceSlider" ).slider({
    range: true,
    min: d3.min(dataset, function(d) { return d.distance }),
    max: d3.max(dataset, function(d) { return d.distance }),
    values: [0, d3.max(dataset, function(d) { return d.distance })],
    slide: function( event, ui ) {
      dataObject1.getFilterObject().setDistances(ui.values[0], ui.values[1]);
      globalFilters.setMinDistance(getMinDistance());
      globalFilters.setMaxDistance(getMaxDistance());
      updateGraphScales(dataObject1);

      $("#distance" ).val($( "#distanceSlider" ).slider( "values", 0 ) + "m" +
          " - " + $( "#distanceSlider" ).slider( "values", 1 ) + "m");
    }
  })
  $("#distance" ).val($( "#distanceSlider" ).slider( "values", 0 ) + "m" +
      " - " + $( "#distanceSlider" ).slider( "values", 1 ) + "m");
});

$(function() {
  $( "#elevationSlider" ).slider({
    range: true,
    min: d3.min(dataset, function(d) { return d.total_elevation_gain }),
    max: d3.max(dataset, function(d) { return d.total_elevation_gain }),
    values: [0, d3.max(dataset, function(d) { return d.total_elevation_gain })],
    slide: function( event, ui ) {
      dataObject1.getFilterObject().setElevationGain(ui.values[0], ui.values[1]);
      globalFilters.setMinElevation(getMinElevationGain());
      globalFilters.setMaxElevation(getMaxElevationGain());
      updateGraphScales(dataObject1);

      $("#elevation" ).val($( "#elevationSlider" ).slider( "values", 0 ) + "m" +
          " - " + $( "#elevationSlider" ).slider( "values", 1 ) + "m");
    }
  })
  $("#elevation" ).val($( "#elevationSlider" ).slider( "values", 0 ) + "m" +
      " - " + $( "#elevationSlider" ).slider( "values", 1 ) + "m");
});

$(function() {
  $( "#heartrateSlider" ).slider({
    range: true,
    min: d3.min(dataset, function(d) { return d.heart_rate }),
    max: d3.max(dataset, function(d) { return d.heart_rate }),
    values: [0, d3.max(dataset, function(d) { return d.heart_rate })],
    slide: function( event, ui ) {
      dataObject1.getFilterObject().setHeartRates(ui.values[0], ui.values[1]);
      globalFilters.setMinHeartRate(getMinHeartRate());
      globalFilters.setMaxHeartRate(getMaxHeartRate());
      updateGraphScales(dataObject1);

      $("#heartrate" ).val($( "#heartrateSlider" ).slider( "values", 0 ) + "bpm" +
          " - " + $( "#heartrateSlider" ).slider( "values", 1 ) + "bpm");
    }
  });
  $("#heartrate" ).val($( "#heartrateSlider" ).slider( "values", 0 ) + "bpm" +
      " - " + $( "#heartrateSlider" ).slider( "values", 1 ) + "bpm");
});

function filterTags(tag) {
  var tagObject = document.createElement("li");
  tagObject.innerHTML = tag;
  tagObject.className = "list-group-item";
  tagObject.title = "Click to remove";
  document.getElementById("tagsList").appendChild(tagObject);
  tagObject.onclick = function(d) {
    dataObject.getFilterObject().removeTag(tagObject.innerHTML)
    d3.select(tagObject).remove();
    dataObject.getGraphSet().updateScales(dataObject.getFilterObject().filterData(dataObject.getData()));
    dataObject.updateGraphs();
  };
  for (index in dataObjects) {
    var dataObject = dataObjects[index];
    dataObject.getFilterObject().addTag(tag);
    dataObject.getGraphSet().updateScales(dataObject.getFilterObject().filterData(dataObject.getData()));
    dataObject.updateGraphs();
  }
}

function mergeGraphs() {
  d3.select('#primary_graphs').selectAll('div').remove();
  d3.select('#secondary_graphs').selectAll('div').remove();
  document.getElementById('primary_graphs').className = "col-12";
  var bb = document.querySelector ('#primary_graphs')
                      .getBoundingClientRect();
  var width = bb.right - bb.left;

  var filterObject = new Filters(dataset);
  graphSet1 = new graphSet(margin, width, h, "primary_graphs");
  dataObject1.setGraphSet(graphSet1);
  dataObject2.setGraphSet(graphSet1);
  graphSet1.buildGraphs(globalFilters, getAllData());
  updateGraphScales();
  updateTrendline(dataObject1.getFilteredData(), dataObject1.getGraphSet().getScatter(), "line_primary", dataObject1.getId(), dataObject1.getColour());
  updateTrendline(dataObject2.getFilteredData(), dataObject2.getGraphSet().getScatter(), "line_secondary", dataObject2.getId(), dataObject2.getColour());
}

function getNeededPace(distance) {
  var min_dist = distance - (0.1*distance);
  var max_dist = parseInt(distance) + parseInt((0.1*distance));
  $('#distanceSlider').slider( "values", 0, min_dist );
  $('#distanceSlider').slider( "values", 1, max_dist );
  $("#distance" ).val(min_dist + "m" + " - " + max_dist + "m");
  $('#graph2distanceSlider').slider( "values", 0, min_dist );
  $('#graph2distanceSlider').slider( "values", 1, max_dist );
  $("#distance2" ).val(min_dist + "m" + " - " + max_dist + "m");
  document.getElementById("distancePace").innerHTML = "";
  for (index in dataObjects) {
    console.log(index);
    var dataObject = dataObjects[index];
    acceptable_data = dataObject.getData().filter(d => (d.distance <= max_dist && d.distance >= min_dist));
    dataObject.getFilterObject().setDistances(min_dist, max_dist);
    dataObject.getGraphSet().updateScales(dataObject.getFilterObject().filterData(dataObject.getData()));
    dataObject.updateGraphs();
    var filtered = dataObject.getFilteredData();
    var needed_pace = d3.mean(filtered, d => d.average_pace);
    var paceObject = document.createElement("li");
    paceObject.innerHTML = dataObject.id + ": " + needed_pace.toFixed(2) + "mins/km"
    paceObject.className = "list-group-item";
    paceObject.id = "#pace"+dataObject.id
    document.getElementById('distancePace').appendChild(paceObject);
  }
}

document.getElementById("addChart").onclick = function() {
  createGraphs(dataset, reg, "#00e600");
};

document.getElementById("mergeGraphs").onclick = function() {
  if (document.getElementById("mergeGraphs").value == "true") {
    document.getElementById("mergeGraphs").value = "false";
    document.getElementById("mergeGraphs").innerHTML = "Merge Graphs";
    split();
  }
  else {
    document.getElementById("mergeGraphs").value = "true";
    document.getElementById("mergeGraphs").innerHTML = "Split Graphs";
    mergeGraphs();
  }
};

function updateGraphScales(filtersObject) {
  if (clicked == true) {
    console.log("Clicked = false");
    console.log("Global min dist: " + globalFilters.getMinDistance());
    console.log("Global min elev: " + globalFilters.getMinElevationGain());
    graphSet1.updateScales(globalFilters.filterData(getAllData()));
    for (index in dataObjects) {
      var dataObject = dataObjects[index];
      dataObject.updateGraphs();
    }
  }
  else {
    console.log("Clicked = true");
    for (index in dataObjects) {
      var dataObject = dataObjects[index];
      dataObject.getGraphSet().updateScales(dataObject.getFilterObject().filterData(dataObject.getData()));
      dataObject.updateGraphs();
    }
  }
}

function getAllData() {
  var allData = [];
  for (var index in dataObjects) {
    allData.push(dataObjects[index].getData());
  }
  allData = [].concat.apply([], allData);
  return allData;
}


function updateGlobalFilters() {
  globalFilters.setMinDate(getMinDate());
  globalFilters.setMaxDate(getMaxDate());
  globalFilters.setMinTime(getMinTime());
  globalFilters.setMaxTime(getMaxTime());
  globalFilters.setMinDistance(getMinDistance());
  globalFilters.setMaxDistance(getMaxDistance());
  globalFilters.setMinElevation(getMinElevationGain());
  globalFilters.setMaxElevation(getMaxElevationGain());
  globalFilters.setMinHeartRate(getMinHeartRate());
  globalFilters.setMaxHeartRate(getMaxHeartRate());
}

function getMinElevationGain() {
  if (dataObjects.length > 1) {
    var minElevationGain = dataObjects[0].getFilterObject().getMinElevationGain();
    for (index in dataObjects) {
      if (dataObjects[index].getFilterObject().getMinElevationGain() < minElevationGain) {
        minElevationGain = dataObjects[index].getFilterObject().getMinElevationGain();
      }
    }
    return minElevationGain;
  }
  return dataObjects[0].getFilterObject().getMinElevationGain();
}
function getMaxElevationGain() {
  if (dataObjects.length > 1) {
    var maxElevationGain = dataObjects[0].getFilterObject().getMaxElevationGain();
    for (index in dataObjects) {
      if (dataObjects[index].getFilterObject().getMaxElevationGain() > maxElevationGain) {
        maxElevationGain = dataObjects[index].getFilterObject().getMaxElevationGain();
      }
    }
    return maxElevationGain;
  }
  return dataObjects[0].getFilterObject().getMaxElevationGain();
}

function getMinDistance() {
  if (dataObjects.length > 1) {
    var minDistance = dataObjects[0].getFilterObject().getMinDistance();
    for (index in dataObjects) {
      if (dataObjects[index].getFilterObject().getMinDistance() < minDistance) {
        minDistance = dataObjects[index].getFilterObject().getMinDistance();
      }
    }
    return minDistance;
  }
  return dataObjects[0].getFilterObject().getMinDistance();
}
function getMaxDistance() {
  if (dataObjects.length > 1) {
    var maxDistance = dataObjects[0].getFilterObject().getMaxDistance();
    for (index in dataObjects) {
      if (dataObjects[index].getFilterObject().getMinDistance() > maxDistance) {
        maxDistance = dataObjects[index].getFilterObject().getMaxDistance();
      }
    }
    return maxDistance;
  }
  return dataObjects[0].getFilterObject().getMaxDistance();
}

function getMinHeartRate() {
  if (dataObjects.length > 1) {
    var minHeartRate = dataObjects[0].getFilterObject().getMinHeartRate();
    for (index in dataObjects) {
      if (dataObjects[index].getFilterObject().getMinHeartRate() < minHeartRate) {
        minHeartRate = dataObjects[index].getFilterObject().getMinHeartRate();
      }
    }
    return minHeartRate;
  }
  return dataObjects[0].getFilterObject().getMinHeartRate();
}
function getMaxHeartRate() {
  if (dataObjects.length > 1) {
    var maxHeartRate = dataObjects[0].getFilterObject().getMaxHeartRate();
    for (index in dataObjects) {
      if (dataObjects[index].getFilterObject().getMaxHeartRate() > maxHeartRate) {
        maxHeartRate = dataObjects[index].getFilterObject().getMaxHeartRate();
      }
    }
    return maxHeartRate;
  }
  return dataObjects[0].getFilterObject().getMaxHeartRate();
}

function getMinDate() {
  if (dataObjects.length > 1) {
    var minDate = dataObjects[0].getFilterObject().getEarliestDate();
    for (index in dataObjects) {
      if (dataObjects[index].getFilterObject().getEarliestDate().getTime() < minDate.getTime()) {
        minDate = dataObjects[index].getFilterObject().getEarliestDate();
      }
    }
    return minDate;
  }
  return dataObjects[0].getFilterObject().getEarliestDate();
}
function getMaxDate() {
  if (dataObjects.length > 1) {
    var maxDate = dataObjects[0].getFilterObject().getLatestDate();
    for (index in dataObjects) {
      if (dataObjects[index].getFilterObject().getLatestDate().getTime() > maxDate.getTime()) {
        maxDate = dataObjects[index].getFilterObject().getLatestDate();
      }
    }
    return maxDate;
  }
  return dataObjects[0].getFilterObject().getLatestDate();
}

function getMinTime() {
  if (dataObjects.length > 1) {
    var minTime = dataObjects[0].getFilterObject().getEarliestTime();
    for (index in dataObjects) {
      if (dataObjects[index].getFilterObject().getEarliestTime().getTime() < minTime.getTime()) {
        minTime = dataObjects[index].getFilterObject().getEarliestTime();
      }
    }
    return minTime;
  }
  return dataObjects[0].getFilterObject().getEarliestTime();
}
function getMaxTime() {
  if (dataObjects.length > 1) {
    var maxTime = dataObjects[0].getFilterObject().getLatestTime();
    for (index in dataObjects) {
      if (dataObjects[index].getFilterObject().getLatestTime().getTime() > maxTime.getTime()) {
        maxTime = dataObjects[index].getFilterObject().getLatestTime();
      }
    }
    return maxTime
  }
  return dataObjects[0].getFilterObject().getLatestTime();
}
