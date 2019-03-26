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


////// CONSTRUCT THE JQUERY SLIDERS //////
function buildSliders(filterObject) {
  $(function() {
    $( "#slider" ).slider({
      range: true,
      min: new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000,
      max: new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000,
      values: [new Date(d3.min(dataset, function(d) {return d.year; }), 0, 1, 0, 0, 0).getTime()/1000, new Date(d3.max(dataset, function(d) {return d.year; }), 11, 31, 0, 0, 0).getTime()/1000],
      slide: function( event, ui ) {
        filterObject.setDates(ui.values[0] * 1000, ui.values[1] * 1000);
        updateGraphScales();

        min_date = new Date(ui.values[0]*1000);
        max_date = new Date(ui.values[1]*1000);
        $("#date" ).val(min_date.getDay()+1 + "/" + parseInt(min_date.getMonth()+1) + "/" + min_date.getFullYear() +
            " - " + parseInt(max_date.getDay()+1) + "/" + parseInt(max_date.getMonth()+1)+ "/" + max_date.getFullYear());
      }
    });
    d1 = new Date($( "#slider" ).slider( "values", 0 )*1000);
    d2 = new Date($( "#slider" ).slider( "values", 1 )*1000);
    $("#date" ).val(d1.getDay()+1 + "/" + parseInt(d1.getMonth()+1) + "/" + d1.getFullYear() +
        " - " + parseInt(d2.getDay()+1) + "/" + parseInt(d2.getMonth()+1)+ "/" + d2.getFullYear());
  });

  $(function() {
    $( "#timeSlider" ).slider({
      range: true,
      min: new Date(0, 0, 0, 0, 0, 0).getTime()/1000,
      max: new Date(0, 0, 0, 23, 59, 59).getTime()/1000,
      values: [new Date(0, 0, 0, 0, 0, 0).getTime()/1000, new Date(0, 0, 0, 23, 59, 59).getTime()/1000],
      slide: function( event, ui ) {
        min_time = new Date(ui.values[0]*1000);
        max_time = new Date(ui.values[1]*1000);
        filterObject.setTimes(ui.values[0] * 1000, ui.values[1] * 1000);
        updateGraphScales();

        $("#time" ).val(buildTimeString(min_time.getHours(), min_time.getMinutes()) +
            " - " + buildTimeString(max_time.getHours(), max_time.getMinutes()));
      }
    });
    t1 = new Date($( "#timeSlider" ).slider( "values", 0 )*1000);
    t2 = new Date($( "#timeSlider" ).slider( "values", 1 )*1000);
    $("#time" ).val(buildTimeString(t1.getHours(), t1.getMinutes()) +
        " - " + buildTimeString(t2.getHours(), t2.getMinutes()));

  });


  $(function() {
    $( "#distanceSlider" ).slider({
      range: true,
      min: d3.min(dataset, function(d) { return d.distance }),
      max: d3.max(dataset, function(d) { return d.distance }),
      values: [0, d3.max(dataset, function(d) { return d.distance })],
      slide: function( event, ui ) {
        filterObject.setDistances(ui.values[0], ui.values[1]);
        updateGraphScales();

        $("#distance" ).val($( "#distanceSlider" ).slider( "values", 0 ) + "m" +
            " - " + $( "#distanceSlider" ).slider( "values", 1 ) + "m");
      }
    })
    $("#distance" ).val($( "#distanceSlider" ).slider( "values", 0 ) + "m" +
        " - " + $( "#distanceSlider" ).slider( "values", 1 ) + "m");
  });

  $(function() {
    $( "#elevationSlider" ).slider({
      range: true,
      min: d3.min(dataset, function(d) { return d.total_elevation_gain }),
      max: d3.max(dataset, function(d) { return d.total_elevation_gain }),
      values: [0, d3.max(dataset, function(d) { return d.total_elevation_gain })],
      slide: function( event, ui ) {
        filterObject.setElevationGain(ui.values[0], ui.values[1]);
        updateGraphScales();

        $("#elevation" ).val($( "#elevationSlider" ).slider( "values", 0 ) + "m" +
            " - " + $( "#elevationSlider" ).slider( "values", 1 ) + "m");
      }
    })
    $("#elevation" ).val($( "#elevationSlider" ).slider( "values", 0 ) + "m" +
        " - " + $( "#elevationSlider" ).slider( "values", 1 ) + "m");
  });

  $(function() {
    $( "#heartrateSlider" ).slider({
      range: true,
      min: d3.min(dataset, function(d) { return d.heart_rate }),
      max: d3.max(dataset, function(d) { return d.heart_rate }),
      values: [0, d3.max(dataset, function(d) { return d.heart_rate })],
      slide: function( event, ui ) {
        filterObject.setHeartRates(ui.values[0], ui.values[1]);
        updateGraphScales();

        $("#heartrate" ).val($( "#heartrateSlider" ).slider( "values", 0 ) + "bpm" +
            " - " + $( "#heartrateSlider" ).slider( "values", 1 ) + "bpm");
      }
    });
    $("#heartrate" ).val($( "#heartrateSlider" ).slider( "values", 0 ) + "bpm" +
        " - " + $( "#heartrateSlider" ).slider( "values", 1 ) + "bpm");
  });

}
