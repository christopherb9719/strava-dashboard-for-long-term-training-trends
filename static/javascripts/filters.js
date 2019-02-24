class Filters {
  constructor(data) {
    this.initialiseFilters(data);
  }

  initialiseFilters(allData) {
    this.min_distance = d3.min(allData, function(d) { return d.distance });
    this.max_distance = d3.max(allData, function(d) { return d.distance });
    this.min_elevation_gain = d3.min(allData, function(d) { return d.total_elevation_gain });
    this.max_elevation_gain = d3.max(allData, function(d) { return d.total_elevation_gain });
    this.min_heart_rate = d3.min(allData, function(d) { return d.heart_rate });
    this.max_heart_rate = d3.max(allData, function(d) { return d.heart_rate });
    this.min_average_pace = d3.min(allData, function(d) { return d.average_pace });
    this.max_average_pace = d3.max(allData, function(d) { return d.average_pace });
    this.min_date = new Date(d3.min(allData, function(d) {return d.year; }), d3.min(allData, function(d) {return d.month; }), d3.min(allData, function(d) {return d.day; }), 0, 0, 0);
    this.max_date = new Date(d3.max(allData, function(d) {return d.year; }), d3.max(allData, function(d) {return d.month; }), d3.max(allData, function(d) {return d.day; }), 0, 0, 0);
    this.min_time = new Date(0, 0, 0, 0, 0, 0);
    this.max_time = new Date(0, 0, 0, 23, 59, 59);
    this.tags = [];
  }

  setDistances(min_distance, max_distance) {
    this.max_distance = max_distance;
    this.min_distance = min_distance;
  }

  setElevationGain(min_elevation_gain, max_elevation_gain) {
    this.max_elevation_gain = max_elevation_gain;
    this.min_elevation_gain = min_elevation_gain;
  }

  setHeartRates(min_heart_rate, max_heart_rate) {
    this.min_heart_rate = min_heart_rate;
    this.max_heart_rate = max_heart_rate;
  }

  setDates(min_date, max_date) {
    this.min_date = new Date(min_date);
    this.max_date = new Date(max_date);
  }

  setTimes(min_time, max_time) {
    this.min_time = new Date(min_time);
    this.max_time = new Date(max_time);
    console.log(this.min_time);
    console.log(this.max_time);
  }

  addTag(tag) {
    this.tags.push(tag);
  }

  setMaxDate(latestDate) {
    this.max_date = latestDate;
  }

  setMinDate(date) {
    this.min_date = date;
  }

  setMaxElevation(elevation) {
    this.max_elevation_gain = elevation;
  }

  setMinElevation(elevation) {
    this.min_elevation_gain = elevation;
  }

  setMaxHeartRate(heart_rate) {
    this.max_heart_rate = heart_rate;
  }

  setMinHeartRate(heart_rate) {
    this.min_heart_rate = heart_rate;
  }

  setMaxDistance(distance) {
    this.max_distance = distance;
  }

  setMinDistance(distance) {
    this.min_distance = distance;
  }

  setMinTime(time) {
    this.min_time = time;
  }

  setMaxTime(time) {
    this.max_time = time;
  }

  getMaxDistance() {
    return this.max_distance;
  }

  getMinDistance() {
    return this.min_distance;
  }

  getMinElevationGain() {
    return this.min_elevation_gain;
  }

  getMaxElevationGain() {
    return this.max_elevation_gain;
  }

  getMaxHeartRate() {
    return this.max_heart_rate;
  }

  getMinHeartRate() {
    return this.min_heart_rate;
  }

  getEarliestDate() {
    return this.min_date;
  }

  getLatestDate() {
    return this.max_date;
  }

  getEarliestTime() {
    return this.min_time;
  }

  getLatestTime() {
    return this.max_time;
  }

  getTags() {
    return this.tags;
  }

  removeTag(tag) {
    var index = this.tags.indexOf(tag);
    if (index > -1) {
      this.tags.splice(index, 1);
    }
    console.log(this.tags)
  }
  getMinPace() {
    return this.min_average_pace;
  }

  getMaxPace() {
    return this.max_average_pace;
  }

  filterData(data) {
    var filtered = data.filter(d => ((d.distance <= this.getMaxDistance() && d.distance >= this.getMinDistance())
      && (d.total_elevation_gain <= this.getMaxElevationGain() && d.total_elevation_gain >= this.getMinElevationGain())
      && (d.heart_rate <= this.getMaxHeartRate() && d.heart_rate >= this.getMinHeartRate())
      && this.dataInDate(d)
      && this.dataInTime(d)
      && this.containsTags(d)
    ));
    return filtered;
  }

  dataInDate(d) {
    if (d.year > this.getEarliestDate().getFullYear() && d.year < this.getLatestDate().getFullYear()) {
      return true;
    }
    else if (d.year == this.getEarliestDate().getFullYear()) {
        if (d.month >= this.getEarliestDate().getMonth()) return true;
    }
    else if (d.year == this.getLatestDate().getFullYear()) {
      if (d.month <= this.getLatestDate().getMonth()) return true;
    }
  }

  dataInTime(d) {
    if (d.hour > this.getEarliestTime().getHours() && d.hour < this.getLatestTime().getHours()) {
      return true;
    }
    else if (d.hour == this.getEarliestTime().getHours()) {
      if (d.minute >= this.getEarliestTime().getMinutes()) return true;
    }
    else if (d.year == this.getLatestTime().getHours()) {
      if (d.minute <= this.getLatestTime().getMinutes()) return true;
    }
  }

  containsTags(d) {
    this.getTags().forEach(function(tag) {
      if (d.description != null && d.description.contains(tag)) {
        return false;
      }
    })
    return true;
  }
}

class DataObject {
  constructor(data, id, colour, graphSet, filters) {
    this.data = data;
    this.id = id;
    if (filters == null) {
      this.filters = new Filters(data);
    }
    else {
      this.filters = filters;
    }
    this.colour = colour;
    this.graphSet = graphSet;
  }

  updateGraphs() {
    this.graphSet.updatePlots(this.getFilteredData(), this.filters, this.colour, this.id);
  }

  getData() {
    return this.data;
  }

  getColour() {
    return this.colour;
  }

  getFilteredData() {
    return this.filters.filterData(this.data);
  }

  setGraphSet(graphSet) {
    this.graphSet = graphSet;
  }

  getGraphSet() {
    return this.graphSet;
  }

  getFilterObject() {
    return this.filters;
  }

  getId() {
    return this.id;
  }

  setFilterObject(filters) {
    this.filters = filters;
  }
}
