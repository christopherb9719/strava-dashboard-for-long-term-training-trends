console.log(dataset.activities);

var margin = {top: 20, right: 20, bottom: 50, left: 70},
    w = 1200 - margin.left - margin.right,
    h = 600 - margin.top - margin.bottom;

var xScale = d3.scaleLinear()
    .range([0, w])
    .domain([0, 120])
    .nice();
    
var yScale = d3.scaleLinear()
    .range([h, 0])
    .domain([0, 12])
    .nice();

var xAxis = d3.scaleLinear().range([0, w]);
var yAxis = d3.scaleLinear().range([h, 0]);

xAxis.domain([0, d3.max(dataset.activities, function(d) { return d.heart_rate; })+10]);
yAxis.domain([0, d3.max(dataset.activities, function(d) { return d.average_speed; })+5]);

var svgContainer = d3.select('#graph_container').append("g");                                  // NEW                                    // NEW

//Create SVG variable to build the graph into
var svg = svgContainer.append('svg')
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")"); 

var tooltip = svgContainer.append('div')                                                // NEW
    .attr('class', 'tooltip')
    .style("opacity", 0);  

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


//Append data points to the scatterplot
svg.selectAll("circle")
    .data(dataset.activities)
	.enter()
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

