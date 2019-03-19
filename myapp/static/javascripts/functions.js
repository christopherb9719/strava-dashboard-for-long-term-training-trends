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

function refreshTrendLines(dataObjects) {
  for (index in dataObjects) {
    dataObject = dataObjects[index];
    updateTrendline(dataObject.getFilteredData(), dataObject.getGraphSet().getScatter(), "line_primary", dataObject.getId(), dataObject.getColour());
  }
}

function logout() {
    location.href = $SCRIPT_ROOT + "/logout";
};

function showDropdown(id) {
  document.getElementById(id).classList.toggle("show");
}

function buildTimeString(hours, minutes) {
  var time = ""
  if (hours < 10) {
    time = time + "0" + hours;
  }
  else {
    time = time + hours;
  }
  if (minutes < 10) {
    time = time + ":0" + minutes;
  }
  else {
    time = time + ":" + minutes;
  }
  return time;
}
