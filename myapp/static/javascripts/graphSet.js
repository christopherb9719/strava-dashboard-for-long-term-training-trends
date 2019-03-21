class graphSet {
  constructor(margin, width, height, div) {
    this.height = height;
    this.width = width;
    this.margin = margin;
    this.div = document.getElementById(div);
  }

  buildGraphs(filtersObject, data) {
    var container = document.createElement('div');
    container.className = 'row';

    var scatterDiv = document.createElement('div');
    scatterDiv.className = 'col-8';

    var barDiv = document.createElement('div');
    barDiv.className = 'col-4';

    this.effortChart = new PositiveAndNegativeBarChart(this.div.appendChild(document.createElement('div')), this.margin, 0.8*this.width, this.height/2);
    this.effortChart.draw(filtersObject, data);
    this.topBar = new StandardBarChart(this.div.appendChild(document.createElement('div')), this.margin, ((0.6)*this.width), this.height/4, "heart_rate", "", "x");
    this.topBar.draw(filtersObject, data);
    this.div.appendChild(container);
    this.scatter = new Scatter(container, this.margin, ((0.6)*this.width), ((3/4)*this.height));
    this.scatter.draw(filtersObject);
    this.sideBar = new StandardBarChart(container, this.margin, ((0.1)*this.width), ((0.75)*this.height), "average_pace", "decimal", "y");
    this.sideBar.draw(filtersObject, data);
  }

  rebuildGraphs(filtersObj, data) {
    d3.select(this.div).selectAll('div').remove();
    this.buildGraphs(filtersObj, data);
  }

  resize(new_width) {
    this.width = new_width;
    console.log(this.width);
    this.effortChart.resize(this.width);
    this.scatter.resize((3/4)*this.width);
    this.topBar.resize((3/4)*this.width);
    this.sideBar.resize((3/4)*this.height);
  }

  populateAllGraphs(filteredData, filters, colour) {
    this.updateScales(filteredData, filters);
    this.updatePlots(filteredData, filters, colour);
  }

  updateScales(data, filters) {
    this.scatter.update(filters);
    this.sideBar.update(filters.filterData(data), filters);
    this.topBar.update(filters.filterData(data), filters);
    this.effortChart.update(filters.filterData(data), filters);
  }

  updatePlots(filteredData, filters, colour, id) {
    if (colour == null) {
      var colour = "#ff471a";
    }
    plotScatterPoints(this.scatter.getSvg(), filteredData, colour, this.scatter.getX(), this.scatter.getY(), filters, id);
    plotBars(this.effortChart, filteredData, this.effortChart.getX(), this.effortChart.getY(), this.effortChart.getWidth(), colour, id);
    standardPlotBars(this.topBar, filteredData, this.topBar.getX(), this.topBar.getY(), colour, id);
    standardPlotBars(this.sideBar, filteredData, this.sideBar.getX(), this.sideBar.getY(), colour, id);
  }

  getScatter() {
    return this.scatter;
  }
}

function GetElementInsideContainer(containerID, childID) {
    var elm = document.getElementById(childID);
    var parent = elm ? elm.parentNode : {};
    return (parent.id && parent.id === containerID) ? elm : {};
}