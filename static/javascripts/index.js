var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
var parseDate = d3.timeParse("%m/%d/%y");

document.getElementById('mergeGraphs').style.display = "none";
document.getElementById('graph2sliders').style.display = "none";

var margin = {top: 20, right: 20, bottom: 50, left: 70},
    w = 1000 - margin.left - margin.right,
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
var graphSet1 = new graphSet(margin, w, h, "graphSet1Container");
var dataObject1 = new DataObject(dataset, "1", "#ff471a", graphSet1);
graphSet1.buildGraphs(dataObject1.getFilterObject(), dataset);
graphSet1.updatePlots(dataObject1.getFilteredData(), dataObject1.getFilterObject(), dataObject1.getColour(), dataObject1.getId());
updateTrendline(dataObject1.getFilteredData(), graphSet1.getScatter(), "line_primary");
graphSets.push(graphSet1);
dataObjects.push(dataObject1);


function split() {
  console.log("Splitting");
  d3.select('#graphSet1Container').selectAll('div').remove();

  var filterObject = new Filters(dataset)
  var graphSet1 = new graphSet(margin, w/2, h, "graphSet1Container");
  dataObject1.setGraphSet(graphSet1);
  dataObject1.getGraphSet().buildGraphs(filterObject, dataObject1.getData());
  dataObject1.getGraphSet().updatePlots(dataObject1.getFilteredData(), dataObject1.getFilterObject(), dataObject1.getColour(), dataObject1.getId());
  updateTrendline(dataObject1.getFilteredData(), graphSet1.getScatter(), "line_primary");

  var graphSet2 = new graphSet(margin, w/2, h, "graphSet2Container");
  dataObject2.setGraphSet(graphSet2);
  dataObject2.getGraphSet().buildGraphs(filterObject, dataObject2.getData());
  dataObject2.getGraphSet().updatePlots(dataObject2.getFilteredData(), dataObject2.getFilterObject(), dataObject2.getColour(), dataObject2.getId());
  updateTrendline(dataObject2.getFilteredData(), graphSet2.getScatter(), "line_secondary");
}


function updateTrendline(filtered_data, graph, line_class) {
  $.ajax({
    url: '/_gaussian_calculation',
    data: JSON.stringify(filtered_data),
    contentType: 'application/json;charset=UTF-8',
    type: 'POST',
    success: function(response){
      console.log("Updating trend line");
      graph.getSvg().select("." + line_class).remove();
      appendPath(graph, response, line_class);
    },
    error: function(error){
      console.log(error);
    }
  });
}

$('#findUsers').change(function() {
  console.log("Change");
  $.ajax({
    url: '/find_users',
    data: document.getElementById("findUsers").value,
    contentType: 'text',
    type: 'POST',
    success: function(response) {
      JSON.parse(response).forEach(function(elem) {
        var option = document.createElement("option");
        option.text = elem.username;
        option.value = elem.username;
        $("#dropdown").append(option);
      })
    },
    error: function(error) {
      console.log(error);
    }
  })
})

function plotGraphs(user) {
  console.log("Get user data");
  $.ajax({
    url: '/get_user_data',
    data: user,
    contentType: 'text',
    type: 'POST',
    success: function(response) {
      console.log(response);
      var activities = response[0];
      var line_coords = response[1];
      createGraphs(activities, line_coords, "#00e600");
      },
    error: function(error) {
      console.log(error);
    }
  })
}

function createGraphs(d, line_points, colour) {
  console.log(clicked);
  if (clicked == false) {
    document.getElementById('addChart').innerText = "Remove Graph";
    document.getElementById('mergeGraphs').style.display = "inline";
    document.getElementById('mergeGraphs').value = "true";
    document.getElementById('mergeGraphs').innerHTML = "Split Graphs";

    clicked = true;

    //Update 1st set of graphs
    dataObject2 = new DataObject(d, "2", "#00e600", graphSet1);
    dataObject2.getGraphSet().updatePlots(dataObject2.getFilteredData(), dataObject2.getFilterObject(), dataObject2.getColour(), dataObject2.getId());
    updateTrendline(dataObject2.getFilteredData(), dataObject2.getGraphSet().getScatter(), "line_secondary");

    //Set up sliders for second set of graphs
    document.getElementById('sliders').setAttribute("style","width: 50%");
    document.getElementById('graph2sliders').style.display = "inline";
    document.getElementById('graph2sliders').setAttribute("style","width: 50%");

    $(function() {
      $( "#graph2slider" ).slider({
        range: true,
        min: new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000,
        max: new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000,
        values: [new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000, new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000],
        slide: function( event, ui ) {
          dataObject2.getFilterObject().setDates(ui.values[0] * 1000, ui.values[1] * 1000);
          dataObject2.getGraphSet().updateScales(dataObject2.getData(), dataObject2.getFilterObject());
          dataObject2.updateGraphs();
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
          dataObject2.getFilterObject().setTimes(ui.values[0] * 1000, ui.values[1] * 1000);
          dataObject2.getGraphSet().updateScales(dataObject2.getData(), dataObject2.getFilterObject());
          dataObject2.updateGraphs();
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
          dataObject2.getFilterObject().setDistances(ui.values[0], ui.values[1]);
          dataObject2.getGraphSet().updateScales(dataObject2.getData(), dataObject2.getFilterObject());
          dataObject2.updateGraphs();
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
          dataObject2.getFilterObject().setElevationGain(ui.values[0], ui.values[1]);
          dataObject2.getGraphSet().updateScales(dataObject2.getData(), dataObject2.getFilterObject());
          dataObject2.updateGraphs();
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
          dataObject2.getFilterObject().setHeartRates(ui.values[0], ui.values[1]);
          dataObject2.getGraphSet().updateScales(dataObject2.getData(), dataObject2.getFilterObject());
          dataObject2.updateGraphs();
        }
      });
    });
  }
  else {
    document.getElementById('addChart').innerText = "Add Graph";
    document.getElementById('mergeGraphs').style.display = "none";

    clicked = false;
    console.log("Removing graph");
    //Remove second set of graphs

    d3.select('#graphSet2Container').selectAll('div').remove();
    d3.select('#graphSet1Container').selectAll('div').remove();

    //Update first set of graphs
    graphSet1 = new graphSet(margin, w, h, "graphSet1Container");
    var filterObject = new Filters(dataset);
    dataObject1.setGraphSet(graphSet1);
    dataObject1.getGraphSet().buildGraphs(filterObject, dataObject1.getData());
    dataObject1.updateGraphs();
    updateTrendline(dataObject1.getFilteredData(), dataObject1.getGraphSet().getScatter(), "line_primary");

    //Remove sliders for second set of graphs
    document.getElementById('sliders').setAttribute("style","width: 100%");
    document.getElementById('graph2sliders').style.display = "none";
  }
}

$(function() {
  $( "#slider" ).slider({
    range: true,
    min: new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000,
    max: new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000,
    values: [new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000, new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000],
    slide: function( event, ui ) {
      console.log("slide");
      dataObject1.getFilterObject().setDates(ui.values[0] * 1000, ui.values[1] * 1000);
      dataObject1.getGraphSet().updateScales(dataObject1.getData(), dataObject1.getFilterObject());
      dataObject1.updateGraphs();
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
      dataObject1.getFilterObject().setTimes(ui.values[0] * 1000, ui.values[1] * 1000);
      dataObject1.getGraphSet().updateScales(dataObject1.getData(), dataObject1.getFilterObject());
      dataObject1.updateGraphs();
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
      dataObject1.getFilterObject().setDistances(ui.values[0], ui.values[1]);
      dataObject1.getGraphSet().updateScales(dataObject1.getData(), dataObject1.getFilterObject());
      dataObject1.updateGraphs();
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
      dataObject1.getFilterObject().setElevationGain(ui.values[0], ui.values[1]);
      dataObject1.getGraphSet().updateScales(dataObject1.getData(), dataObject1.getFilterObject());
      dataObject1.updateGraphs();
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
      dataObject1.getFilterObject().setHeartRates(ui.values[0], ui.values[1]);
      dataObject1.getGraphSet().updateScales(dataObject1.getData(), dataObject1.getFilterObject());
      dataObject1.updateGraphs();
    }
  });
});

function filterTags(tags) {
  dataObject1.getFilterObject().setTags(tags.split(' '));
  dataObject1.getGraphSet().updateScales(dataObject1.getData(), dataObject1.getFilterObject());
  dataObject1.updateGraphs();
}

function mergeGraphs() {
  d3.select('#graphSet1Container').selectAll('div').remove();
  d3.select('#graphSet2Container').selectAll('div').remove();

  var filterObject = new Filters(dataset);
  graphSet1 = new graphSet(margin, w, h, "graphSet1Container");
  dataObject1.setGraphSet(graphSet1);
  dataObject2.setGraphSet(graphSet1);
  graphSet1.buildGraphs(filterObject, dataObject1.getData().concat(dataObject2.getData()));
  graphSet1.updatePlots(dataObject1.getFilteredData(), dataObject1.getFilterObject(), dataObject1.getColour(), dataObject1.getId());
  graphSet1.updatePlots(dataObject2.getFilteredData(), dataObject2.getFilterObject(), dataObject2.getColour(), dataObject2.getId());
  updateTrendline(dataObject1.getFilteredData(), dataObject1.getGraphSet().getScatter(), "line_primary");
  updateTrendline(dataObject2.getFilteredData(), dataObject2.getGraphSet().getScatter(), "line_secondary");
}

function getNeededPace(distance, dataObject) {
  var min_dist = distance - (0.1*distance);
  var max_dist = parseInt(distance) + parseInt((0.1*distance));
  acceptable_data = dataObject.getData().filter(d => (d.distance <= max_dist && d.distance >= min_dist));
  dataObject.getFilterObject().setDistances(min_dist, max_dist);
  dataObject.getGraphSet().updateScales(dataObject.getData(), dataObject.getFilterObject());
  dataObject.updateGraphs();
  updateTrendline(dataObject.getFilteredData(), dataObject.getGraphSet().getScatter(), "line_primary");
  filtered = dataObject.getFilteredData();
  needed_pace = d3.mean(filtered, function(d) { return d.average_pace; })
  document.getElementById("pace").innerHTML=needed_pace.toFixed(3)+"bpkm";
}

document.getElementById("addChart").onclick = function() {
  createGraphs(dataset, reg, "#00e600");
};

document.getElementById("mergeGraphs").onclick = function() {
  console.log(document.getElementById("mergeGraphs").value);
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
