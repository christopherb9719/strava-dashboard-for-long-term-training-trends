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
appendPath(scatterGraph1, reg);
var barChart1 = new BarChart('#hist_container', dataset, graph1Filters, margin, w, h/2, "barChart1", "#ff471a");

document.getElementById("addChart").onclick = function() {
  createGraphs(dataset, reg, "#ff471a");
};

document.getElementById("mergeGraphs").onclick = function() {
  console.log("Merging graphs");
  mergeGraphs();
};

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
    document.getElementById('addChart').value = "Remove Graph";
    console.log("Adding graph")
    clicked = true;
    w = w/2;
    //Update 1st set of graphs
    scatterGraph1.update(w, h);
    updateTrendline(scatterGraph1);
    barChart1.update(w, h/2);

    //Create second set of graphs
    graph2Filters = new Filters(d);
    scatterGraph2 = new Scatter('#graph_container', d, graph2Filters, margin, w, h, "scatter2", colour);
    appendPath(scatterGraph2, line_points);
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
    w = w*2;
    console.log("Removing graph");
    //Remove second set of graphs
    d3.select('#scatter2').remove();
    d3.select('#barChart2').remove();

    //Update first set of graphs
    scatterGraph1.update(w, h);
    updateTrendline(scatterGraph1);
    barChart1.update(w, h/2);

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
  w = w*2;
  data1 = scatterGraph1.getData();
  data2 = scatterGraph2.getData();
  d3.select('#scatter1').remove();
  d3.select('#scatter2').remove();
  var xmin1 = d3.min(data1, function(d) { return d.heart_rate; });
  var xmin2 = d3.min(data2, function(d) { return d.heart_rate; });
  var xmax1 = d3.max(data1, function(d) { return d.heart_rate; });
  var xmax2 = d3.max(data2, function(d) { return d.heart_rate; });
  var ymin1 = d3.min(data1, function(d) { return d.average_pace; })
  var ymin2 = d3.min(data2, function(d) { return d.average_pace; });
  var ymax1 = d3.max(data1, function(d) { return d.average_pace; });
  var ymax2 = d3.max(data2, function(d) { return d.average_pace; });
  console.log(Math.min(xmin1, xmin2));
  console.log(Math.max(xmax1, xmax2));
  var merge_x = d3.scaleLinear()
    .domain([Math.min(xmin1, xmin2), Math.max(xmax1, xmax2)])
    .range([0, w]);
  var merge_y = d3.scaleLinear()
    .domain([Math.min(ymin1, ymin2), Math.max(ymax1, ymax2)])
    .range([h, 0]);
  var scatter3 = d3.select('#graph_container').append('svg')
    .attr("id", 'scatter3')
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom)
      .append('g').attr("transform","translate(" + margin.left + "," + margin.top + ")");

  var merge_xAxisCall = d3.axisBottom(merge_x)

  var merge_xAxis = scatter3.append("g")
      .attr("transform", "translate(0," + h + ")")
      .call(merge_xAxisCall);

  var merge_yAxisCall = d3.axisLeft(merge_y)
    .tickFormat(function(d) {
      var seconds = Math.round((d % 1) * 60);
      if (seconds < 10) {
        seconds = "0" + seconds;
      }
      var minutes = Math.floor(d - (d % 1));
      return (minutes + ":" + seconds);
    })

  var merge_yAxis = scatter3.append("g")
      .call(merge_yAxisCall)

  var circles = scatter3.selectAll("circles");

  circles.data(data1).enter()
    .append("a")
      .attr("xlink:href", function(d) {return "https://www.strava.com/activities/" + d.id})
      .append("circle")
        .attr("cx", (d => merge_x(d.heart_rate)))
        .attr("cy", (d => merge_y(d.average_pace)))
        .attr("r", "10")
        .attr("fill", "#ff471a")
        .style("opacity", 0.5)
      .on('mouseover', function(d) {
        d3.select(this)
          .transition()
          .attr("fill", "#000000")
          //.attr("r", 9)
        var seconds = Math.round((d.average_pace % 1) * 60);
        if (seconds < 10) {
          seconds = "0" + seconds;
        }
        var minutes = Math.floor(d.average_pace - (d.average_pace % 1));
        //var pace = (d.average_pace - (d.average_pace % 1)) + ":" + d.average_pace%1.toFixed(2);
        var html  = "<span style='color:" + 'blue' + ";'>Run ID: " + d.id + "<br/></span> " +
                    "Distance: <b> " + d.distance + "m </b><br/>" +
                    "Average Heart Rate: <b>" + d.heart_rate + " bpm</b>" +
                    "<br/> Average Pace: <b/>" + minutes + ":" + seconds + "/km</b>" +
                    "<br/> Date of Run: <b/>" + d.day + "/" + d.month + "/" + d.year + "</b>";

        tooltip.html(html)
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
          .transition()
            .duration(200) // ms
            .style("opacity", .9) // started as 0!
        }
      )
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .attr("fill", "#ff471a")
        tooltip.transition()
            .duration(300) // ms
            .style("opacity", 0); // don't care about position!
      });

  circles.data(data2).enter()
    .append("a")
      .attr("xlink:href", function(d) {return "https://www.strava.com/activities/" + d.id})
      .append("circle")
        .attr("cx", (d => merge_x(d.heart_rate)))
        .attr("cy", (d => merge_y(d.average_pace)))
        .attr("r", "10")
        .attr("fill", "#00ff00")
        .style("opacity", 0.5)
      .on('mouseover', function(d) {
        d3.select(this)
          .transition()
          .attr("fill", "#000000")
          //.attr("r", 9)
        var seconds = Math.round((d.average_pace % 1) * 60);
        if (seconds < 10) {
          seconds = "0" + seconds;
        }
        var minutes = Math.floor(d.average_pace - (d.average_pace % 1));
        //var pace = (d.average_pace - (d.average_pace % 1)) + ":" + d.average_pace%1.toFixed(2);
        var html  = "<span style='color:" + 'blue' + ";'>Run ID: " + d.id + "<br/></span> " +
                    "Distance: <b> " + d.distance + "m </b><br/>" +
                    "Average Heart Rate: <b>" + d.heart_rate + " bpm</b>" +
                    "<br/> Average Pace: <b/>" + minutes + ":" + seconds + "/km</b>" +
                    "<br/> Date of Run: <b/>" + d.day + "/" + d.month + "/" + d.year + "</b>";

        tooltip.html(html)
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
          .transition()
            .duration(200) // ms
            .style("opacity", .9) // started as 0!
        }
      )
      .on('mouseout', function(d) {
        d3.select(this) .transition()
          .attr("fill", "#00ff00")
        tooltip.transition()
            .duration(300) // ms
            .style("opacity", 0); // don't care about position!
      });
}
