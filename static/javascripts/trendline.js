var lineFunction = d3.line()
  .x(function(d) {
    console.log(x(d.x));
    return x(d.x);
  })
  .y(function(d) {
    return y(d.y);
  })

function appendPath(svg, pts, height, width) {
  console.log("Appending path");
  console.log(height);
  console.log(width);
  svg.append("path")
    .attr("class", "line")
    .attr("id", function(d) {return "trendline";})
    .attr("d", lineFunction(pts));
 }
