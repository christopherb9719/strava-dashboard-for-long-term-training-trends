class Scatter {
  constructor(container, data, margin, width, height, id) {
    this.data = data;
    this.container = container;
    this.margin = margin;
    this.width = width;
    this.height = height;
    this.id = id;
    this.initialiseValues();
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
    console.log(this.container);
    this.x = d3.scaleLinear()
      .domain([d3.min(this.data, function(d) { return d.heart_rate; }),
        d3.max(this.data, function(d) { return d.heart_rate; })])
      .range([0, this.width]);
    this.y = d3.scaleLinear()
      .domain([d3.min(this.data, function(d) { return d.average_pace; }),
        d3.max(this.data, function(d) { return d.average_pace; })])
      .range([this.height, 0]);
    this.svg = d3.select(this.container).append('svg')
      .attr("id", this.id)
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom);
    this.plot = this.svg.append('g')
      .attr("transform","translate(" + this.margin.left + "," + this.margin.top + ")");

    this.createAxes();
    this.plotPoints();
  }

  createAxes() {
    this.xAxisCall = d3.axisBottom(this.x)

    this.xAxis = this.plot.append("g")
        .attr("transform", "translate(0," + this.height + ")")
        .call(this.xAxisCall);

    this.yAxisCall = d3.axisLeft(this.y)
      .tickFormat(function(d) {
        var seconds = Math.round((d % 1) * 60);
        if (seconds < 10) {
          seconds = "0" + seconds;
        }
        var minutes = Math.floor(d - (d % 1));
        return (minutes + ":" + seconds);
      })
    this.yAxis = this.plot.append("g")
        .call(this.yAxisCall)


    // Labels
    this.xAxis.append("text")
        .attr("transform",
            "translate(" + (w/2) + " ," +
                      (h + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Mean Heart Rate (beats per minute)");

    this.yAxis.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (h / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Mean Pace (minutes per km)");
  }

  plotPoints() {
    this.circles = this.plot.selectAll("circle")
        .data(this.data.filter(d => ((d.distance <= this.max_distance && d.distance >= this.min_distance)
          && (d.total_elevation_gain <= this.max_elevation_gain && d.total_elevation_gain >= this.min_elevation_gain)
          && (d.heart_rate <= this.max_heart_rate && d.heart_rate >= this.min_heart_rate)
          && this.dataInDate(d)
          && this.dataInTime(d)
          && this.containsTags(d)
        )));

    this.circles.enter()
      .append("a")
        .attr("xlink:href", function(d) {return "https://www.strava.com/activities/" + d.id})
        .append("circle")
          .attr("cx", (d => this.x(d.heart_rate)))
          .attr("cy", (d => this.y(d.average_pace)))
          .attr("r", (d => this.getRadius(d)))
          .attr("fill", "#ff471a")
          .style("opacity", 0.5)
        .on('mouseover', function(d) {
          d3.select(this)
            .transition()
            .attr("fill", "#000000")
            //.attr("r", 9)
          var seconds = Math.round((d.average_pace % 1) * 60);
          if (seconds < 10) {
            seconds = "0" + seconds;
          }
          var minutes = Math.floor(d.average_pace - (d.average_pace % 1));
          //var pace = (d.average_pace - (d.average_pace % 1)) + ":" + d.average_pace%1.toFixed(2);
          var html  = "<span style='color:" + 'blue' + ";'>Run ID: " + d.id + "<br/></span> " +
                      "Distance: <b> " + d.distance + "m </b><br/>" +
                      "Average Heart Rate: <b>" + d.heart_rate + " bpm</b>" +
                      "<br/> Average Pace: <b/>" + minutes + ":" + seconds + "/km</b>" +
                      "<br/> Date of Run: <b/>" + d.day + "/" + d.month + "/" + d.year + "</b>";

          tooltip.html(html)
              .style("left", (d3.event.pageX + 15) + "px")
              .style("top", (d3.event.pageY - 28) + "px")
            .transition()
              .duration(200) // ms
              .style("opacity", .9) // started as 0!
          }
        )
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .attr("fill", "#ff471a")
          tooltip.transition()
              .duration(300) // ms
              .style("opacity", 0); // don't care about position!
        });
  }


  update(w, h){
    // Update our scales
    this.x.range([0, w]);
    this.y.range([h, 0]);

    this.svg.attr("width", w + this.margin.left + this.margin.right);

    // Update our axes
    this.xAxis.call(this.xAxisCall);
    this.yAxis.call(this.yAxisCall);

    this.plot.selectAll("circle").remove();
    // Update our circles
    this.plotPoints();
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
