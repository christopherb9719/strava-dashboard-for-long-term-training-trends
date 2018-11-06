console.log(dataset);

var margin = {top: 20, right: 20, bottom: 50, left: 70},
w = 1200 - margin.left - margin.right,
h = 600 - margin.top - margin.bottom;

var x = d3.scaleLinear().range([0, w]);
var y = d3.scaleLinear().range([h, 0]);

var xAxis = x.domain([d3.min(dataset, function(d) {return d.heart_rate; }) - 5, d3.max(dataset, function(d) { return d.heart_rate; })+5]);
var yAxis = y.domain([d3.max(dataset, function(d) { return d.average_speed; })+0.2, d3.min(dataset, function(d) {return d.average_speed; }) - 0.2]);
        
var svgContainer = d3.select('#graph_container').append("g");   
var svg;
var barchart;
//var scatterPlot = dc.scatterPlot('#graph_container');
//var histPlot = dc.barChart('#hist_chart')

buildScatter()
//buildHistogram()
//buildScatterPlot();



//d3.selectAll(".myCheckbox").on("change",update);
update();

d3.select(".filter-by-min").on("input", function() {
    update();
  });
d3.select(".filter-by-max").on("input", function() {
    update();
  });
d3.select(".filter-by-elevation").on("input", function() {
    update();
  });

function update() {
    min_distance = d3.select(".filter-by-min").property("value");
    max_distance = d3.select(".filter-by-max").property("value");
    max_elevation_gain = d3.select(".filter-by-elevation").property("value");
    console.log("Min Distance: " + min_distance);
    console.log("Max Distance: " + max_distance);
    newData = dataset;

    if (min_distance > 0 || max_distance > 0) {
        newData = dataset.filter(function(d,i) {
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
    if (max_elevation_gain > 0) {
        //filter by elevation
        newData = newData.filter(function(d, i) {
            if (max_elevation_gain > 0) {
                if (d.total_elevation_gain <= max_elevation_gain) {
                    return d;
                }
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
                .attr("cy", function(d) {return yAxis(d.average_speed);})
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
}

function buildScatter() {                                                       
    //Create SVG variable to build the graph into
    svg = svgContainer.append('svg')
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .append("g")
            .attr("transform", 
                "translate(" + margin.left + "," + margin.top + ")");
                
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
        .text("Average Speed (m/s)");  
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









function buildScatterPlot() {
    var ndx = crossfilter(dataset);
    var scatterPlotDim = ndx.dimension( function(d) {
        return [+d.heart_rate, +d.average_speed, d.id];
    });
    var histogramDim = ndx.dimension( function(d) {
        return +(Math.ceil(d.distance/1000)*1000);
    });
    var scatterPlotGroup = scatterPlotDim.group();
    var histogramGroup = histogramDim.group().reduceCount();

    scatterPlot
        .width(w + margin.left + margin.right)
        .height(h + margin.top + margin.bottom)
        .x(xAxis)
        .y(yAxis)
        .xAxisLabel("Average Heart Rate (bpm)")
        .yAxisLabel("Average Speed (m/s)")
        .clipPadding(10)
        .dimension(scatterPlotDim)
        .excludedColor('#ddd')
        .group(scatterPlotGroup)
        .brushOn(false)
        .symbolSize([7])
        .on('renderlet', function(chart) {
            console.log("Renderlet entered");
            var dots = chart.selectAll("path.symbol");
            console.log(dots);
            chart.selectAll('path.symbol')
                .on('mouseover', function(d) {
                    console.log("Renderlet mouseover detected");
                    chart.symbolSize([10])
                })
                .on('click', function(d) {
                    console.log("id: " + d[1]);
                })
        });

    histPlot
        .width(w + margin.left + margin.right)
        .dimension(histogramDim)
        .group(histogramGroup)
        .x(d3.scaleLinear().domain([0, d3.max(dataset, function(d) { return +(Math.ceil(d.distance/1000)*1000)})]))
        .controlsUseVisibility(false)
        .elasticY(true)
        .xUnits(function() {return 100})
        .outerPadding([0.05]);

    dc.renderAll();
}
