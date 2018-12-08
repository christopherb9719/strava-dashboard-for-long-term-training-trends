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
        .text("Average Pace (/km)");

    return svg;
}


//Tooltip code taken from: http://bl.ocks.org/williaster/af5b855651ffe29bdca1
function plotPoints(svg, data) {
  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("a")
      .attr("xlink:href", function(d) {return "https://www.strava.com/activities/" + d.id})
      .append("circle")
        .attr("cx", function(d) {return x(d.heart_rate);})
        .attr("cy", function(d) {return y(d.average_pace);})
        .attr("r", function(d) { return getRadius(d);})
        .attr("fill", "#ff471a")
        .style("opacity", 0.5)
      .on('mouseover', function(d) {
        d3.select(this)
          .transition()
          .attr("fill", "#000000")
          .attr("r", 9)
        var html  = "<span style='color:" + 'blue' + ";'>Run ID: " + d.id + "<br/></span> " +
                    "Distance: <b> " + d.distance + "m </b><br/>" +
                    "Average Heart Rate: <b>" + d.heart_rate + " bpm</b>" +
                    "<br/> Average Pace: <b/>" + d.average_pace.toFixed(3) + "/km</b>" +
                    "<br/> Date of Run: <b/>" + d.day + "/" + d.month + "/" + d.year + "</b>";

        tooltip.html(html)
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
          .transition()
            .duration(200) // ms
            .style("opacity", .7) // started as 0!
        }
      )
      .on('mouseout', function(d) {
        d3.select(this)
          .transition()
          .attr("fill", "#ff471a")
          .attr("r", getRadius(d))
        tooltip.transition()
            .duration(300) // ms
            .style("opacity", 0); // don't care about position!
      });
}

function getRadius(d) {
  var max = max_date.getTime()/1000,
      min = min_date.getTime()/1000,
      date = new Date(d.year, d.month, d.day, 0, 0, 0),
      size = (max-min)/(max-(date.getTime()/1000));
  if (size == 'infinity') {
    return 20;
  }
  else {
    return Math.min(20, size);
  }
}
