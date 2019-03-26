class EffortBarChart {
  constructor(container, margin, width, height) {
    this.margin = margin;
    this.container = container;
    this.width = width;
    this.height = height;
  }

  draw(filtersObject, data) {
    var filteredData = filtersObject.filterData(data);
    var barVals = this.buildBarValues(filteredData);
    this.x = d3.scaleBand().range([0, this.width]).round(.2).domain([0, 23]);
    this.y = d3.scaleLinear().range([this.height, 0]).domain([
      (d3.max(barVals, d => Math.abs(d))),
      (-1 * d3.max(barVals, d => Math.abs(d)))
    ]).nice();

    this.svg = d3.select(this.container).append('svg')
      .attr("id", this.id)
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)

    this.plot = this.svg.append("g")
          .attr("transform",
              "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.plot.append("text")
        .attr("x", (this.width / 2))
        .attr("y", 0 - (this.margin.top/3))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Variation from Average Effort by Time of Day");

    this.createAxes();
  }

  createAxes() {
    var lineFunction = d3.line()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; });

    this.xAxisScale = d3.scaleLinear().domain([0, 23]).range([0, this.width]);
    this.xAxisCall = d3.axisBottom(this.xAxisScale).ticks(24)
          .tickFormat(function(d) {
              if (d < 10) d = "0" + d;
              return d + ":00";
            });

    this.xAxisSecondaryCall = d3.axisBottom(this.xAxisScale).tickValues([]);

    this.xAxis = this.plot.append("g")
      .attr("id", "x axis")
      .attr("class", "axis-invisible")
      .attr("transform", "translate(0," + this.height + ")")
      .call(this.xAxisCall)

    this.xAxisSecondary = this.plot.append("g")
      .attr("id", "x axis")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.y(0) + ")")
      .call(this.xAxisSecondaryCall)
  }


  Mean(numbers) {
      var total = 0, i;
      for (i = 0; i < numbers.length; i += 1) {
          total += numbers[i];
      }
      return total/numbers.length;
  }

  buildBarValues(filteredData) {
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
    //this.yAxis.call(this.yAxisCall);
  }

  update(filteredData){
    // Re-calculate the bar values
    var barVals = this.buildBarValues(filteredData);

    var max_y = d3.max(barVals, d => Math.abs(d))
    // Update the scales
    this.y.domain([max_y, -1*max_y]).nice();
  }

  plotBars(filteredData, id, colour) {
    this.plot.selectAll("[id='#dataset" + id + "']").remove();
    var data = this.buildBarValues(filteredData);
    var keys = Object.keys(data);
    var rects = this.plot.selectAll("rects").data(keys);
    rects.data(data).enter()
      .append("rect")
        .attr("x", d => this.xAxisScale(Object.keys(data).find(key => data[key] === d)))
        .attr("y", d => Math.min(this.y(0), this.y(d)))
        .attr('width', this.width/24)
        .attr("fill", colour)
        .attr("id", "#dataset" + id)
        .style("opacity", 0.5)
        .attr('height', d => Math.abs(this.y(d) - this.y(0)))
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
            .style("opacity", 1) // started as 0!
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


class HeartRateBarChart {
  constructor(container, margin, width, height) {
    this.container = container;
    this.margin = margin;
    this.width = width;
    this.height = height;
  }

  draw(filtersObject, data) {
    var filteredData = filtersObject.filterData(data);
    var barVals = this.buildBarValues(filteredData);
    var max_y = Math.max.apply(null, Object.values(barVals).map(d => parseInt(d)));

    this.x = d3.scaleLinear().domain([d3.min(filteredData, function(d) { return d["heart_rate"]; }),
      d3.max(filteredData, function(d) { return d["heart_rate"]; })]).range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]).domain([0, max_y]).nice();

    this.svg = d3.select(this.container).append('svg')
      .attr("id", this.id)
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)

    this.plot = this.svg.append("g")
          .attr("transform",
              "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.plot.append("text")
        .attr("x", (this.width / 2))
        .attr("y", 0 - (this.margin.top/3))
        .attr("text-anchor", "left")
        .style("font-size", "13px")
        .text("Activities by HR");
    this.createAxis();
  }

    createAxis() {
      var x_title = this.x_val;

      this.xAxisCall = d3.axisBottom(this.x)

      this.xAxis = this.plot.append("g")
        .attr("id", "x axis")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")")
        .call(this.xAxisCall)
    }


    //Iterates through all datapoints, checks their HR, and increements the value in the relevant bin in an array
    buildBarValues(filteredData) {
      var bins = {};
      Object.values(filteredData).forEach(function(d) {
        var bin = Math.floor(d["heart_rate"]);

        if (bin in bins) bins[bin] += 1;
        else bins[bin] = 1;
      });
      return bins;
    }

    resize(new_width) {
      this.xAxisScale.range([0, new_width]);
      this.width = new_width;

      this.svg.attr("width", new_width + this.margin.left + this.margin.right);

      // Update the axes
      this.xAxis.call(this.xAxisCall);
    }

    update(filteredData){
      // Re-calculate the bar values
      var barVals = this.buildBarValues(filteredData);
      var max_y = Math.max.apply(null, Object.values(barVals).map(d => parseInt(d)));

      // Update the scales
      this.y.domain([0, max_y]).nice();
    }

    plotBars(filteredData, id, colour) {
      this.plot.selectAll("[id='#dataset" + id + "']").remove();
      var data = this.buildBarValues(filteredData);
      var keys = Object.keys(data);
      var rects = this.plot.selectAll("rects").data(keys);
      rects.enter()
        .append("rect")
          .attr("x", d => this.x(d))
          .attr("y", d => this.y(data[d]))
          .attr('width', d => (this.width/(parseInt(this.x.domain()[this.x.domain().length-1]) - parseInt(this.x.domain()[0]))))
          .attr("id", "#dataset"+id)
          .attr("fill", colour)
          .style("opacity", 0.5)
          .attr('height', d => (this.y(0) - this.y(data[d])))
        .on('mouseover', function(d, i) {
          d3.select(this)
            .transition()
            .attr("fill", "#000000")
          if (i < 10) { var time = "0" + i + ":00" }
          else { var time = i + ":00" }
          var html  = "Heart Rate: <b> " + d + "bpm</b><br/>" +
                      "Runs with this HR: <b>" + data[d] + "</b>";

          tooltip.html(html)
              .style("left", (d3.event.pageX + 15) + "px")
              .style("top", (d3.event.pageY - 28) + "px")
            .transition()
              .duration(200) // ms
              .style("opacity", 1) // started as 0!
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
}


class PaceBarChart {
  constructor(container, margin, width, height) {
    this.container = container;
    this.margin = margin;
    this.width = width;
    this.height = height;
  }

  draw(filtersObject, data) {
    var filteredData = filtersObject.filterData(data);
    var barVals = this.buildBarValues(filteredData);
    var max_y = Math.max.apply(null, Object.values(barVals).map(d => parseInt(d)));

    this.y = d3.scaleLinear().domain([d3.max(filteredData, function(d) { return d["average_pace"]; }),
      d3.min(filteredData, function(d) { return d["average_pace"]; })]).range([0, this.height]);
    this.x = d3.scaleLinear().range([0, this.width]).domain([0, max_y]).nice();
    this.svg = d3.select(this.container).append('svg')
      .attr("id", this.id)
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)

    this.plot = this.svg.append("g")
          .attr("transform",
              "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.plot.append("text")
        .attr("x", (this.width / 2))
        .attr("y", 0 - (this.margin.top/3))
        .style("font-size", "13px")
        .attr("text-anchor", "middle")
        .text("Activities by Pace");
    this.createAxis();
  }

  createAxis() {
    var y_title = this.y_val;

    this.yAxisCall = d3.axisLeft(this.y);

    this.yAxis = this.plot.append("g")
      .call(this.yAxisCall);
  }

  buildBarValues(filteredData) {
    var bins = {};
    Object.values(filteredData).forEach(function(d) {
      var bin;
      bin = (Math.floor(d["average_pace"]*100))/100;
      bin = bin.toFixed(1);

      if (bin in bins) {
        bins[bin] += 1;
      }
      else {
        bins[bin] = 1;
      }
    })
    return bins;
  }

  resize(new_width) {
    this.yAxisScale.range([0, new_width]);
    this.width = new_width;

    this.svg.attr("width", new_width + this.margin.left + this.margin.right);

    // Update the axes
    this.yAxis.call(this.yAxisCall);
  }

  update(filteredData){
    // Re-calculate the bar values
    var barVals = this.buildBarValues(filteredData);
    var max_y = Math.max.apply(null, Object.values(barVals).map(d => parseInt(d)));

    // Update the scales
    this.x.domain([0, max_y]).nice();
  }

  plotBars(filteredData, id, colour) {
    this.plot.selectAll("[id='#dataset" + id + "']").remove();
    var data = this.buildBarValues(filteredData);
    var keys = Object.keys(data);
    var rects = this.plot.selectAll("rects").data(keys);
    rects.enter()
      .append("rect")
        .attr("x", d => this.x(0))
        .attr("y", d => this.y(d))
        .attr('width', d => (this.x(data[d]) - this.x(0)))
        .attr("id", "#dataset"+id)
        .attr("fill", colour)
        .style("opacity", 0.5)
        .attr('height', d => (this.height/(parseFloat(this.y.domain()[0])*10 - parseFloat(this.y.domain()[this.y.domain().length-1])*10)))
      .on('mouseover', function(d, i) {
        d3.select(this)
          .transition()
          .attr("fill", "#000000")
        if (i < 10) { var time = "0" + i + ":00" }
        else { var time = i + ":00" }
        var html  = "Pace: <b> " + d + "mins/km</b><br/>" +
                    "Runs with this Pace: <b>" + data[d] + "</b>";
        tooltip.html(html)
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
          .transition()
            .duration(200) // ms
            .style("opacity", 1) // started as 0!
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
}
