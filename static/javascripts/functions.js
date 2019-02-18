function updateTrendline(filtered_data, graph, line_class, id, colour) {
  $.ajax({
    url: $SCRIPT_ROOT + "/_gaussian_calculation",
    data: JSON.stringify(filtered_data),
    contentType: 'application/json;charset=UTF-8',
    type: 'POST',
    success: function(response){
      console.log("Updating trend line");
      graph.getSvg().selectAll("[id='#regression" + id + "']").remove();
      appendPath(graph, response, line_class, id, d3.rgb(colour).darker());
    },
    error: function(error){
      console.log(error);
    }
  });
}
