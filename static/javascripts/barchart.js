class PositiveAndNegativeBarChart {
  constructor(container, data, filters, margin, width, height, id, colour) {
    this.data = data;
    this.filters = filters;
    this.barVals = this.buildBarValues();
    this.margin = margin;
    this.container = container;
    this.width = width;
    this.height = height;
    this.filters = filters;
    this.id = id;
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
    plotBars(this.plot, this.barVals, this.colour, this.y, this.xAxisScale, this.width);
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

  buildBarValues() {
    var activities = this.data.filter(d => ((d.distance <= this.filters.getMaxDistance() && d.distance >= this.filters.getMinDistance())
      && (d.total_elevation_gain <= this.filters.getMaxElevationGain() && d.total_elevation_gain >= this.filters.getMinElevationGain())
      && (d.heart_rate <= this.filters.getMaxHeartRate() && d.heart_rate >= this.filters.getMinHeartRate())
      && this.dataInDate(d)
      && this.dataInTime(d)
      && this.containsTags(d)
    ));

    var bins = {};
    this.data.forEach(function(d) {
      var bin = Math.floor(d.heart_rate);
      if (bin in bins) {
        bins[bin] += 1;
      }
      else {
        bins[bin] = 1;
      }
    })
    console.log(bins);



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

  update(w, h){
    // Re-calculate the bar values
    this.barVals = this.buildBarValues();

    // Update the scales
    this.y.domain([
      Math.sqrt(d3.max(this.barVals, function(d) { return d**2 })),
      (-1 * Math.sqrt(d3.max(this.barVals, function(d) { return d**2 })))
    ]).nice();
    this.xAxisScale.range([0, w]);
    this.width = w;
    this.height = h;

    this.svg.attr("width", w + this.margin.left + this.margin.right);

    // Update the axes
    this.xAxis.call(this.xAxisCall);
    this.yAxis.call(this.yAxisCall);

    // Update the bars
    this.plot.selectAll("rect").remove();
    plotBars(this.plot, this.barVals, this.colour, this.y, this.xAxisScale, this.width);
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

  getPlot() {
    return this.plot;
  }

  getData() {
    return this.data;
  }
}


class StandardBarChart {
  constructor(container, data, filters, margin, width, height, id, colour, x_val) {
    this.data = data;
    this.filters = filters;
    this.x_val = x_val;
    this.barVals = this.buildBarValues();
    this.margin = margin;
    this.container = container;
    this.width = width;
    this.height = height;
    this.filters = filters;
    this.id = id;
    this.colour = colour;
    this.draw();
  }

  draw() {
    var values = Object.values(this.barVals).map(d => parseInt(d));
    var max_y = Math.max.apply(null, values);
    var x_title = this.x_val;
    this.x = d3.scaleBand().range([0, this.width]).round(.2).domain([d3.extent(this.data, d => d.x_title)]);
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
    standardPlotBars(this.plot, this.barVals, this.colour, this.y, this.xAxisScale, this.width, this.x_val, width);
  }

  createAxes() {
    var x_title = this.x_val;
    this.xAxisScale = d3.scaleLinear().domain([d3.min(this.data, function(d) { return d[x_title]; }),
      d3.max(this.data, function(d) { return d[x_title]; })]).range([0, this.width]);
    this.xAxisCall = d3.axisBottom(this.xAxisScale)

    this.yAxisCall = d3.axisLeft(this.y);

    this.xAxis = this.plot.append("g")
      .attr("id", "x axis")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.y(0) + ")")
      .call(this.xAxisCall)

    this.yAxis = this.plot.append("g")
      .call(this.yAxisCall);
  }

  buildBarValues() {
    console.log(this.x_val);
    var x_title = this.x_val;
    var activities = this.data.filter(d => ((d.distance <= this.filters.getMaxDistance() && d.distance >= this.filters.getMinDistance())
      && (d.total_elevation_gain <= this.filters.getMaxElevationGain() && d.total_elevation_gain >= this.filters.getMinElevationGain())
      && (d.heart_rate <= this.filters.getMaxHeartRate() && d.heart_rate >= this.filters.getMinHeartRate())
      && this.dataInDate(d)
      && this.dataInTime(d)
      && this.containsTags(d)
    ));

    var bins = {};
    this.data.forEach(function(d) {
      var bin = Math.floor(d[x_title]);
      if (bin in bins) {
        bins[bin] += 1;
      }
      else {
        bins[bin] = 1;
      }
    })

    return bins;
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

  getPlot() {
    return this.plot;
  }

  getData() {
    return this.data;
  }

  getPlot() {
    return this.plot;
  }
}


function plotBars(plot, data, colour, y, x, w) {
  rects = plot.selectAll("rect").data(data);
  rects.enter()
    .append("rect")
      .attr("x", d => x(Object.keys(data).find(key => data[key] === d)))
      .attr("y", d => Math.min(y(0), y(d)))
      .attr('width', w/24)
      .attr("fill", colour)
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


function standardPlotBars(plot, data, colour, y, x, w, x_val, width) {
  console.log(data);
  console.log(width);
  var keys = Object.keys(data).map(d => parseInt(d));
  rects = plot.selectAll("rect").data(keys);
  rects.enter()
    .append("rect")
      .attr("x", d => x(d))
      .attr("y", d => y(data[d]))
      .attr('width', width)
      .attr("fill", colour)
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