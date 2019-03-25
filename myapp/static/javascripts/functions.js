function updateTrendline(filtered_data, graph, line_class, id, colour) {
  $.ajax({
    url: $SCRIPT_ROOT + "/_gaussian_calculation",
    data: JSON.stringify(filtered_data),
    contentType: 'application/json;charset=UTF-8',
    type: 'POST',
    success: function(response){
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
    d3.selectAll("[id='#threshold" + dataObject.id + "']").remove();
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

function updateGraphScales() {
  if (document.getElementById("mergeGraphs").value == "true") {
    var max_y = 0;
    var indexOf_max_y = 0;
    for (index in dataObjects) {
      dataObject = dataObjects[index];
      var y = dataObject.graphSet.effortChart.buildBarValues(dataObject.getFilterObject().filterData(dataObject.getData()));
      if (d3.max(y, d => Math.abs(d)) > max_y) {
        max_y = d3.max(y, d => Math.abs(d));
        indexOf_max_y = index;
      }
    }
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

function updateGraphsM() {
  var max_y = 0;
  var indexOf_max_y = 0;
  for (index in dataObjects) {
    dataObject = dataObjects[index];
    var y = graphSet1.effortChart.buildBarValues(dataObject.getFilterObject().filterData(dataObject.getData()));
    if (d3.max(y, d => Math.abs(d)) > max_y) {
      max_y = d3.max(y, d => Math.abs(d));
      indexOf_max_y = index;
    }
  }
  graphSet1.updateScales(dataObjects[indexOf_max_y].getFilterObject().filterData(dataObjects[indexOf_max_y].getData()));
  for (index in dataObjects) {
    dataObjects[index].updateGraphs();
  }
}

function paceSearch(max_dist, min_dist) {
  document.getElementById("getPace").value = null;
  document.getElementById("distancePace").innerHTML = "";
  for (index in dataObjects) {
    var dataObject = dataObjects[index];
    acceptable_data = dataObject.getData().filter(d => (d.distance <= max_dist && d.distance >= min_dist));
    dataObject.getFilterObject().setDistances(min_dist, max_dist);
    dataObject.getGraphSet().updateScales(dataObject.getFilterObject().filterData(dataObject.getData()));
    dataObject.updateGraphs();
    var filtered = dataObject.getFilteredData();
    var needed_pace = d3.mean(filtered, d => d.average_pace);
    var paceObject = document.createElement("li");
    paceObject.innerHTML = dataObject.id + ": " + needed_pace.toFixed(2) + "mins/km"
    paceObject.className = "list-group-item";
    paceObject.id = "#pace"+dataObject.id
    document.getElementById('distancePace').appendChild(paceObject);
  }
}

function updateSliderValues(slider, min, max) {
  $('#'+slider).slider( "values", 0, min );
  $('#'+slider).slider( "values", 1, max );
}
