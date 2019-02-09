function appendPath(graph, pts, line_class, id) {
  var lineFunction = d3.line()
    .x(function(d) {
      return graph.getX()(d.x);
    })
    .y(function(d) {
      return graph.getY()(d.y);
    })


  graph.getSvg().append("path")
    .attr("class", line_class)
    .attr("id", "#regression" + id)
    .attr("d", lineFunction(pts))
    .on("click", function(d) {
      var x = graph.getX()
      console.log(x(d3.event.pageX));
      graph.getSvg().append("a").append("circle")
        .attr("x", graph.getX()(d3.event.pageX))
        .attr("y", graph.getY()(d3.event.pageY))
        .attr("r", "4")
        .attr("fill", "black")
    })
 }
