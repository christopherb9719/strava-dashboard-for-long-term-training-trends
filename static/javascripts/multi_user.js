var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
var parseDate = d3.timeParse("%m/%d/%y");

var margin = {top: 20, right: 20, bottom: 50, left: 70},
    w = 1000 - margin.left - margin.right,
    h = 500 - margin.top - margin.bottom;

var secondaryFilterObject;
var clicked = false;
// Add the tooltip container to the vis container
// it's invisible and its position/contents are defined during mouseover
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

//Build Graphs
var graphSet1 = new graphSet(margin, w, h, "graphSet1Container");
var primaryFilterObject = new Filters(dataset, "#ff471a", "1", graphSet1);
graphSet1.buildGraphs(dataset, primaryFilterObject.getFilteredData(), primaryFilterObject.getColour());
graphSet1.populateAllGraphs(primaryFilterObject, "#ff471a");
updateTrendline(primaryFilterObject.getFilteredData(), graphSet1.getScatter(), "line_primary");


function showDropdown() {
  document.getElementById("myDropdown").classList.toggle("show");
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

$('#userSearch').change(function() {
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
          plotGraphs(elem.username);
        }
        $("#myDropdown").append(option);
      })
    },
    error: function(error) {
      console.log(error);
    }
  })
})

function plotGraphs(user) {
  console.log("Get user data");
  console.log(user);
  $.ajax({
    url: '/get_user_data',
    data: user,
    contentType: 'text',
    type: 'POST',
    success: function(response) {
      console.log(response);
      var activities = response[0];
      var line_coords = response[1];
      addNewUserData(activities, line_coords, "#00e600");
      },
    error: function(error) {
      console.log(error);
    }
  })
}

function addNewUserData(d, line_points, colour) {
    //Update 1st set of graphs
    this.secondaryFilterObject = new Filters(d, colour, "2", this.graphSet1);
    this.graphSet1.populateAllGraphs(this.secondaryFilterObject);
    updateTrendline(this.secondaryFilterObject.getFilteredData(), this.graphSet1.getScatter(), "line_secondary");
}

$(function() {
  $( "#slider" ).slider({
    range: true,
    min: new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000,
    max: new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000,
    values: [new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000, new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000],
    slide: function( event, ui ) {
      console.log(primaryFilterObject);
      primaryFilterObject.setDates(ui.values[0] * 1000, ui.values[1] * 1000);
      primaryFilterObject.update();

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
      primaryFilterObject.setTimes(ui.values[0] * 1000, ui.values[1] * 1000);
      primaryFilterObject.update();
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
      primaryFilterObject.setDistances(ui.values[0], ui.values[1]);
      primaryFilterObject.update();
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
      primaryFilterObject.setElevationGain(ui.values[0], ui.values[1]);
      primaryFilterObject.update();
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
      primaryFilterObject.setHeartRates(ui.values[0], ui.values[1]);
      primaryFilterObject.update();
    }
  });
});

function filterTags(tags) {
  primaryFilterObject.setTags(tags.split(' '));
  primaryFilterObject.update();
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
