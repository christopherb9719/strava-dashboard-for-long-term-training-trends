function appendPath(svg, pts) {
  var lineFunction = d3.line()
    .x(function(d) {
      return svg.getX()(d.x);
    })
    .y(function(d) {
      return svg.getY()(d.y);
    })

  svg.getPlot().append("path")
    .attr("class", "line")
    .attr("id", function(d) {return "trendline";})
    .attr("d", lineFunction(pts));
 }
