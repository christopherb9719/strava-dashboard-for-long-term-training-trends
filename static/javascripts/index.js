console.log(dataset);
console.log(reg);

var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
var parseDate = d3.timeParse("%m/%d/%y");


var startDate = new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0),
    endDate = new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0);

var margin = {top: 20, right: 20, bottom: 50, left: 70},
w = 1200 - margin.left - margin.right,
h = 600 - margin.top - margin.bottom;

var x = d3.scaleLinear().range([0, w]);
var y = d3.scaleLinear().range([h, 0]);

var xAxis = x.domain([d3.min(dataset, function(d) {return d.heart_rate; }) - 5, d3.max(dataset, function(d) { return d.heart_rate; })+5]);
var yAxis = y.domain([d3.min(dataset, function(d) { return d.average_pace; })-0.02, d3.max(dataset, function(d) {return d.average_pace; }) + 0.02]);

var svgContainer = d3.select('#graph_container').append("g");
var svg;
var barchart;
var scatterPlot = dc.scatterPlot('#graph_container');
var histPlot = dc.barChart('#hist_chart')

var min_distance;
var max_distance;
var min_elevation_gain;
var max_elevation_gain;
var min_heart_rate;
var max_heart_rate;
var min_date = startDate;
var max_date = endDate;
var lineFunction = d3.line()
  .x(function(d) {
    console.log(typeof d.x);
    console.log(d.x);
    return x(d.x);
  })
  .y(function(d) {
    console.log(typeof d.y);
    console.log(d.y);
    return y(d.y);
  })


buildScatter()
//buildHistogram();

update();


$(function() {
  $( "#slider" ).slider({
    range: true,
    min: new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000,
    max: new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000,
    values: [new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000, new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000],
    slide: function( event, ui ) {
      min_date = new Date(ui.values[0] * 1000);
      max_date = new Date(ui.values[1] * 1000);
      update();
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
      min_distance = ui.values[0];
      max_distance = ui.values[1];
      update();
    }
  })
  .each(function() {
    var opt = $(this).data().slider.options;
    // Get the number of possible values
    var vals = opt.max - opt.min;
    // Position the labels
    for (var i = 0; i <= vals; i = i + 1000) {
        // Create a new element and position it with percentages
        var el = $('<label>' + (i + opt.min) + '</label>').css('left', (i/vals*100) + '%');
        // Add the element inside #slider
        $("#distanceSlider").append(el);
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
      min_elevation_gain = ui.values[0];
      max_elevation_gain = ui.values[1];
      update();
    }
  })
  .each(function() {
    var opt = $(this).data().slider.options;
    // Get the number of possible values
    var vals = opt.max - opt.min;
    // Position the labels
    for (var i = 0; i <= vals; i = i + 100) {
        // Create a new element and position it with percentages
        var el = $('<label>' + (i + opt.min) + '</label>').css('left', (i/vals*100) + '%');
        // Add the element inside #slider
        $("#elevationSlider").append(el);
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
      min_heart_rate = ui.values[0];
      max_heart_rate = ui.values[1];
      update();
    }
  });
});

function update() {
    newData = dataset;
    if (min_distance > 0 || max_distance > 0) {
        newData = newData.filter(function(d,i) {
            //filter by distance
            if (!max_distance > 0) {
                if (d.distance >= min_distance) {
                    return d;
                }
            }
            else if (!min_distance > 0) {
                if (d.distance <= max_distance) {
                    return d;
                }
            }
            else {
                if (d.distance <= max_distance && d.distance >= min_distance) {
                    return d;
                }
            }
        })
    }
    if (min_elevation_gain > 0 || max_elevation_gain > 0) {
        newData = newData.filter(function(d,i) {
        //filter by distance
          if (d.total_elevation_gain <= max_elevation_gain && d.total_elevation_gain >= min_elevation_gain) {
            return d;
          }
        })
      }

    if (min_heart_rate > 0 || max_heart_rate > 0) {
        newData = newData.filter(function(d,i) {
            //filter by distance
            if (!max_heart_rate > 0) {
                if (d.heart_rate >= min_heart_rate) {
                    return d;
                }
            }
            else if (!min_heart_rate > 0) {
                if (d.heart_rate <= max_heart_rate) {
                    return d;
                }
            }
            else {
                if (d.heart_rate <= max_heart_rate && d.heart_rate >= min_heart_rate) {
                    return d;
                }
            }
        })
    }
    if (min_date > 0 || max_date > 0) {
      newData = newData.filter(function(d) {
        if (d.year > min_date.getFullYear() && d.year < max_date.getFullYear()) {
          return d;
        }
        else if (d.year == min_date.getFullYear()) {
            if (d.month >= min_date.getMonth()+1) return d;
        }
        else if (d.year == max_date.getFullYear()) {
          if (d.month <= max_date.getMonth()-1) return d;
        }
      });
    }

    svg.selectAll("circle").remove();
    svg.selectAll("circle")
      .data(newData)
      .enter()
      .append("a")
        .attr("xlink:href", function(d) {return "https://www.strava.com/activities/" + d.id})
        .append("circle")
          .attr("cx", function(d) {return xAxis(d.heart_rate);})
          .attr("cy", function(d) {return yAxis(d.average_pace);})
          .attr("r", 5)
          .attr("fill", "#ff471a")
        .on('mouseover', function() {
          d3.select(this)
            .transition()
            .attr("fill", "#000000")
            .attr("r", 7)
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .attr("fill", "#ff471a")
            .attr("r", 5)
        });
    svg.append("path")
     .attr("d", lineFunction(reg));
}

function buildScatter() {
    //Create SVG variable to build the graph into
    svg = svgContainer.append('svg')
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
    //Append regression line
    svg.append("path")
      .attr("d", lineFunction(reg))
      .style("class", "line")

    //Append x-axis
    svg.append("g")
        .attr("transform", "translate(0, "+ h +")")
        .call(d3.axisBottom(xAxis));

    //Append label for x-axis
    svg.append("text")
        .attr("transform",
            "translate(" + (w/2) + " ," +
                            (h + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Average Heart Rate (BPM)");

    //Append y-axis
    svg.append("g")
        .call(d3.axisLeft(yAxis));

    //Append label for y-axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (h / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Average Pace (s/m)");

}



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


//taken from Jason Davies science library
// https://github.com/jasondavies/science.js/
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

function getMonthFromString(mon){

    var d = Date.parse(mon + "1, 2012");
    if(!isNaN(d)){
       return new Date(d).getMonth() + 1;
    }
    return -1;
  }
