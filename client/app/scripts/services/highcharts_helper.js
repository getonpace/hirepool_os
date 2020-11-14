(function () {
'use strict';

angular
  .module('hirepoolApp')
  .service('highchartsHelper', highchartsHelper);

highchartsHelper.$inject = ['moment', '_'];
function highchartsHelper (moment, _) {
  var Highcharts = window.Highcharts;

  return {
    drawAdminOverviewGraph: drawAdminOverviewGraph
  };

  function drawGraph (options) {
    if (options.series && options.elementId) {
      Highcharts.stockChart(options.elementId, {
        chart: {
          type: 'line'
        },
        title: { text: options.title || '' },
        xAxis: {
          type: 'datetime',
          title: { text: 'Date' },
        },
        yAxis: [{
          min: 0,
          opposite: false,
        }],
        legend: { enabled: false },
        navigator: { enabled: false },
        rangeSelector: { enabled: false },
        scrollbar: { enabled: false },
        tooltip: {
          headerFormat: '{point.x:%A, %b %e}<br>',
        },
        plotOptions: {
          line: {
            marker: { enabled: false },
          }
        },
        series: options.series,
        credits: { enabled: false },
      });
    }
  }

  function drawAdminOverviewGraph (rawData, timeframe, name) {
    var latestDate = moment().format('MM-DD-YYYY');
    var earliestDate;
    if (timeframe !== 'all') {
      earliestDate = moment().subtract(timeframe, 'd').format('MM-DD-YYYY');
    } else {
      earliestDate = moment(0).format('MM-DD-YYYY');
    }
    var data = [];
    var date = latestDate;
    var val = 0;
    _.each(rawData, function (datapoint) {
      var createdDate = moment(datapoint.created_at).format('MM-DD-YYYY');
      if (createdDate === date) {
        val = val + 1;
      } else {
        while (date !== createdDate && !moment(date).isBefore(earliestDate)) {
          data.unshift([moment(date).valueOf(), val]);
          date = moment(date).subtract(1, 'd').format('MM-DD-YYYY');
          val = 0;
        }
        if (date === createdDate) {
          val = val + 1;
        }
      }
    });
    data.unshift([moment(date).valueOf(), val]);
    while (timeframe !== 'all' && !moment(date).isBefore(earliestDate)) {
      val = 0;
      date = moment(date).subtract(1, 'd').format('MM-DD-YYYY');
      data.unshift([moment(date).valueOf(), val]);
    }
    var seriesWithData = [{
      name: name,
      data: data
    }];
    drawGraph({
      elementId: 'admin_overview_highcharts_container',
      series: seriesWithData,
      title: name,
    });
  }

}
})();
