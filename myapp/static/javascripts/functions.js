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

function updateGraphScales(filtersObject) {
  if (document.getElementById("mergeGraphs").value == "true") {
    var max_y = 0;
    var indexOf_max_y = 0;
    for (index in dataObjects) {
      dataObject = dataObjects[index];
      var y = dataObject.graphSet.effortChart.buildBarValues(dataObject.getFilterObject().filterData(dataObject.getData()));
      console.log("dataObject" + index + ": " + d3.max(y, d => Math.abs(d)));
      if (d3.max(y, d => Math.abs(d)) > max_y) {
        max_y = d3.max(y, d => Math.abs(d));
        indexOf_max_y = index;
      }
    }
    console.log("Final max_y: " + max_y);
    console.log("Data Object used: dataObject" + indexOf_max_y);
    graphSet1.updateScales(dataObjects[indexOf_max_y].getFilterObject().filterData(dataObjects[indexOf_max_y].getData()));
    for (index in dataObjects) {
      dataObjects[index].updateGraphs();
    }
  }
  else {
    for (index in dataObjects) {
      var dataObject = dataObjects[index];
      dataObject.getGraphSet().updateScales(dataObject.getFilterObject().filterData(dataObject.getData()));
      dataObject.updateGraphs();
    }
  }
}
