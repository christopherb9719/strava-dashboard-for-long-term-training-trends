var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
var parseDate = d3.timeParse("%m/%d/%y");

var margin = {top: 20, right: 20, bottom: 50, left: 70},
    w = 1200 - margin.left - margin.right,
    h = 600 - margin.top - margin.bottom;

var clicked = false;
var  scatterGraph2;
// Add the tooltip container to the vis container
// it's invisible and its position/contents are defined during mouseover
var tooltip = d3.select("#graph_container").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

//Build Graphs
var graph1Filters = new Filters(dataset)
var scatterGraph1 = new Scatter('#graph_container', dataset, graph1Filters, margin, w, h, "scatter1", "#ff471a");
plotScatterPoints(scatterGraph1.getSvg(), dataset, "#ff471a", scatterGraph1.getX(), scatterGraph1.getY(), graph1Filters);
appendPath(scatterGraph1, reg, "line_primary");
var barChart1 = new BarChart('#hist_container', dataset, graph1Filters, margin, w, h/2, "barChart1", "#ff471a");

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
        option.value = elem.token;
        console.log(option.value);
        $("#dropdown").append(option);
      })
    },
    error: function(error) {
      console.log(error);
    }
  })
})

function plotGraphs(access_token) {
  console.log("Get user data");
  $.ajax({
    url: '/get_user_data',
    data: access_token,
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
    document.getElementById('addChart').value = "Remove Graph";
    console.log("Adding graph")
    clicked = true;

    //Update 1st set of graphs
    scatterGraph1.update(w, h);
    updateTrendline(scatterGraph1.getFilteredData(), scatterGraph1, "line_primary");
    barChart1.update(w, h/2);

    //Create second set of graphs
    graph2Filters = new Filters(d);
    scatterGraph2 = new Scatter('#graph_container', d, graph2Filters, margin, w, h, "scatter2", colour);
    plotScatterPoints(scatterGraph2.getSvg(), dataset, "#00e600", scatterGraph2.getX(), scatterGraph2.getY(), graph2Filters);
    appendPath(scatterGraph2, line_points, "line_secondary");
    var barChart2 = new BarChart('#hist_container', d, graph2Filters, margin, w, h/2, "barChart2", colour);

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
          graph2Filters.setDates(ui.values[0] * 1000, ui.values[1] * 1000);
          scatterGraph2.update(w, h);
          barChart2.update(w, h/2);
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
          graph2Filters.setTimes(ui.values[0] * 1000, ui.values[1] * 1000);
          scatterGraph2.update(w, h);
          barChart2.update(w, h/2);
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
          graph2Filters.setDistances(ui.values[0], ui.values[1]);
          scatterGraph2.update(w, h);
          barChart2.update(w, h/2);

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
          graph2Filters.setElevationGain(ui.values[0], ui.values[1]);
          scatterGraph2.update(w, h);
          barChart2.update(w, h/2);
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
          graph2Filters.setHeartRates(ui.values[0], ui.values[1]);
          scatterGraph2.update(w, h);
          barChart2.update(w, h/2);
        }
      });
    });
  }
  else {
    document.getElementById('addChart').value = "Add Graph";
    clicked = false;
    console.log("Removing graph");
    //Remove second set of graphs
    d3.select('#scatter2').remove();
    d3.select('#barChart2').remove();

    //Update first set of graphs
    scatterGraph1.update(w/2, h);
    updateTrendline(scatterGraph1.getFilteredData(), scatterGraph1, "line_primary");
    barChart1.update(w/2, h/2);

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
      graph1Filters.setDates(ui.values[0] * 1000, ui.values[1] * 1000);
      scatterGraph1.update(w, h);
      barChart1.update(w, h/2);
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
      graph1Filters.setTimes(ui.values[0] * 1000, ui.values[1] * 1000);
      scatterGraph1.update(w, h);
      barChart1.update(w, h/2);
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
      graph1Filters.setDistances(ui.values[0], ui.values[1]);
      scatterGraph1.update(w, h);
      barChart1.update(w, h/2);
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
      graph1Filters.setElevationGain(ui.values[0], ui.values[1]);
      scatterGraph1.update(w, h);
      barChart1.update(w, h/2);
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
      graph1Filters.setHeartRates(ui.values[0], ui.values[1]);
      scatterGraph1.update(w, h);
      barChart1.update(w, h/2);
    }
  });
});

function filterTags(tags) {
  graph1Filters.getFilters().setTags(tags.split(' '));
  scatterGraph1.update(w, h);
  barChart1.update(w, h/2);
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
