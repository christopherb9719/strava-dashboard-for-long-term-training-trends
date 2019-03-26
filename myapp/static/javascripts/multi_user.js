var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
var parseDate = d3.timeParse("%m/%d/%y");

var bb = document.querySelector('#graphSet1Container')
                    .getBoundingClientRect();

var width = bb.right - bb.left;
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
$('#multi_user').addClass( 'active' )

var margin = {top: 20, right: 20, bottom: 50, left: 70},
  w = width - margin.left - margin.right,
  h = 500 - margin.top - margin.bottom;

var colours = d3.scaleOrdinal(d3.schemeCategory10);
var dataObjects = [];
var id = 1;
var clicked = false;

//Build Graphs
var filterObject = new Filters(dataset);
var graphSet1 = new graphSet(margin, w, h, "graphSet1Container");
var dataObject = new DataObject(dataset, String(id), colours(dataObjects.length), graphSet1, filterObject, "you");
graphSet1.buildGraphs(dataObject.getFilterObject(), dataObject.getData());
graphSet1.updatePlots(dataObject.getFilteredData(), dataObject.getFilterObject(), dataObject.getColour(), dataObject.getId());
updateTrendline(dataObject.getFilteredData(), dataObject.getGraphSet().getScatter(), "line_primary", dataObject.getId(), dataObject.getColour());
dataObjects.push(dataObject);

buildSliders(filterObject);

////// FUNCTIONS //////

function updateGraphScales() {
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

function getAllData() {
  var allData = [];
  for (var index in dataObjects) {
    allData.push(dataObjects[index].getData());
  }
  allData = [].concat.apply([], allData);
  return allData;
}

function addNewUserData(user, d, line_points, colour) {
    //Update 1st set of graphs
    id = id + 1;
    var dataObject = new DataObject(d, String(id), colours(dataObjects.length), graphSet1, filterObject, user);
    dataObjects.push(dataObject);

    var allData = getAllData();

    filterObject.initialiseFilters(allData);
    allFilteredData = filterObject.filterData(allData);

    graphSet1.rebuildGraphs(filterObject, allFilteredData);
    updateGraphScales();
    for (var index in dataObjects) {
      updateTrendline(dataObjects[index].getFilteredData(), dataObjects[index].getGraphSet().getScatter(), "line_secondary", dataObjects[index].getId(), dataObjects[index].getColour());
    }

    var userObject = document.createElement("li");
    userObject.innerHTML = user;
    userObject.className = "list-group-item";
    userObject.value = String(id);
    userObject.title = "Click to remove";
    userObject.onclick = function(d) {
      removeUsersData(userObject.value);
      console.log(d3.select(userObject));
      d3.select(userObject).remove();
      updateGraphScales();
    };
    document.getElementById('usersList').appendChild(userObject);
}


function filterTags(tag) {
  if (/\S/.test(tag)) { //Checks tag isn't just whitespace
    filterObject.addTag(tag);
    document.getElementById('tags').value = null;
    var tagObject = document.createElement("li");
    tagObject.innerHTML = tag;
    tagObject.className = "list-group-item";
    tagObject.value = String(id);
    tagObject.title = "Click to remove";
    document.getElementById("tagsList").appendChild(tagObject);
    tagObject.onclick = function(d) {
      filterObject.removeTag(tagObject.innerHTML)
      d3.select(tagObject).remove();
      updateGraphScales();
    };
    updateGraphScales();
  }
}

function removeUsersData(id) {
  d3.selectAll("[id='#dataset" + id + "']").remove();
  d3.selectAll("[id='#regression" + id + "']").remove();
  d3.selectAll("[id='#threshold" + id + "']").remove();
  d3.selectAll("[id='#pace" + id + "']").remove();
  var index = dataObjects.indexOf(dataObjects.find(d => { return d.id == id }));
  dataObjects.splice(index, 1);
}

function getNeededPace(distance) {
  var min_dist = distance - (0.1*distance);
  var max_dist = parseInt(distance) + parseInt((0.1*distance));
  updateSliderValues('distanceSlider', min_dist, max_dist);
  $("#distance" ).val(min_dist + "m" + " - " + max_dist + "m");
  paceSearch(max_dist, min_dist);
}


////// AJAX FUNCTIONS //////
function findUserData() {
  $.ajax({
    url: '/find_users',
    data: document.getElementById("userSearch").value,
    contentType: 'text',
    type: 'POST',
    success: function(response) {
      d3.select("#myDropdown").selectAll("a").remove();
      JSON.parse(response).forEach(function(elem) {
        var option = document.createElement("a");
        option.text = elem.username;
        option.onclick = function() { return plotData(elem.username); }
        $("#myDropdown").append(option);
      })
    },
    error: function(error) {
      console.log(error);
    }
  })
}

function plotData(user) {
  showDropdown("myDropdown");
  d3.select("#myDropdown").selectAll("a").remove();
  document.getElementById('userSearch').value = null;
  $.ajax({
    url: '/get_user_data',
    data: user,
    contentType: 'text',
    type: 'POST',
    success: function(response) {
      var activities = response[0];
      var line_coords = response[1];
      addNewUserData(user, activities, line_coords, "#00e600");
      },
    error: function(error) {
      console.log(error);
    }
  })
}
