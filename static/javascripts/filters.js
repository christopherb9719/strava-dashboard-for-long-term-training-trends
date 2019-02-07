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
  }

  setTags(tags) {
    this.tags = tags;
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
  constructor(data, id, filters, graphSet) {
    this.data = data;
    this.id = id;
    this.filters = filters;
    this.graphSet = graphSet;
  }

  updateGraphs() {
    this.graphSet.updatePlots(this.getFilteredData(), this.filters);
  }

  getData() {
    return this.data;
  }

  getFilteredData() {
    return this.filters.filterData(this.data);
  }

  setGraphSet(graphSet) {
    this.graphSet = graphSet;
  }

  setFilterObject(filters) {
    this.filters = filters;
  }
}
