class Filters {
  constructor(data) {
    this.data = data;
    this.min_distance = d3.min(this.data, function(d) { return d.distance });
    this.max_distance = d3.max(this.data, function(d) { return d.distance });
    this.min_elevation_gain = d3.min(this.data, function(d) { return d.total_elevation_gain });
    this.max_elevation_gain = d3.max(this.data, function(d) { return d.total_elevation_gain });
    this.min_heart_rate = d3.min(this.data, function(d) { return d.heart_rate });
    this.max_heart_rate = d3.max(this.data, function(d) { return d.heart_rate });
    this.min_date = new Date(d3.min(dataset, function(d) {return d.year; }), d3.min(data, function(d) {return d.month; }), d3.min(data, function(d) {return d.day; }), 0, 0, 0);
    this.max_date = new Date(d3.max(dataset, function(d) {return d.year; }), d3.max(data, function(d) {return d.month; }), d3.max(data, function(d) {return d.day; }), 0, 0, 0);
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
}
