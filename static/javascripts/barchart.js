class PositiveAndNegativeBarChart {
  constructor(container, data, filteredData, margin, width, height, colour) {
    this.data = data;
    this.barVals = this.buildBarValues(filteredData);
    this.margin = margin;
    this.container = container;
    this.width = width;
    this.height = height;
    this.colour = colour;
    this.draw();
  }

  draw() {
    this.x = d3.scaleBand().range([0, this.width]).round(.2).domain([0, 23]);
    this.y = d3.scaleLinear().range([this.height, 0]).domain([
      Math.sqrt(d3.max(this.barVals, function(d) { return d**2 })),
      (-1 * Math.sqrt(d3.max(this.barVals, function(d) { return d**2 })))
    ]).nice();

    this.svg = d3.select(this.container).append('svg')
      .attr("id", this.id)
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)

    this.plot = this.svg.append("g")
          .attr("transform",
              "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.createAxes();
  }

  createAxes() {
    this.xAxisScale = d3.scaleLinear().domain([0, 23]).range([0, this.width]);
    this.xAxisCall = d3.axisBottom(this.xAxisScale)
          .tickFormat(function(d) {
              if (d == 0) return "";
              else if (d < 10) d = "0" + d;
              return d + ":00";
            });

    this.yAxisCall = d3.axisLeft(this.y);

    this.xAxis = this.plot.append("g")
      .attr("id", "x axis")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.y(0) + ")")
      .call(this.xAxisCall)

    this.yAxis = this.plot.append("g")
      .call(this.yAxisCall);
  }


  Mean(numbers) {
      var total = 0, i;
      for (i = 0; i < numbers.length; i += 1) {
          total += numbers[i];
      }
      return total/numbers.length;
  }

  buildBarValues(filteredData) {
    console.log(Object.values(filteredData));
    var activities = Object.values(filteredData);
    var tod = [];
    var hr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    var p = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    // count how much each city occurs in list and store in countObj
    activities.forEach(function(d) {
      hr[d.hour] += d.heart_rate;
      p[d.hour] += d.average_pace;
    });
    var mean = this.Mean(hr)/this.Mean(p);
    for (var i = 0; i < 24; i++) {
      tod[i] = (mean - (hr[i]/p[i]));
    }
    return tod;
  }

  resize(new_width) {
    this.xAxisScale.range([0, new_width]);
    this.width = new_width;

    this.svg.attr("width", new_width + this.margin.left + this.margin.right);

    // Update the axes
    this.xAxis.call(this.xAxisCall);
    this.yAxis.call(this.yAxisCall);
  }

  update(filteredData){
    // Re-calculate the bar values
    this.barVals = this.buildBarValues(filteredData);

    // Update the scales
    this.y.domain([
      Math.sqrt(d3.max(this.barVals, function(d) { return d**2 })),
      (-1 * Math.sqrt(d3.max(this.barVals, function(d) { return d**2 })))
    ]).nice();

    // Update the bars
    this.plot.selectAll("rect").remove();
  }

  dataInDate(d) {
    if (d.year > this.filters.getEarliestDate().getFullYear() && d.year < this.filters.getLatestDate().getFullYear()) {
      return true;
    }
    else if (d.year == this.filters.getEarliestDate().getFullYear()) {
        if (d.month >= this.filters.getEarliestDate().getMonth()) return true;
    }
    else if (d.year == this.filters.getLatestDate().getFullYear()) {
      if (d.month <= this.filters.getLatestDate().getMonth()) return true;
    }
  }

  dataInTime(d) {
    if (d.hour > this.filters.getEarliestTime().getHours() && d.hour < this.filters.getLatestTime().getHours()) {
      return true;
    }
    else if (d.hour == this.filters.getEarliestTime().getHours()) {
      if (d.minute >= this.filters.getEarliestTime().getMinutes()) return true;
    }
    else if (d.year == this.filters.getLatestTime().getHours()) {
      if (d.minute <= this.filters.getLatestTime().getMinutes()) return true;
    }
  }

  containsTags(d) {
    this.filters.getTags().forEach(function(tag) {
      if (d.description != null && d.description.contains(tag)) {
        return false;
      }
    })
    return true;
  }

  getX() {
    return this.xAxisScale;
  }

  getY() {
    return this.y;
  }

  getPlot() {
    return this.plot;
  }

  getData() {
    return this.data;
  }

  getBarValues() {
    return this.barVals;
  }

  getWidth() {
    return this.width;
  }
}


class StandardBarChart {
  constructor(container, data, filteredData, margin, width, height, colour, x_val, type) {
    this.data = data;
    this.x_val = x_val;
    this.type = type;
    this.barVals = this.buildBarValues(filteredData);
    this.margin = margin;
    this.container = container;
    this.width = width;
    this.height = height;
    this.colour = colour;
    this.draw();
  }

  draw() {
    var values = Object.values(this.barVals).map(d => parseInt(d));
    var max_y = Math.max.apply(null, values);
    var x_title = this.x_val;
    this.x = d3.scaleLinear().domain([d3.min(this.data, function(d) { return d[x_title]; }),
      d3.max(this.data, function(d) { return d[x_title]; })]).range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]).domain([0, max_y]).nice();

    this.svg = d3.select(this.container).append('svg')
      .attr("id", this.id)
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)

    this.plot = this.svg.append("g")
          .attr("transform",
              "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.createAxes();
    var width = w/(d3.max(this.data, d => d[this.x_val]) - d3.min(this.data, d => d[this.x_val]));
  }

  createAxes() {
    var x_title = this.x_val;
    this.xAxisScale = d3.scaleLinear().domain([d3.min(this.data, function(d) { return d[x_title]; }),
      d3.max(this.data, function(d) { return d[x_title]; })]).range([0, this.width]);

    this.xAxisCall = d3.axisBottom(this.x)

    this.yAxisCall = d3.axisLeft(this.y);

    this.xAxis = this.plot.append("g")
      .attr("id", "x axis")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.y(0) + ")")
      .call(this.xAxisCall)

    this.yAxis = this.plot.append("g")
      .call(this.yAxisCall);
  }

  buildBarValues(filteredData) {
    var x_title = this.x_val;
    var type = this.type;
    var bins = {};
    Object.values(filteredData).forEach(function(d) {
      var bin;
      if (type == "decimal") {
        bin = (Math.floor(d[x_title]*100))/100;
        bin = bin.toFixed(1);
      }
      else {
        bin = Math.floor(d[x_title]);
      }
      if (bin in bins) {
        bins[bin] += 1;
      }
      else {
        bins[bin] = 1;
      }
    })
    console.log(bins);
    return bins;
  }


  resize(new_width) {
    this.xAxisScale.range([0, new_width]);
    this.width = new_width;

    this.svg.attr("width", new_width + this.margin.left + this.margin.right);

    // Update the axes
    this.xAxis.call(this.xAxisCall);
    this.yAxis.call(this.yAxisCall);
  }

  update(filteredData){
    // Re-calculate the bar values
    this.barVals = this.buildBarValues(filteredData);

    var values = Object.values(this.barVals).map(d => parseInt(d));
    var max_y = Math.max.apply(null, values);

    // Update the scales
    this.y.domain([0, max_y]).nice();

    // Update the bars
    this.plot.selectAll("rect").remove();

  }

  dataInDate(d) {
    if (d.year > this.filters.getEarliestDate().getFullYear() && d.year < this.filters.getLatestDate().getFullYear()) {
      return true;
    }
    else if (d.year == this.filters.getEarliestDate().getFullYear()) {
        if (d.month >= this.filters.getEarliestDate().getMonth()) return true;
    }
    else if (d.year == this.filters.getLatestDate().getFullYear()) {
      if (d.month <= this.filters.getLatestDate().getMonth()) return true;
    }
  }

  dataInTime(d) {
    if (d.hour > this.filters.getEarliestTime().getHours() && d.hour < this.filters.getLatestTime().getHours()) {
      return true;
    }
    else if (d.hour == this.filters.getEarliestTime().getHours()) {
      if (d.minute >= this.filters.getEarliestTime().getMinutes()) return true;
    }
    else if (d.year == this.filters.getLatestTime().getHours()) {
      if (d.minute <= this.filters.getLatestTime().getMinutes()) return true;
    }
  }

  containsTags(d) {
    this.filters.getTags().forEach(function(tag) {
      if (d.description != null && d.description.contains(tag)) {
        return false;
      }
    })
    return true;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getXVal() {
    return this.x_val;
  }

  getPlot() {
    return this.plot;
  }

  getData() {
    return this.data;
  }

  getSvg() {
    return this.svg;
  }

  getBarValues() {
    return this.barVals;
  }
}


function plotBars(graph, filtered, y, x, graph_width, colour) {
  var plot = graph.getPlot();
  var data = graph.buildBarValues(filtered);
  console.log(data);
  var rects = plot.selectAll("rects");
  rects.data(data).enter()
    .append("rect")
      .attr("x", d => x(Object.keys(data).find(key => data[key] === d)))
      .attr("y", d => Math.min(y(0), y(d)))
      .attr('width', graph_width/24)
      .attr("fill", colour)
      .style("opacity", 0.5)
      .attr('height', d => Math.abs(y(d) - y(0)))
    .on('mouseover', function(d, i) {
      d3.select(this)
        .transition()
        .attr("fill", "#000000")
      if (i < 10) { var time = "0" + i + ":00" }
      else { var time = i + ":00" }
      var html  = "Time of run: <b> " + time + "</b><br/>" +
                  "Variance from mean bpkm: <b>" + d.toFixed(3) + "bpkm</b>";

      tooltip.html(html)
          .style("left", (d3.event.pageX + 15) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
        .transition()
          .duration(200) // ms
          .style("opacity", .7) // started as 0!
    })
    .on('mouseout', function(d) {
      d3.select(this)
        .transition()
        .attr("fill", colour)
      tooltip.transition()
          .duration(300) // ms
          .style("opacity", 0); // don't care about position!
    });
}


function standardPlotBars(graph, filtered, i, j, colour) {
  var plot = graph.getPlot();
  var data = graph.buildBarValues(filtered);
  var y = graph.getY();
  var x = graph.getX();
  var keys = Object.keys(data);
  var rects = plot.selectAll("rects").data(keys);
  rects.enter()
    .append("rect")
      .attr("x", d => x(d))
      .attr("y", d => y(data[d]))
      .attr('width', "6")
      .attr("fill", colour)
      .style("opacity", 0.5)
      .attr('height', d => (y(0) - y(data[d])))
    .on('mouseover', function(d, i) {
      d3.select(this)
        .transition()
        .attr("fill", "#000000")
      if (i < 10) { var time = "0" + i + ":00" }
      else { var time = i + ":00" }
      var html  = "Heart Rate: <b> " + d + "</b><br/>" +
                  "Runs with this HR: <b>" + data[d] + "</b>";

      tooltip.html(html)
          .style("left", (d3.event.pageX + 15) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
        .transition()
          .duration(200) // ms
          .style("opacity", .7) // started as 0!
    })
    .on('mouseout', function(d) {
      d3.select(this)
        .transition()
        .attr("fill", colour)
      tooltip.transition()
          .duration(300) // ms
          .style("opacity", 0); // don't care about position!
    });
}
