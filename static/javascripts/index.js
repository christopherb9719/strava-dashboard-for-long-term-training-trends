console.log(dataset);
console.log(reg);

var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
var parseDate = d3.timeParse("%m/%d/%y");

var startDate = new Date(d3.min(dataset, function(d) {return d.year; }), d3.min(dataset, function(d) {return d.month; }), d3.min(dataset, function(d) {return d.day; }), 0, 0, 0),
    endDate = new Date(d3.max(dataset, function(d) {return d.year; }), d3.max(dataset, function(d) {return d.month; }), d3.max(dataset, function(d) {return d.day; }), 0, 0, 0);

var margin = {top: 20, right: 20, bottom: 50, left: 70},
    w = 1200 - margin.left - margin.right,
    h = 600 - margin.top - margin.bottom;


var min_distance = d3.min(dataset, function(d) { return d.distance });
var max_distance = d3.max(dataset, function(d) { return d.distance });
var min_elevation_gain = d3.min(dataset, function(d) { return d.total_elevation_gain });
var max_elevation_gain = d3.max(dataset, function(d) { return d.total_elevation_gain });
var min_heart_rate = d3.min(dataset, function(d) { return d.heart_rate });
var max_heart_rate = d3.max(dataset, function(d) { return d.heart_rate });
var min_date = startDate;
var max_date = endDate;
var min_time = new Date(0, 0, 0, 0, 0, 0);
var max_time = new Date(0, 0, 0, 23, 59, 59);


// Add the tooltip container to the vis container
// it's invisible and its position/contents are defined during mouseover
var tooltip = d3.select("#graph_container").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var scatterGraph1 = new Scatter('#graph_container', dataset, margin, w, h);
appendPath(scatterGraph1, reg);

//var hist = buildHistogram(w, h/2);

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
      graph.getPlot().selectAll("path").remove();
      appendPath(graph, response);
    },
    error: function(error){
      console.log(error);
    }
  });
}

document.getElementById("addChart").onclick = function() {
  if (typeof scatterGraph2 == "undefined") {
    w = w/2
    scatterGraph1.update(w, h);
    var scatterGraph2 = new Scatter('#graph_container', dataset, margin, w, h);
    appendPath(scatterGraph2, reg);
    document.getElementById('sliders').setAttribute("style","width:" + w);
    document.getElementById('graph2sliders').setAttribute("style","width:" + w);

    $(function() {
      $( "#graph2slider" ).slider({
        range: true,
        min: new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000,
        max: new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000,
        values: [new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000, new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000],
        slide: function( event, ui ) {
          scatterGraph2.setDates(ui.values[0] * 1000, ui.values[1] * 1000);
          scatterGraph2.update(w, h);
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
        }
      });
    });

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
    }
  });
});


function update(graph) {
    newData = dataset;
    newData = newData.filter(function(d,i) {
      if ((d.distance <= max_distance && d.distance >= min_distance) && (d.total_elevation_gain <= max_elevation_gain && d.total_elevation_gain >= min_elevation_gain) && (d.heart_rate <= max_heart_rate && d.heart_rate >= min_heart_rate)) {
        return d;
      }
    })

    if (min_date > 0 || max_date > 0) {
      newData = newData.filter(function(d) {
        if (d.year > min_date.getFullYear() && d.year < max_date.getFullYear()) {
          return d;
        }
        else if (d.year == min_date.getFullYear()) {
            if (d.month >= min_date.getMonth()) return d;
        }
        else if (d.year == max_date.getFullYear()) {
          if (d.month <= max_date.getMonth()) return d;
        }
      });
    }
    if (min_time != 0 || max_time != 0) {
      newData = newData.filter(function(d) {
        if (d.hour > min_time.getHours() && d.hour < max_time.getHours()) {
          return d;
        }
        else if (d.hour == min_time.getHours()) {
          if (d.minute >= min_time.getMinutes()) return d;
        }
        else if (d.year == max_time.getHours()) {
          if (d.minute <= max_time.getMinutes()) return d;
        }
      });
    }

    $(function(){
  		$.ajax({
  			url: '/_gaussian_calculation',
  			data: JSON.stringify(newData),
        contentType: 'application/json;charset=UTF-8',
  			type: 'POST',
  			success: function(response){
          graph.selectAll("path").remove();
          appendPath(graph, response);
  			},
  			error: function(error){
  				console.log(error);
  			}
  		});
    });
    graph.selectAll("circle").remove();
    plotPoints(graph, newData);
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
