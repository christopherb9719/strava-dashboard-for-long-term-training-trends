class graphSet {
  constructor(margin, width, height, div) {
    this.height = height;
    this.width = width;
    this.margin = margin;
    this.div = document.getElementById(div);
  }

  buildGraphs(filtersObject, data) {
    var container = document.createElement('div')
    container.className = 'box2';
    this.effortChart = new PositiveAndNegativeBarChart(this.div.appendChild(document.createElement('div')), this.margin, this.width, this.height/2);
    this.effortChart.draw(filtersObject, data);
    this.topBar = new StandardBarChart(this.div.appendChild(document.createElement('div')), this.margin, ((3/4)*this.width), this.height/4, "heart_rate");
    this.topBar.draw(filtersObject, data);
    this.scatter = new Scatter(this.div.appendChild(container), this.margin, ((3/4)*this.width), ((3/4)*this.height));
    this.scatter.draw(filtersObject);
    this.sideBar = new StandardBarChart(this.div.appendChild(container), this.margin, ((3/4)*this.height), ((1/4)*this.height), "average_pace", "decimal");
    this.sideBar.draw(filtersObject, data);
    this.sideBar.getSvg().attr("transform","rotate(270, 15, 0)");
  }

  rebuildGraphs(filtersObj, data) {
    console.log(data);
    d3.select('#graphSet1Container').selectAll('div').remove();
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

  populateAllGraphs(filteredData, filters) {
    this.updateScales(filteredData, filters);
    this.updatePlots(filteredData, filters);
  }

  updateScales(data, filters) {
    this.scatter.update(filters);
    this.sideBar.update(data, filters);
    this.topBar.update(data, filters);
    this.effortChart.update(data, filters);
  }

  updatePlots(filteredData, filters) {
    var colour = "#ff471a";
    plotScatterPoints(this.scatter.getSvg(), filteredData, colour, this.scatter.getX(), this.scatter.getY(), filters);
    plotBars(this.effortChart, filteredData, this.effortChart.getX(), this.effortChart.getY(), this.effortChart.getWidth(), colour);
    standardPlotBars(this.topBar, filteredData, this.topBar.getX(), this.topBar.getY(), colour);
    standardPlotBars(this.sideBar, filteredData, this.sideBar.getX(), this.sideBar.getY(), colour);
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
