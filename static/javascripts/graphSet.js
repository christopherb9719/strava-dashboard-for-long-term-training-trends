class graphSet {
  constructor(data, line_coords, margin, width, height, div, id, colour) {
    var parentDiv = document.getElementById(div);
    var container = document.createElement('div')
    container.className = 'box2';
    this.filters = new Filters(data);
    this.effortChart = new PositiveAndNegativeBarChart(parentDiv.appendChild(document.createElement('div')), data, this.filters, margin, width, height/2, "effortChart" + id, colour);
    this.topBar = new StandardBarChart(parentDiv.appendChild(document.createElement('div')), data, this.filters, margin, ((3/4)*width), height/4, "scatterBarX" + id, colour, "heart_rate");
    this.scatter = new Scatter(parentDiv.appendChild(container), data, this.filters, margin, ((3/4)*width), ((3/4)*height), "scatter" + id, colour);
    this.sideBar = new StandardBarChart(parentDiv.appendChild(container), data, this.filters, margin, ((3/4)*height), ((1/4)*height), "scatterBarY" + id, colour, "average_pace", "decimal");
    appendPath(this.scatter, line_coords, "line_primary");
    plotScatterPoints(this.scatter.getSvg(), data, colour, this.scatter.getX(), this.scatter.getY(), this.filters);
    this.sideBar.getSvg().attr("transform","rotate(270, 15, 0)");
    this.height = height;
    this.width = width;
    this.data = data;
  }

  resize(new_width) {
    this.width = new_width;
    console.log(this.width);
    this.effortChart.update(this.width, (1/2)*this.height);
    this.scatter.update((3/4)*this.width, (3/4)*this.height);
    this.topBar.update((3/4)*this.width, (1/4)*this.height);
    this.sideBar.update((3/4)*this.height, (1/4)*this.height);
    updateTrendline(this.scatter.getFilteredData(), this.scatter, "line_primary");
  }

  update() {
    this.scatter.update((3/4)*this.width, (3/4)*this.height);
    this.sideBar.update((3/4)*this.height, (1/4)*this.height);
    this.topBar.update((3/4)*this.width, (1/4)*this.width);
    this.effortChart.update(this.width, this.height/2);
  }

  getFilters() {
    return this.filters;
  }


  getFilteredData() {
    var filtered = this.data.filter(d => ((d.distance <= this.filters.getMaxDistance() && d.distance >= this.filters.getMinDistance())
      && (d.total_elevation_gain <= this.filters.getMaxElevationGain() && d.total_elevation_gain >= this.filters.getMinElevationGain())
      && (d.heart_rate <= this.filters.getMaxHeartRate() && d.heart_rate >= this.filters.getMinHeartRate())
      && this.dataInDate(d)
      && this.dataInTime(d)
      && this.containsTags(d)
    ));

    return filtered
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
