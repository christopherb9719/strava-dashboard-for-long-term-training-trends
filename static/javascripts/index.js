var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
var parseDate = d3.timeParse("%m/%d/%y");

var startDate = new Date(d3.min(dataset, function(d) {return d.year; }), d3.min(dataset, function(d) {return d.month; }), d3.min(dataset, function(d) {return d.day; }), 0, 0, 0),
    endDate = new Date(d3.max(dataset, function(d) {return d.year; }), d3.max(dataset, function(d) {return d.month; }), d3.max(dataset, function(d) {return d.day; }), 0, 0, 0);

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

var scatterGraph1 = new Scatter('#graph_container', dataset, margin, w, h, "scatter1");
appendPath(scatterGraph1, reg);
var barChart1 = new BarChart('#hist_container', dataset, margin, w, h/2, "barChart1");

function updateTrendline(graph) {
  $.ajax({
    url: '/_gaussian_calculation',
    data: JSON.stringify(graph.getData().filter(d => ((d.distance <= graph.max_distance && d.distance >= graph.min_distance)
      && (d.total_elevation_gain <= graph.max_elevation_gain && d.total_elevation_gain >= graph.min_elevation_gain)
      && (d.heart_rate <= graph.max_heart_rate && d.heart_rate >= graph.min_heart_rate)
      && graph.dataInDate(d)
      && graph.dataInTime(d)))),
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
    scatterGraph2 = new Scatter('#graph_container', dataset, margin, w, h, "scatter2");
    appendPath(scatterGraph2, reg);
    barChart1.update(w, h/2);
    var barChart2 = new BarChart('#hist_container', dataset, margin, w, h/2, "barChart2");
    document.getElementById('sliders').setAttribute("style","width: 50%");
    document.getElementById('graph2sliders').setAttribute("style","width: 50%");

    $(function() {
      $( "#graph2slider" ).slider({
        range: true,
        min: new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000,
        max: new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000,
        values: [new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000, new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000],
        slide: function( event, ui ) {
          scatterGraph2.setDates(ui.values[0] * 1000, ui.values[1] * 1000);
          scatterGraph2.update(w, h);
          barChart2.setDates(ui.values[0] * 1000, ui.values[1] * 1000);
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
          scatterGraph2.setTimes(ui.values[0] * 1000, ui.values[1] * 1000);
          scatterGraph2.update(w, h);
          barChart2.setTimes(ui.values[0] * 1000, ui.values[1] * 1000);
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
          scatterGraph2.setMinDistance(ui.values[0]);
          scatterGraph2.setMaxDistance(ui.values[1]);
          scatterGraph2.update(w, h);
          barChart2.setMinDistance(ui.values[0]);
          barChart2.setMaxDistance(ui.values[1]);
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
          scatterGraph2.setMinElevation(ui.values[0]);
          scatterGraph2.setMaxElevation(ui.values[1]);
          scatterGraph2.update(w, h);
          barChart2.setMinElevation(ui.values[0]);
          barChart2.setMaxElevation(ui.values[1]);
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
          scatterGraph2.setMinHeartRate(ui.values[0]);
          scatterGraph2.setMaxHeartRate(ui.values[1]);
          scatterGraph2.update(w, h);
          barChart2.setMinHeartRate(ui.values[0]);
          barChart2.setMaxHeartRate(ui.values[1]);
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
      scatterGraph1.setDates(ui.values[0] * 1000, ui.values[1] * 1000);
      scatterGraph1.update(w, h);
      barChart1.setDates(ui.values[0] * 1000, ui.values[1] * 1000);
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
      scatterGraph1.setTimes(ui.values[0] * 1000, ui.values[1] * 1000);
      scatterGraph1.update(w, h);
      barChart1.setTimes(ui.values[0] * 1000, ui.values[1] * 1000);
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
      scatterGraph1.setMinDistance(ui.values[0]);
      scatterGraph1.setMaxDistance(ui.values[1]);
      scatterGraph1.update(w, h);
      barChart1.setMinDistance(ui.values[0]);
      barChart1.setMaxDistance(ui.values[1]);
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
      scatterGraph1.setMinElevation(ui.values[0]);
      scatterGraph1.setMaxElevation(ui.values[1]);
      scatterGraph1.update(w, h);
      barChart1.setMinElevation(ui.values[0]);
      barChart1.setMaxElevation(ui.values[1]);
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
      scatterGraph1.setMinHeartRate(ui.values[0]);
      scatterGraph1.setMaxHeartRate(ui.values[1]);
      scatterGraph1.update(w, h);
      barChart1.setMinHeartRate(ui.values[0]);
      barChart1.setMaxHeartRate(ui.values[1]);
      barChart1.update(w, h/2);
    }
  });
});

function filterTags(tags) {
  scatterGraph1.setTags(tags.split(' '));
  scatterGraph1.update(w, h);
  barChart1.setTags(tags.split(' '));
  barChart1.update(w, h/2);
}

/**
function buildHistogram() {
    var countObj = {};

    // count how much each city occurs in list and store in countObj
    dataset.forEach(function(d) {
        var dist = Math.ceil(d.distance/1000)*1000;
        if(countObj[dist] == undefined) {
            countObj[dist] = 0;
        } else {
            countObj[dist] += 1;
        }
    });

    console.log(Math.max(Object.keys(countObj)));
    console.log(countObj);
    var xAxisHist = x.domain([0, d3.max(Object.keys(countObj))]);
    var yAxisHist = y.domain([0, d3.max(countObj)]);

    barchart = d3.select('#hist_chart').append('svg')
        .attr('class', 'barchart')
        .attr('width', w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

    //Append x axis
    barchart.append("g")
        .attr("transform", "translate(0, "+ h +")")
        .call(d3.axisBottom(xAxisHist));

    //Append y axis
    barchart.append("g")
        .call(d3.axisLeft(yAxisHist));

    console.log(countObj);

    svg.selectAll("bar")
        .data(countObj)
        .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.dist); })
            .attr("y", function(d) { return y(d.dist); })
}
*/

//taken from Jason Davies science library
// https://github.com/jasondavies/science.js/
/**
function gaussian(x) {
    var gaussianConstant = 1 / Math.sqrt(2 * Math.PI);
    console.log("Gausian constant: " + gaussianConstant)
	var mean = 0;
  var sigma = 1;
  x = (x - mean) / sigma;
  console.log("x: " + x);
  var val = -0.5*x*x;
  console.log(val);
  console.log(Math.exp(val));
  console.log(Math.exp(.5 * x * x) / sigma)
  return gaussianConstant * Math.exp(0.5 * x) / sigma;
};
*/
