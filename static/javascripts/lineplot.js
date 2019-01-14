class BarChart {
  constructor(container, data, margin, width, height, id) {
    this.data = data;
    this.initialiseValues();
    this.barVals = this.buildBarValues();
    this.margin = margin;
    this.container = container;
    this.width = width;
    this.height = height;
    this.id = id;
    this.draw();
  }

  initialiseValues() {
    this.min_distance = d3.min(this.data, function(d) { return d.distance });
    this.max_distance = d3.max(this.data, function(d) { return d.distance });
    this.min_elevation_gain = d3.min(this.data, function(d) { return d.total_elevation_gain });
    this.max_elevation_gain = d3.max(this.data, function(d) { return d.total_elevation_gain });
    this.min_heart_rate = d3.min(this.data, function(d) { return d.heart_rate });
    this.max_heart_rate = d3.max(this.data, function(d) { return d.heart_rate });
    this.min_date = startDate;
    this.max_date = endDate;
    this.min_time = new Date(0, 0, 0, 0, 0, 0);
    this.max_time = new Date(0, 0, 0, 23, 59, 59);
    this.tags = [];
  }

  draw() {
    this.x = d3.scaleBand().range([0, this.width]).round(.2).domain([0, 23]);
    this.y = d3.scaleLinear().range([this.height, 0]).domain(d3.extent(this.barVals)).nice();

    this.svg = d3.select(this.container).append('svg')
      .attr("id", this.id)
      .attr('width', w + this.margin.left + this.margin.right)
      .attr("height", h/2 + this.margin.top + this.margin.bottom)

    this.plot = this.svg.append("g")
          .attr("transform",
              "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.createAxes();
    this.plotBars();
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
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.y(0) + ")")
      .call(this.xAxisCall)

    this.yAxis = this.plot.append("g")
      .call(this.yAxisCall);
  }

  plotBars() {
    this.rects = this.plot.selectAll("rect").data(this.barVals);
    this.rects.enter()
      .append("rect")
        .attr("x", d => this.xAxisScale(this.barVals.indexOf(d)))
        .attr("y", d => Math.min(this.y(0), this.y(d)))
        .attr('width', this.width/24)
        .attr("fill", "#ff471a")
        .attr('height', d => Math.abs(this.y(d) - this.y(0)))
      .on('mouseover', function(d, i) {
        if (i < 10) { var time = "0" + i + ":00" }
        else { var time = i + ":00" }
        var html  = "Time of run: <b> " + time + "</b><br/>" +
                    "y: <b>" + d + "</b>";

        tooltip.html(html)
            .style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
          .transition()
            .duration(200) // ms
            .style("opacity", .7) // started as 0!
      })
      .on('mouseout', function(d) {
        tooltip.transition()
            .duration(300) // ms
            .style("opacity", 0); // don't care about position!
      });
  }

  Mean(numbers) {
      var total = 0, i;
      for (i = 0; i < numbers.length; i += 1) {
          total += numbers[i];
      }
      return total/numbers.length;
  }

  buildBarValues() {
    var activities = this.data.filter(d => ((d.distance <= this.max_distance && d.distance >= this.min_distance)
        && (d.total_elevation_gain <= this.max_elevation_gain && d.total_elevation_gain >= this.min_elevation_gain)
        && (d.heart_rate <= this.max_heart_rate && d.heart_rate >= this.min_heart_rate)
        && this.dataInDate(d)
        && this.dataInTime(d)
        && this.containsTags(d)
      ));

    var tod = [];
    var hr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    var p = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    // count how much each city occurs in list and store in countObj
    activities.forEach(function(d) {
      hr[d.hour] += d.heart_rate;
      p[d.hour] += d.average_pace;
    });
    var mean = this.Mean(hr)/this.Mean(p);
    for (var i = 0; i < 24; i++) {
      tod.push(mean - (hr[i]/p[i]));
    }
    return tod;
  }

  update(w, h){
    // Update our scales
    this.xAxisScale.range([0, w]);
    this.y.range([h, 0]);
    this.width = w;
    this.height = h;

    this.svg.attr("width", w + this.margin.left + this.margin.right);

    // Update our axes
    this.xAxis.call(this.xAxisCall);
    this.yAxis.call(this.yAxisCall);

    this.plot.selectAll("rect").remove();
    // Update our circles
    this.barVals = this.buildBarValues();
    this.plotBars();
  }

  dataInDate(d) {
    if (d.year > this.min_date.getFullYear() && d.year < this.max_date.getFullYear()) {
      return true;
    }
    else if (d.year == this.min_date.getFullYear()) {
        if (d.month >= this.min_date.getMonth()) return true;
    }
    else if (d.year == this.max_date.getFullYear()) {
      if (d.month <= this.max_date.getMonth()) return true;
    }
  }

  dataInTime(d) {
    if (d.hour > this.min_time.getHours() && d.hour < this.max_time.getHours()) {
      return true;
    }
    else if (d.hour == this.min_time.getHours()) {
      if (d.minute >= this.min_time.getMinutes()) return true;
    }
    else if (d.year == this.max_time.getHours()) {
      if (d.minute <= this.max_time.getMinutes()) return true;
    }
  }

  containsTags(d) {
    this.tags.forEach(function(tag) {
      if (d.description != null && d.description.contains(tag)) {
        console.log(tag);
        console.log(d.description)
        return false;
      }
    })
    return true;
  }

  getRadius(d) {
    var max = this.max_date.getTime()/1000,
        min = this.min_date.getTime()/1000,
        date = new Date(d.year, d.month, d.day, 0, 0, 0),
        size = (max-min)/(max-(date.getTime()/1000));
    if (size == 'infinity') {
      return 20;
    }
    else {
      return Math.min(20, size);
    }
  }


  setMinDistance(min_distance) {
    this.min_distance = min_distance;
  }

  setMaxDistance(max_distance) {
    this.max_distance = max_distance;
  }

  setMinElevation(min_elevation_gain) {
    this.min_elevation_gain = min_elevation_gain;
  }

  setMaxElevation(max_elevation_gain) {
    this.max_elevation_gain = max_elevation_gain;
  }

  setMaxHeartRate(max_heart_rate) {
    this.max_heart_rate = max_heart_rate;
  }

  setMinHeartRate(min_heart_rate) {
    this.min_heart_rate = min_heart_rate;
  }

  setDates(min_date, max_date) {
    this.min_date = new Date(min_date);
    this.max_date = new Date(max_date);
  }

  setTimes(min_time, max_time) {
    this.min_time = new Date(min_time);
    this.max_time = new Date(max_time);
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

  setTags(tags) {
    this.tags = tags;
  }

  getTags() {
    return this.tags;
  }

}
