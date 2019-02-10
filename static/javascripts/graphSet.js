class graphSet {
  constructor(margin, width, height, div) {
    this.height = height;
    this.width = width;
    this.margin = margin;
    this.div = document.getElementById(div);
  }

  buildGraphs(filtersObject, data) {
    console.log(this.width);
    console.log("Scatter width: " + (3/4)*this.width);
    console.log("Side bar width: " + (1/4)*this.width);
    var container = document.createElement('div');
    container.className = 'box2';
    this.effortChart = new PositiveAndNegativeBarChart(this.div.appendChild(document.createElement('div')), this.margin, this.width, this.height/2);
    this.effortChart.draw(filtersObject, data);
    this.topBar = new StandardBarChart(this.div.appendChild(document.createElement('div')), this.margin, ((3/4)*this.width), this.height/4, "heart_rate", "", "x");
    this.topBar.draw(filtersObject, data);
    this.scatter = new Scatter(this.div.appendChild(container), this.margin, ((0.7)*this.width), ((3/4)*this.height));
    this.scatter.draw(filtersObject);
    this.sideBar = new StandardBarChart(this.div.appendChild(container), this.margin, ((0.2)*this.width), ((0.75)*this.height), "average_pace", "decimal", "y");
    this.sideBar.draw(filtersObject, data);
    /*var svg = this.sideBar.getSvg();
    console.log(svg);
    this.sideBar.getSvg().attr('transform',function(){
                var me = svg.node()
                var x1 = me.getBBox().x + me.getBBox().width/2;//the center x about which you want to rotate
                var y1 = me.getBBox().y + me.getBBox().height/2;//the center y about which you want to rotate

                return `rotate(270, 10, 130)`;//rotate 180 degrees about x and y
            });*/
  }

  rebuildGraphs(filtersObj, data) {
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

  populateAllGraphs(filteredData, filters, colour) {
    this.updateScales(filteredData, filters);
    this.updatePlots(filteredData, filters, colour);
  }

  updateScales(data, filters) {
    this.scatter.update(filters);
    this.sideBar.update(data, filters);
    this.topBar.update(data, filters);
    this.effortChart.update(data, filters);
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
