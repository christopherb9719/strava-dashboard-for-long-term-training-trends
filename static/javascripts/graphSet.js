class graphSet {
  constructor(margin, width, height, div) {
    this.height = height;
    this.width = width;
    this.margin = margin;
    this.div = document.getElementById(div);
  }

  buildGraphs(data, filteredData, colour) {
    var container = document.createElement('div')
    container.className = 'box2';
    this.effortChart = new PositiveAndNegativeBarChart(this.div.appendChild(document.createElement('div')), data, filteredData, this.margin, this.width, this.height/2, colour);
    this.topBar = new StandardBarChart(this.div.appendChild(document.createElement('div')), data, filteredData, this.margin, ((3/4)*this.width), this.height/4, colour, "heart_rate");
    this.scatter = new Scatter(this.div.appendChild(container), filteredData, this.margin, ((3/4)*this.width), ((3/4)*this.height), colour, this.filters);
    this.sideBar = new StandardBarChart(this.div.appendChild(container), data, filteredData, this.margin, ((3/4)*this.height), ((1/4)*this.height), colour, "average_pace", "decimal");
    this.sideBar.getSvg().attr("transform","rotate(270, 15, 0)");
  }

  resize(new_width) {
    this.width = new_width;
    console.log(this.width);
    this.effortChart.resize(this.width);
    this.scatter.resize((3/4)*this.width);
    this.topBar.resize((3/4)*this.width);
    this.sideBar.resize((3/4)*this.height);
  }

  update(filters) {
    var filteredData = filters.getFilteredData();
    var id = filters.getId();
    this.scatter.update(filteredData, id);
    this.sideBar.update(filteredData, id);
    this.topBar.update(filteredData, id);
    this.effortChart.update(filteredData, id);
    this.populateAllGraphs(filters, filters.getColour(), id)
  }

  populateAllGraphs(filters, colour, id) {
    var filtered = filters.getFilteredData()
    plotScatterPoints(this.scatter.getSvg(), filtered, filters.getColour(), this.scatter.getX(), this.scatter.getY(), filters, filters.getId());
    standardPlotBars(this.topBar, filtered, this.topBar.getY(), this.topBar.getX(), filters.getColour(), id);
    standardPlotBars(this.sideBar, filtered, this.sideBar.getY(), this.sideBar.getX(), filters.getColour(), id);
    plotBars(this.effortChart, filtered, this.effortChart.getY(), this.effortChart.getX(), this.effortChart.getWidth(), filters.getColour(), id);
  }

  getFilters() {
    return this.filters;
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
