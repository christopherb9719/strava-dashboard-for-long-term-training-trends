function appendPath(graph, pts, x, y) {
  var lineFunction = d3.line()
    .x(function(d) {
      return x(d.x);
    })
    .y(function(d) {
      return y(d.y);
    })


  graph.append("path")
    .attr("class", "line")
    .attr("id", function(d) {return "trendline";})
    .attr("d", lineFunction(pts));
 }
