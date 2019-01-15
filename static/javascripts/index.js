var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
var parseDate = d3.timeParse("%m/%d/%y");

var margin = {top: 20, right: 20, bottom: 50, left: 70},
    w = 1200 - margin.left - margin.right,
    h = 600 - margin.top - margin.bottom;

var clicked = false;
var scatterGraph2;

// Add the tooltip container to the vis container
// it's invisible and its position/contents are defined during mouseover
var tooltip = d3.select("#graph_container").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

//Build Graphs
var graph1Filters = new Filters(dataset)
var scatterGraph1 = new Scatter('#graph_container', dataset, graph1Filters, margin, w, h, "scatter1");
appendPath(scatterGraph1, reg);
var barChart1 = new BarChart('#hist_container', dataset, graph1Filters, margin, w, h/2, "barChart1");

function updateTrendline(graph) {
  $.ajax({
    url: '/_gaussian_calculation',
    data: JSON.stringify(graph.getData().filter(d => ((d.distance <= graph.getFilters().getMaxDistance() && d.distance >= graph.getFilters().getMinDistance())
      && (d.total_elevation_gain <= graph.getFilters().getMaxElevationGain() && d.total_elevation_gain >= graph.getFilters().getMinElevationGain())
      && (d.heart_rate <= graph.getFilters().getMaxHeartRate() && d.heart_rate >= graph.getFilters().getMinHeartRate())
      && graph.dataInDate(d)
      && graph.dataInTime(d)
      && graph.containsTags(d)))),
    contentType: 'application/json;charset=UTF-8',
    type: 'POST',
    success: function(response){
      console.log("Updating trend line");
      graph.getPlot().selectAll("path").remove();
      appendPath(graph, response);
    },
    error: function(error){
      console.log(error);
    }
  });
}

document.getElementById("addChart").onclick = function() {
  if (!clicked) {
    w = w/2;
    scatterGraph1.update(w, h);
    updateTrendline(scatterGraph1)
    graph2Filters = new Filters(dataset);
    scatterGraph2 = new Scatter('#graph_container', dataset, graph2Filters, margin, w, h, "scatter2");
    appendPath(scatterGraph2, reg);
    barChart1.update(w, h/2);
    var barChart2 = new BarChart('#hist_container', dataset, graph2Filters, margin, w, h/2, "barChart2");
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
    clicked=true;
  }
  else {
    w = w*2;
    console.log("Removing graph");
    d3.select('#scatter2').remove();
    d3.select('#barChart2').remove();
    clicked=false;
    scatterGraph1.update(w, h);
    updateTrendline(scatterGraph1);
    barChart1.update(w, h/2);
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
