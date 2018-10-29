console.log(dataset);

var margin = {top: 20, right: 20, bottom: 50, left: 70},
    w = 1200 - margin.left - margin.right,
    h = 600 - margin.top - margin.bottom;

var x = d3.scaleLinear().range([0, w]);
var y = d3.scaleLinear().range([h, 0]);

var xAxis = x.domain([d3.min(dataset, function(d) {return d.heart_rate; }) - 10, d3.max(dataset, function(d) { return d.heart_rate; })+10]);
var yAxis = y.domain([d3.max(dataset, function(d) { return d.average_speed; })+0.5, d3.min(dataset, function(d) {return d.average_speed; }) - 0.5]);

var svgContainer = d3.select('#graph_container').append("g");                                                                   

//Create SVG variable to build the graph into
var svg = svgContainer.append('svg')
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

var dataArray = getDataArray(dataset);
console.log(dataArray)
var lg = calcLinear(dataArray, "x", "y", d3.min(dataset, function(d){ return d.heart_rate}), d3.min(dataset, function(d){ return d.average_speed}));
console.log("Scaled values:")
console.log("(" + x(lg.ptA.x) + ", " + y(lg.ptA.y) + ")");
console.log("(" + x(lg.ptB.x) + ", " + y(lg.ptB.y) + ")");

svg.selectAll("line")
    .data(lg)
    .enter()
    .append("line")
        .attr("class", "regression")
        .attr("stroke", "black")
        .attr("x1", x(lg.ptA.x))
        .attr("y1", y(lg.ptA.y))
        .attr("x2", x(lg.ptB.x))
        .attr("y2", y(lg.ptB.y));

//Append data points to the scatterplot
svg.selectAll("circle")
    .data(dataset)
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


function calcLinear(data, x, y, minX, minY){
    /////////
    //SLOPE//
    /////////

    console.log("minX: " + minX)
    console.log("minY: " + minY)
    // Let n = the number of data points
    var n = data.length;
    console.log("n: " + n)

    // Get just the points
    var pts = [];
    data.forEach(function(d, i) {
        var obj = {};
        obj.x = d[0];
        obj.y = d[1];
        obj.mult = obj.x*obj.y;
        pts.push(obj);
    });

    // Let a equal n times the summation of all x-values multiplied by their corresponding y-values
    // Let b equal the sum of all x-values times the sum of all y-values
    // Let c equal n times the sum of all squared x-values
    // Let d equal the squared sum of all x-values
    var sum = 0;
    var xSum = 0;
    var ySum = 0;
    var sumSq = 0;
    pts.forEach(function(pt){
        sum = sum + pt.mult;
        xSum = xSum + pt.x;
        ySum = ySum + pt.y;
        sumSq = sumSq + (pt.x * pt.x);
    });
    var a = sum * n;
    var b = xSum * ySum;
    var c = sumSq * n;
    var d = xSum * xSum;

    // Plug the values that you calculated for a, b, c, and d into the following equation to calculate the slope
    // slope = m = (a - b) / (c - d)
    var m = (a - b) / (c - d);
    /////////////
    //INTERCEPT//
    /////////////

    // Let e equal the sum of all y-values
    var e = ySum;

    // Let f equal the slope times the sum of all x-values
    var f = m * xSum;

    // Plug the values you have calculated for e and f into the following equation for the y-intercept
    // y-intercept = b = (e - f) / n
    var b = (e - f) / n;

    console.log("Returned Values:")
    console.log("( " + minX + ", " + Math.round(m*minX + b) + " )")
    console.log("(" + Math.round((minY-b)/m) + ", " + minY + " )")
        
    // return an object of two points
    // each point is an object with an x and y coordinate
    return {
        ptA : {
        x: minX,
        y: m*minX + b
        },
        ptB : {
        y: (minY-b)/m,
        x: minY
        }
    }
}

function getDataArray(data) {
    dataArray = []
    data.forEach(function(d, i) {
        coords = []
        coords.push(d.heart_rate)
        coords.push(d.average_speed)
        dataArray.push(coords)
    })
    return dataArray
}