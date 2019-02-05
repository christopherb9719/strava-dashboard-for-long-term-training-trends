var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
var parseDate = d3.timeParse("%m/%d/%y");

var margin = {top: 20, right: 20, bottom: 50, left: 70},
    w = 1000 - margin.left - margin.right,
    h = 500 - margin.top - margin.bottom;

var clicked = false;
var  scatterGraph2;
// Add the tooltip container to the vis container
// it's invisible and its position/contents are defined during mouseover
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

//Build Graphs
var graphSet1 = new graphSet(dataset, reg, margin, w, h, "graphSet1Container", 1, "#ff471a");

document.getElementById("addChart").onclick = function() {
  createGraphs(dataset, reg, "#00e600");
};

document.getElementById("mergeGraphs").onclick = function() {
  console.log("Merging graphs");
  mergeGraphs();
};

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
    w = w/2
    document.getElementById('addChart').innerText = "Remove Graph";
    clicked = true;

    //Update 1st set of graphs
    graphSet1.resize(w);

    //Create second set of graphs
    var graphSet2 = new graphSet(d, line_points, margin, w, h, 'graphSet2Container', 2, colour)

    //Set up sliders for second set of graphs
    document.getElementById('sliders').setAttribute("style","width: 50%");
    document.getElementById('graph2sliders').setAttribute("style","width: 50%");

    $(function() {
      $( "#graph2slider" ).slider({
        range: true,
        min: new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000,
        max: new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000,
        values: [new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000, new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000],
        slide: function( event, ui ) {
          graphSet2.getFilters().setDates(ui.values[0] * 1000, ui.values[1] * 1000);
          graphSet2.update();
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
          graphSet2.getFilters().setTimes(ui.values[0] * 1000, ui.values[1] * 1000);
          graphSet2.update();
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
          graphSet2.getFilters().setDistances(ui.values[0], ui.values[1]);
          graphSet2.update();
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
          graphSet2.getFilters().setElevationGain(ui.values[0], ui.values[1]);
          graphSet2.update();
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
          graphSet2.getFilters().setHeartRates(ui.values[0], ui.values[1]);
          graphSet2.update();
        }
      });
    });
  }
  else {
    w = w*2;
    document.getElementById('addChart').innerText = "Add Graph";
    clicked = false;
    console.log("Removing graph");
    //Remove second set of graphs
    d3.select('#graphSet2').remove();

    //Update first set of graphs
    graphSet1.update();

    //Remove sliders for second set of graphs
    document.getElementById('sliders').setAttribute("style","width: 100%");
    document.getElementById('graph2sliders').setAttribute("style","width: 0%");
  }
}

$(function() {
  $( "#slider" ).slider({
    range: true,
    min: new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000,
    max: new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000,
    values: [new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000, new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000],
    slide: function( event, ui ) {
      graphSet1.getFilters().setDates(ui.values[0] * 1000, ui.values[1] * 1000);
      graphSet1.update();

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
      graphSet1.getFilters().setTimes(ui.values[0] * 1000, ui.values[1] * 1000);
      graphSet1.update();
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
      graphSet1.getFilters().setDistances(ui.values[0], ui.values[1]);
      graphSet1.update();
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
      graphSet1.getFilters().setElevationGain(ui.values[0], ui.values[1]);
      graphSet1.update();
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
      graphSet1.getFilters().setHeartRates(ui.values[0], ui.values[1]);
      graphSet1.update();
    }
  });
});

function filterTags(tags) {
  graphSet1.getFilters().setTags(tags.split(' '));
  graphSet1.update()
}

function mergeGraphs() {
  w = w*2
  data1 = scatterGraph1.getData();
  data2 = scatterGraph2.getData();
  filtered_data1 = scatterGraph1.getFilteredData();
  filtered_data2 = scatterGraph2.getFilteredData();
  all_data = data1.concat(data2);
  merge_filters = new Filters(all_data);

  d3.select('#scatter1').remove();
  d3.select('#scatter2').remove();

  var scatter3 = new Scatter("#graph_container", all_data, merge_filters, margin, w, h, "#scatter3");

  plotScatterPoints(scatter3.getSvg(), filtered_data1, "#ff471a", scatter3.getX(), scatter3.getY(), merge_filters);
  plotScatterPoints(scatter3.getSvg(), filtered_data2, "#00ff00", scatter3.getX(), scatter3.getY(), merge_filters);
  updateTrendline(filtered_data1, scatter3, "line_primary");
  updateTrendline(filtered_data2, scatter3, "line_secondary");

}


function getNeededPace(distance, data) {
  console.log(data);
  var min_dist = distance - (0.1*distance);
  var max_dist = parseInt(distance) + parseInt((0.1*distance));
  console.log(min_dist);
  console.log(max_dist);
  acceptable_data = data.filter(d => (d.distance <= max_dist && d.distance >= min_dist));
  graph1Filters.setDistances(min_dist, max_dist);
  scatterGraph1.update(w, h);
  filtered = scatterGraph1.getFilteredData();
  needed_pace = d3.mean(filtered, function(d) { return d.average_pace; })
  console.log(needed_pace);
  document.getElementById("pace").innerHTML=needed_pace.toFixed(3)+"bpkm";
}
