function appendPath(graph, pts, line_class, id, colour) {
  var lineFunction = d3.line()
    .x(function(d) {
      return graph.getX()(d.x);
    })
    .y(function(d) {
      return graph.getY()(d.y);
    })


  graph.getSvg().append("path")
    .attr("class", "line")
    .attr("id", "#regression" + id)
    .attr("stroke", colour)
    .attr("d", lineFunction(pts))
    .on("click", function() {
      d3.selectAll("[id='#threshold" + id + "']").remove();
      var pace = graph.getY().invert(d3.mouse(this)[1]);
      var seconds = Math.round((pace % 1) * 60);
      if (seconds < 10) {
        seconds = "0" + seconds;
      }
      var minutes = Math.floor(pace - (pace % 1));
      var threshold = minutes + ":" + seconds;
      var paceObject = document.createElement("li");
      paceObject.innerHTML = id + ": " + threshold + "mins/km"
      paceObject.className = "list-group-item";
      paceObject.id = "#threshold" + id;
      document.getElementById('ThresholdPace').appendChild(paceObject);
      graph.getSvg().append("a").append("circle")
        .attr("cx", d3.mouse(this)[0])
        .attr("cy", d3.mouse(this)[1])
        .attr("id", "#threshold" + id)
        .attr("r", "4")
        .attr("fill", "black")
    })
 }
