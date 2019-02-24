var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
var parseDate = d3.timeParse("%m/%d/%y");

var bb = document.querySelector ('#primary_graphs')
                    .getBoundingClientRect();

var width = bb.right - bb.left;

document.getElementById('mergeGraphs').style.display = "none";

$(".nav .nav-link").on("click", function(){
   $(".nav").find(".active").removeClass("active");
   $(this).addClass("active");
});

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
    document.getElementById('addChart').innerText = "Remove Data";
    document.getElementById('addChart').title = "Remove the Second Layer of Data from the graph";
    document.getElementById('mergeGraphs').style.display = "inline";
    document.getElementById('mergeGraphs').value = "true";
    document.getElementById('mergeGraphs').innerHTML = "Split Graphs";
    document.getElementById('mergeGraphs').title = "Merge the Data Layers back into one graph";

    clicked = true;

    //Update 1st set of graphs
    dataObject2 = new DataObject(d, "2", "#00e600", graphSet1);
    dataObjects.push(dataObject2);
    dataObject2.getGraphSet().updatePlots(dataObject2.getFilteredData(), dataObject2.getFilterObject(), dataObject2.getColour(), dataObject2.getId());
    updateTrendline(dataObject2.getFilteredData(), dataObject2.getGraphSet().getScatter(), "line_secondary", dataObject2.getId(), dataObject2.getColour());

    //Set up sliders for second set of graphs
    showSecondarySliders();
    document.getElementById('sliders').className = "col-6";
    document.getElementById('graph2sliders').className = "col-6";

    $(function() {
      $( "#graph2slider" ).slider({
        range: true,
        min: new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000,
        max: new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000,
        values: [new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000, new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000],
        slide: function( event, ui ) {
          min_date = new Date($( "#slider" ).slider( "values", 0 )*1000);
          max_date = new Date($( "#slider" ).slider( "values", 1 )*1000);
          if (globalFilters.getEarliestDate().getTime()/1000 > ui.values[0]) {
            globalFilters.setMinDate(min_date);
          }
          if (globalFilters.getLatestDate().getTime()/1000 < ui.values[1]) {
            globalFilters.setMaxDate(max_date);
          }
          dataObject2.getFilterObject().setDates(ui.values[0] * 1000, ui.values[1] * 1000);
          dataObject2.getGraphSet().updateScales(dataObject2.getData(), globalFilters);
          for (index in dataObjects) {
            var dataObject = dataObjects[index];
            dataObject.updateGraphs();
          }

          $("#date2" ).val(min_date.getDay()+1 + "/" + parseInt(min_date.getMonth()+1) + "/" + min_date.getFullYear() +
              " - " + parseInt(max_date.getDay()+1) + "/" + parseInt(max_date.getMonth()+1) + "/" + max_date.getFullYear());
        }
      });
    });

    $(function() {
      $( "#graph2timeSlider" ).slider({
        range: true,
        min: new Date(0, 0, 0, 0, 0, 0).getTime()/1000,
        max: new Date(0, 0, 0, 23, 59, 59).getTime()/1000,
        values: [new Date(0, 0, 0, 0, 0, 0).getTime()/1000, new Date(0, 0, 0, 23, 59, 59).getTime()/1000],
        slide: function( event, ui ) {
          min_time = new Date(ui.values[0]*1000);
          max_time = new Date(ui.values[1]*1000);
          if (globalFilters.getEarliestTime().getTime()/1000 > ui.values[0]) {
            globalFilters.setMinTime(min_time);
          }
          if (globalFilters.getLatestTime().getTime()/1000 < ui.values) {
            globalFilters.setMaxDate(max_time);
          }
          dataObject2.getFilterObject().setTimes(ui.values[0] * 1000, ui.values[1] * 1000);
          dataObject2.getGraphSet().updateScales(dataObject2.getData(), globalFilters);
          for (index in dataObjects) {
            var dataObject = dataObjects[index];
            dataObject.updateGraphs();
          }
          $("#time2" ).val(min_time.getHours() + ":" + min_time.getMinutes() +
              " - " + max_time.getHours() + ":" + max_time.getMinutes());
        }
      });
    });

    $(function() {
      $( "#graph2distanceSlider" ).slider({
        range: true,
        min: d3.min(dataset, function(d) { return d.distance }),
        max: d3.max(dataset, function(d) { return d.distance }),
        values: [0, d3.max(dataset, function(d) { return d.distance })],
        slide: function( event, ui ) {
          if (globalFilters.getMinDistance() > ui.values[0]) {
            globalFilters.setMinDistance(ui.values[0]);
          }
          if (globalFilters.getMaxDistance() < ui.values[1]) {
            globalFilters.setMaxDistance(ui.values[1]);
          }
          dataObject2.getFilterObject().setDistances(ui.values[0], ui.values[1]);
          dataObject2.getGraphSet().updateScales(dataObject2.getData(), globalFilters);
          for (index in dataObjects) {
            var dataObject = dataObjects[index];
            dataObject.updateGraphs();
          }
          $("#distance2" ).val(ui.values[0]+ "m" + " - " + ui.values[1] + "m");
        }
      })
    });

    $(function() {
      $( "#graph2elevationSlider" ).slider({
        range: true,
        min: d3.min(dataset, function(d) { return d.total_elevation_gain }),
        max: d3.max(dataset, function(d) { return d.total_elevation_gain }),
        values: [0, d3.max(dataset, function(d) { return d.total_elevation_gain })],
        slide: function( event, ui ) {
          if (globalFilters.getMinElevationGain() > ui.values[0]) {
            globalFilters.setMinElevation(ui.values[0]);
          }
          if (globalFilters.getMaxElevationGain() < ui.values[1]) {
            globalFilters.setMaxElevation(ui.values[1]);
          }
          dataObject2.getFilterObject().setElevationGain(ui.values[0], ui.values[1]);
          dataObject2.getGraphSet().updateScales(dataObject2.getData(), globalFilters);
          for (index in dataObjects) {
            var dataObject = dataObjects[index];
            dataObject.updateGraphs();
          }
          $("#elevation2" ).val(ui.values[0]+ "m" + " - " + ui.values[1] + "m");
        }
      })
    });

    $(function() {
      $( "#graph2heartrateSlider" ).slider({
        range: true,
        min: d3.min(dataset, function(d) { return d.heart_rate }),
        max: d3.max(dataset, function(d) { return d.heart_rate }),
        values: [0, d3.max(dataset, function(d) { return d.heart_rate })],
        slide: function( event, ui ) {
          if (globalFilters.getMinHeartRate() > ui.values[0]) {
            globalFilters.setMinHeartRate(ui.values[0]);
          }
          if (globalFilters.getMaxHeartRate() < ui.values[1]) {
            globalFilters.getMaxHeartRate(ui.values[1]);
          }
          dataObject2.getFilterObject().setHeartRates(ui.values[0], ui.values[1]);
          dataObject2.getGraphSet().updateScales(dataObject2.getData(), globalFilters);
          for (index in dataObjects) {
            var dataObject = dataObjects[index];
            dataObject.updateGraphs();
          }
          $("#heartrate2" ).val(ui.values[0]+ "bpm" + " - " + ui.values[1] + "bpm");
        }
      });
    });
  }
  else {
    document.getElementById('addChart').innerText = "Add Graph";
    document.getElementById('addChart').title = "Add a Second Layer of Data to the Graph";
    document.getElementById('mergeGraphs').style.display = "none";

    clicked = false;
    //Remove second set of graphs

    showSecondarySliders();

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
      min_date = new Date($( "#slider" ).slider( "values", 0 )*1000);
      max_date = new Date($( "#slider" ).slider( "values", 1 )*1000);
      if (globalFilters.getEarliestDate().getTime() > min_date.getTime()) {
        globalFilters.setMinDate(min_date);
      }
      if (globalFilters.getLatestDate().getTime() < max_date.getTime()) {
        globalFilters.setMaxDate(max_date);
      }
      dataObject1.getFilterObject().setDates(ui.values[0] * 1000, ui.values[1] * 1000);
      dataObject1.getGraphSet().updateScales(getAllData(), globalFilters);
      for (index in dataObjects) {
        var dataObject = dataObjects[index];
        dataObject.updateGraphs();
      }
      min_date = new Date($( "#slider" ).slider( "values", 0 )*1000);
      max_date = new Date($( "#slider" ).slider( "values", 1 )*1000);
      $("#date" ).val(min_date.getDay()+1 + "/" + parseInt(min_date.getMonth()+1) + "/" + min_date.getFullYear() +
          " - " + parseInt(max_date.getDay()+1) + "/" + parseInt(max_date.getMonth()+1)+ "/" + max_date.getFullYear());
    }
  });
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
      if (globalFilters.getEarliestTime().getTime() > min_time.getTime()) {
        globalFilters.setMinTime(min_time);
      }
      if (globalFilters.getLatestTime().getTime() < max_time.getTime()) {
        globalFilters.setMaxDate(max_time);
      }
      dataObject1.getFilterObject().setTimes(ui.values[0] * 1000, ui.values[1] * 1000);
      dataObject1.getGraphSet().updateScales(getAllData(), globalFilters);
      for (index in dataObjects) {
        var dataObject = dataObjects[index];
        dataObject.updateGraphs();
      }
      min_time = new Date(ui.values[0]*1000);
      max_time = new Date(ui.values[1]*1000);
      $("#time" ).val(min_time.getHours() + ":" + min_time.getMinutes() +
          " - " + max_time.getHours() + ":" + max_time.getMinutes());
    }
  });
});


$(function() {
  $( "#distanceSlider" ).slider({
    range: true,
    min: d3.min(dataset, function(d) { return d.distance }),
    max: d3.max(dataset, function(d) { return d.distance }),
    values: [0, d3.max(dataset, function(d) { return d.distance })],
    slide: function( event, ui ) {
      if (globalFilters.getMinDistance() > ui.values[0]) {
        globalFilters.setMinDistance(ui.values[0]);
      }
      if (globalFilters.getMaxDistance() < ui.values[1]) {
        globalFilters.setMaxDistance(ui.values[1]);
      }
      dataObject1.getFilterObject().setDistances(ui.values[0], ui.values[1]);
      dataObject1.getGraphSet().updateScales(getAllData(), globalFilters);
      for (index in dataObjects) {
        var dataObject = dataObjects[index];
        dataObject.updateGraphs();
      }
      $("#distance" ).val($( "#distanceSlider" ).slider( "values", 0 ) + "m" +
          " - " + $( "#distanceSlider" ).slider( "values", 1 ) + "m");
    }
  })
});

$(function() {
  $( "#elevationSlider" ).slider({
    range: true,
    min: d3.min(dataset, function(d) { return d.total_elevation_gain }),
    max: d3.max(dataset, function(d) { return d.total_elevation_gain }),
    values: [0, d3.max(dataset, function(d) { return d.total_elevation_gain })],
    slide: function( event, ui ) {
      if (globalFilters.getMinElevationGain() > ui.values[0]) {
        globalFilters.setMinElevation(ui.values[0]);
      }
      if (globalFilters.getMaxElevationGain() < ui.values[1]) {
        globalFilters.setMaxElevation(ui.values[1]);
      }
      dataObject1.getFilterObject().setElevationGain(ui.values[0], ui.values[1]);
      dataObject1.getGraphSet().updateScales(getAllData(), globalFilters);
      for (index in dataObjects) {
        var dataObject = dataObjects[index];
        dataObject.updateGraphs();
      }
      $("#elevation" ).val($( "#elevationSlider" ).slider( "values", 0 ) + "m" +
          " - " + $( "#elevationSlider" ).slider( "values", 1 ) + "m");
    }
  })
});

$(function() {
  $( "#heartrateSlider" ).slider({
    range: true,
    min: d3.min(dataset, function(d) { return d.heart_rate }),
    max: d3.max(dataset, function(d) { return d.heart_rate }),
    values: [0, d3.max(dataset, function(d) { return d.heart_rate })],
    slide: function( event, ui ) {
      if (globalFilters.getMinHeartRate() > ui.values[0]) {
        globalFilters.setMinHeartRate(ui.values[0]);
      }
      if (globalFilters.getMaxHeartRate() < ui.values[1]) {
        globalFilters.getMaxHeartRate(ui.values[1]);
      }
      dataObject1.getFilterObject().setHeartRates(ui.values[0], ui.values[1]);
      dataObject1.getGraphSet().updateScales(dataObject1.getFilteredData(), globalFilters);
      for (index in dataObjects) {
        var dataObject = dataObjects[index];
        dataObject.updateGraphs();
      }
      $("#heartrate" ).val($( "#heartrateSlider" ).slider( "values", 0 ) + "bpm" +
          " - " + $( "#heartrateSlider" ).slider( "values", 1 ) + "bpm");
    }
  });
});

function filterTags(tag) {
  for (index in dataObjects) {
    var dataObject = dataObjects[index];
    var tagObject = document.createElement("li");
    tagObject.innerHTML = tag;
    tagObject.className = "list-group-item";
    tagObject.value = String(dataObject.getId());
    tagObject.title = "Click to remove";
    document.getElementById("tagsList").appendChild(tagObject);
    tagObject.onclick = function(d) {
      dataObject.getFilterObject().removeTag(tagObject.innerHTML)
      d3.select(tagObject).remove();
    };
    dataObject.getFilterObject().addTag(tag);
    dataObject.getGraphSet().updateScales(getAllData(), dataObject.getFilterObject());
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
  graphSet1.buildGraphs(filterObject, dataObject1.getData().concat(dataObject2.getData()));
  graphSet1.updatePlots(dataObject1.getFilteredData(), dataObject1.getFilterObject(), dataObject1.getColour(), dataObject1.getId());
  graphSet1.updatePlots(dataObject2.getFilteredData(), dataObject2.getFilterObject(), dataObject2.getColour(), dataObject2.getId());
  updateTrendline(dataObject1.getFilteredData(), dataObject1.getGraphSet().getScatter(), "line_primary", dataObject1.getId(), dataObject1.getColour());
  updateTrendline(dataObject2.getFilteredData(), dataObject2.getGraphSet().getScatter(), "line_secondary", dataObject2.getId(), dataObject2.getColour());
}

function getNeededPace(distance, dataObject) {
  var min_dist = distance - (0.1*distance);
  var max_dist = parseInt(distance) + parseInt((0.1*distance));
  acceptable_data = dataObject.getData().filter(d => (d.distance <= max_dist && d.distance >= min_dist));
  dataObject.getFilterObject().setDistances(min_dist, max_dist);
  dataObject.getGraphSet().updateScales(dataObject.getData(), dataObject.getFilterObject());
  dataObject.updateGraphs();
  updateTrendline(dataObject.getFilteredData(), dataObject.getGraphSet().getScatter(), "line_primary", dataObject.getId(), dataObject.getColour());
  filtered = dataObject.getFilteredData();
  needed_pace = d3.mean(filtered, function(d) { return d.average_pace; })
  document.getElementById("pace").innerHTML="Average Pace: " + needed_pace.toFixed(3)+" mins/km";
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

function getAllData() {
  var allData = [];
  for (var index in dataObjects) {
    allData.push(dataObjects[index].getData());
  }
  allData = [].concat.apply([], allData);
  return allData;
}
