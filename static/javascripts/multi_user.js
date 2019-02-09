var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
var parseDate = d3.timeParse("%m/%d/%y");

var margin = {top: 20, right: 20, bottom: 50, left: 70},
    w = 1000 - margin.left - margin.right,
    h = 500 - margin.top - margin.bottom;

var colours = d3.scaleOrdinal(d3.schemeCategory10);
var dataObjects = [];
var id = 1;
var clicked = false;
// Add the tooltip container to the vis container
// it's invisible and its position/contents are defined during mouseover
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


//Build Graphs
var filterObject = new Filters(dataset);
var graphSet1 = new graphSet(margin, w, h, "graphSet1Container");
var dataObject = new DataObject(dataset, String(id), colours(dataObjects.length), graphSet1, filterObject);
console.log(colours);
console.log(colours(dataObjects.length));
graphSet1.buildGraphs(dataObject.getFilterObject(), dataObject.getData());
graphSet1.updatePlots(dataObject.getFilteredData(), dataObject.getFilterObject(), dataObject.getColour(), dataObject.getId());
updateTrendline(dataObject.getFilteredData(), dataObject.getGraphSet().getScatter(), "line_primary", dataObject.getId());
dataObjects.push(dataObject);

function showDropdown() {
  document.getElementById("myDropdown").classList.toggle("show");
}


function updateTrendline(filtered_data, graph, line_class, id) {
  $.ajax({
    url: '/_gaussian_calculation',
    data: JSON.stringify(filtered_data),
    contentType: 'application/json;charset=UTF-8',
    type: 'POST',
    success: function(response){
      console.log("Updating trend line");
      graph.getSvg().selectAll("[id='#regression" + id + "']").remove();
      appendPath(graph, response, line_class, id);
    },
    error: function(error){
      console.log(error);
    }
  });
}

function findUserData() {
  console.log("Change");
  $.ajax({
    url: '/find_users',
    data: document.getElementById("userSearch").value,
    contentType: 'text',
    type: 'POST',
    success: function(response) {
      JSON.parse(response).forEach(function(elem) {
        var option = document.createElement("a");
        option.text = elem.username;
        option.onclick = function() {
        plotData(elem.username);
        }
        $("#myDropdown").append(option);
      })
    },
    error: function(error) {
      console.log(error);
    }
  })
}

function plotData(user) {
  console.log("Get user data");
  $.ajax({
    url: '/get_user_data',
    data: user,
    contentType: 'text',
    type: 'POST',
    success: function(response) {
      var activities = response[0];
      var line_coords = response[1];
      addNewUserData(user, activities, line_coords, "#00e600");
      },
    error: function(error) {
      console.log(error);
    }
  })
}

function getAllData() {
  var allData = [];
  for (var index in dataObjects) {
    allData.push(dataObjects[index].getData());
  }
  allData = [].concat.apply([], allData);
  return allData;
}

function addNewUserData(user, d, line_points, colour) {
    //Update 1st set of graphs
    id = id + 1;
    var dataObject = new DataObject(d, String(id), colours(dataObjects.length), graphSet1, filterObject);
    dataObjects.push(dataObject);

    var allData = getAllData();

    filterObject.initialiseFilters(allData);
    allFilteredData = filterObject.filterData(allData);

    graphSet1.rebuildGraphs(filterObject, allFilteredData);
    graphSet1.updateScales(allFilteredData, filterObject);
    for (var index in dataObjects) {
      dataObjects[index].getGraphSet().updatePlots(dataObjects[index].getFilteredData(), dataObjects[index].getFilterObject(), dataObjects[index].getColour(), dataObjects[index].getId());
      updateTrendline(dataObjects[index].getFilteredData(), dataObjects[index].getGraphSet().getScatter(), "line_secondary", dataObjects[index].getId());
    }

    var userObject = document.createElement("a");
    userObject.text = user;
    userObject.value = String(id);
    userObject.onclick = function(d) {
      removeUsersData(userObject.value);
      d3.select(userObject).remove();
    };
    document.getElementById('usersList').appendChild(userObject);
}

$(function() {
  $( "#slider" ).slider({
    range: true,
    min: new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000,
    max: new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000,
    values: [new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000, new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000],
    slide: function( event, ui ) {
      filterObject.setDates(ui.values[0] * 1000, ui.values[1] * 1000);
      var allData = getAllData();
      graphSet1.updateScales(allData, filterObject);
      for (index in dataObjects) {
        var dataObject = dataObjects[index];
        dataObject.updateGraphs();
      }
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
      filterObject.setTimes(ui.values[0] * 1000, ui.values[1] * 1000);
      var allData = getAllData();
      graphSet1.updateScales(allData, filterObject);
      for (index in dataObjects) {
        var dataObject = dataObjects[index];
        dataObject.updateGraphs();
      }
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
      filterObject.setDistances(ui.values[0], ui.values[1]);
      var allData = getAllData();
      graphSet1.updateScales(allData, filterObject);
      for (index in dataObjects) {
        var dataObject = dataObjects[index];
        dataObject.updateGraphs();
      }
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
      filterObject.setElevationGain(ui.values[0], ui.values[1]);
      var allData = getAllData();
      graphSet1.updateScales(allData, filterObject);
      for (index in dataObjects) {
        var dataObject = dataObjects[index];
        dataObject.updateGraphs();
      }
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
      filterObject.setHeartRates(ui.values[0], ui.values[1]);
      var allData = getAllData();
      graphSet1.updateScales(allData, filterObject);
      for (index in dataObjects) {
        var dataObject = dataObjects[index];
        dataObject.updateGraphs();
      }
    }
  });
});

function filterTags(tags) {
  filterObject.setTags(tags.split(' '));
  for (index in dataObjects) {
    var dataObject = dataObjects[index];
    dataObject.updateGraphs();
  }
}

function getNeededPace(distance, data) {
  var min_dist = distance - (0.1*distance);
  var max_dist = parseInt(distance) + parseInt((0.1*distance));
  acceptable_data = data.filter(d => (d.distance <= max_dist && d.distance >= min_dist));
  graph1Filters.setDistances(min_dist, max_dist);
  scatterGraph1.update(w, h);
  filtered = scatterGraph1.getFilteredData();
  needed_pace = d3.mean(filtered, function(d) { return d.average_pace; })
  document.getElementById("pace").innerHTML=needed_pace.toFixed(3)+"bpkm";
}

function removeUsersData(id) {
  d3.selectAll("[id='#dataset" + id + "']").remove();
  d3.selectAll("[id='#regression" + id + "']").remove();
  var index = dataObjects.indexOf(dataObjects.find(d => { return d.id == id }));
  dataObjects.splice(index, 1);
}
