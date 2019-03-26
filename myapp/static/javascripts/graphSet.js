class graphSet {
  constructor(margin, width, height, div) {
    this.height = height;
    this.width = width;
    this.margin = margin;
    this.div = document.getElementById(div);
  }

  buildGraphs(filtersObject, data) {
    ////// BUILD CONTAINERS //////
    var container = document.createElement('div');
    container.className = 'row';

    var scatterDiv = document.createElement('div');
    scatterDiv.className = 'col-8';
    container.appendChild(scatterDiv);

    var barDiv = document.createElement('div');
    barDiv.className = 'col-4';
    container.appendChild(barDiv);

    ////// BUILD GRAPHS //////
    this.effortChart = new EffortBarChart(this.div.appendChild(document.createElement('div')), this.margin, 0.8*this.width, this.height/2);
    this.effortChart.draw(filtersObject, data);
    this.topBar = new HeartRateBarChart(this.div.appendChild(document.createElement('div')), this.margin, ((0.6)*this.width), this.height/4);
    this.topBar.draw(filtersObject, data);
    this.div.appendChild(container);
    this.scatter = new Scatter(scatterDiv, this.margin, ((0.6)*this.width), ((3/4)*this.height));
    this.scatter.draw(filtersObject);
    this.sideBar = new PaceBarChart(barDiv, this.margin, ((0.1)*this.width), ((0.75)*this.height));
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

  updateAllScales(filteredData) {
    this.sideBar.update(filteredData);
    this.topBar.update(filteredData);
    this.effortChart.update(filteredData);
  }

  updateScales(filteredData) {
    this.effortChart.update(filteredData);
  }

  updatePlots(filteredData, filters, colour, id) {
    this.topBar.plotBars(filteredData, id, colour);
    plotScatterPoints(this.scatter.getSvg(), filteredData, colour, this.scatter.getX(), this.scatter.getY(), filters, id);
    this.effortChart.plotBars(filteredData, id, colour);
    this.sideBar.plotBars(filteredData, id, colour);
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
