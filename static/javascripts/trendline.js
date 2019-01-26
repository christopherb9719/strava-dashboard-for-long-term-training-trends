function appendPath(graph, pts, line_class) {
  var lineFunction = d3.line()
    .x(function(d) {
      return graph.getX()(d.x);
    })
    .y(function(d) {
      return graph.getY()(d.y);
    })


  graph.getSvg().append("path")
    .attr("class", line_class)
    .attr("d", lineFunction(pts))
    .on("click", function(d) {
      console.log(graph.getX()(d3.event.pageX))
      graph.getSvg().append("a").append("circle")
        .attr("x", graph.getX()(d3.event.pageX))
        .attr("y", graph.getY()(d3.event.pageY))
        .attr("r", "4")
        .attr("fill", "black")
    })
 }
