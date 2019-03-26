var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
var parseDate = d3.timeParse("%m/%d/%y");

var bb = document.querySelector ('#primary_graphs')
                    .getBoundingClientRect();

var width = bb.right - bb.left;
var clicked = false;
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
document.getElementById('mergeGraphs').style.display = "none";
$('#single_user').addClass( 'active' )

showSecondarySliders();
var margin = {top: 20, right: 20, bottom: 50, left: 70},
    w = width - margin.left - margin.right,
    h = 500 - margin.top - margin.bottom;

var dataObjects = [];

var secondaryFilterObject;
var graphSet2;
var dataObject2;

// Add the tooltip container to the vis container
// it's invisible and its position/contents are defined during mouseover


//Build Graphs
var graphSet1 = new graphSet(margin, w, h, "primary_graphs");
var dataObject1 = new DataObject(dataset, "1", "#ff471a", graphSet1);
graphSet1.buildGraphs(dataObject1.getFilterObject(), dataset);
graphSet1.updatePlots(dataObject1.getFilteredData(), dataObject1.getFilterObject(), dataObject1.getColour(), dataObject1.getId());
updateTrendline(dataObject1.getFilteredData(), graphSet1.getScatter(), "line_primary", dataObject1.getId(), dataObject1.getColour());
dataObjects.push(dataObject1);

buildSliders(dataObject1.getFilterObject());






////// FUNCTIONS //////
function updateGraphScales() {
  if (document.getElementById("mergeGraphs").value == "true") {
    var max_y = 0;
    var indexOf_max_y = 0;
    for (index in dataObjects) {
      dataObject = dataObjects[index];
      var y = dataObject.graphSet.effortChart.buildBarValues(dataObject.getFilterObject().filterData(dataObject.getData()));
      if (d3.max(y, d => Math.abs(d)) > max_y) {
        max_y = d3.max(y, d => Math.abs(d));
        indexOf_max_y = index;
      }
    }
    graphSet1.updateScales(dataObjects[indexOf_max_y].getFilterObject().filterData(dataObjects[indexOf_max_y].getData()));
    for (index in dataObjects) {
      dataObjects[index].updateGraphs();
    }
  }
  else {
    for (index in dataObjects) {
      var dataObject = dataObjects[index];
      dataObject.getGraphSet().updateScales(dataObject.getFilterObject().filterData(dataObject.getData()));
      dataObject.updateGraphs();
    }
  }
}

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
  updateGraphScales();
  updateTrendline(dataObject1.getFilteredData(), graphSet1.getScatter(), "line_primary", dataObject1.getId(), dataObject1.getColour());


  var bb = document.querySelector ('#secondary_graphs')
                      .getBoundingClientRect();

  var width = bb.right - bb.left;

  var graphSet2 = new graphSet(margin, width, h, "secondary_graphs");
  dataObject2.setGraphSet(graphSet2);
  dataObject2.getGraphSet().buildGraphs(filterObject, dataObject2.getData());
  updateGraphScales();
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
    dataObject2 = new DataObject(d, "2", "#00e600", graphSet1);
    dataObjects.push(dataObject2);
    updateGraphScales();
    updateTrendline(dataObject2.getFilteredData(), dataObject2.getGraphSet().getScatter(), "line_secondary", dataObject2.getId(), dataObject2.getColour());

    //Set up sliders for second set of graphs
    showSecondarySliders();
    document.getElementById('sliders').className = "col-6";
    document.getElementById('graph2sliders').className = "col-6";
    buildSecondaryGraphs();
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
    updateGraphScales();
    updateTrendline(dataObject1.getFilteredData(), dataObject1.getGraphSet().getScatter(), "line_primary", dataObject1.getId(), dataObject1.getColour());
  }
}

function buildSecondaryGraphs() {
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
          updateGraphScales();

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
          updateGraphScales();

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
          updateGraphScales()

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
          updateGraphScales()

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
          updateGraphScales()
          $("#heartrate2" ).val(ui.values[0]+ "bpm" + " - " + ui.values[1] + "bpm");
        }
      });
      $("#heartrate2" ).val($( "#graph2heartrateSlider" ).slider( "values", 0 ) + "bpm" +
          " - " + $( "#graph2heartrateSlider" ).slider( "values", 1 ) + "bpm");
    });
}


function filterTags(tag) {
  if (/\S/.test(tag)) { //Checks the tag is not just whitespace
    document.getElementById('tags').value = null;
    var tagObject = document.createElement("li");
    tagObject.innerHTML = tag;
    tagObject.className = "list-group-item";
    tagObject.title = "Click to remove";
    document.getElementById("tagsList").appendChild(tagObject);
    tagObject.onclick = function(d) {
      for (index in dataObjects) {
        var dataObject = dataObjects[index];
        dataObject.getFilterObject().removeTag(tagObject.innerHTML)
        d3.select(tagObject).remove();
      }
      updateGraphScales();
    };
    for (index in dataObjects) {
      var dataObject = dataObjects[index];
      dataObject.getFilterObject().addTag(tag);
    }
    updateGraphScales();
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
  graphSet1.buildGraphs(filterObject, getAllData());
  updateGraphScales();
  updateTrendline(dataObject1.getFilteredData(), dataObject1.getGraphSet().getScatter(), "line_primary", dataObject1.getId(), dataObject1.getColour());
  updateTrendline(dataObject2.getFilteredData(), dataObject2.getGraphSet().getScatter(), "line_secondary", dataObject2.getId(), dataObject2.getColour());
}

function getNeededPace(distance) {
  var min_dist = distance - (0.1*distance);
  var max_dist = parseInt(distance) + parseInt((0.1*distance));
  updateSliderValues('distanceSlider', min_dist, max_dist)
  $("#distance" ).val(min_dist + "m" + " - " + max_dist + "m");
  updateSliderValues('graph2distanceSlider', min_dist, max_dist);
  $("#distance2" ).val(min_dist + "m" + " - " + max_dist + "m");
  paceSearch(max_dist, min_dist);
}

function getAllData() {
  var allData = [];
  for (var index in dataObjects) {
    allData = allData.concat(dataObjects[index].getData());
  }
  return allData;
}

////// EVENT LISTENERS //////

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
