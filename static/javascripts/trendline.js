var lineFunction = d3.line()
  .x(function(d) {
    return x(d.x);
  })
  .y(function(d) {
    return y(d.y);
  })
  .curve(d3.curveMonotoneX)

function appendPath(svg) {
  svg.append("path")
   .attr("d", lineFunction(reg));
 }
