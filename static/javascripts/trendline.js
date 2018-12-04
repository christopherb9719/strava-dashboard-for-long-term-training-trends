var lineFunction = d3.line()
  .x(function(d) {
    return x(d.x);
  })
  .y(function(d) {
    return y(d.y);
  })

function appendPath(svg) {
  svg.append("path")
    .attr("class", "line")
    .attr("id", function(d) {return "trendline";})
    .attr("d", lineFunction(reg));
 }
