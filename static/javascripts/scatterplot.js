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
        .datum(reg) // 10. Binds data to the line
        .attr("class", "line") // Assign a class for styling
        .attr("d", lineFunction); // 11. Calls the line generator

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

    return svg;
}

function plotPoints(svg, data) {
  svg.selectAll("circle")
    .data(data)
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
