(function () {
'use strict';

angular
  .module('hirepoolApp')
  .directive('hpCsvDownloader', hpCsvDownloader);

function hpCsvDownloader() {
  var directive = {
    templateUrl: 'views/directives/csv_downloader.html',
    restrict: 'EA',
    scope: {
      downloadData: '=',
      fileName: '=',
    },
    link: linkFunc,
    controller: HpCsvDownloaderController,
    controllerAs: 'vm',
    bindToController: true
  };
  return directive;

  function linkFunc(/*scope, element, attrs*/) {
    /* */
  }
}

HpCsvDownloaderController.$inject = [];
function HpCsvDownloaderController () {
  var vm = this;

  vm.download = download;

  function download () {
    var downloadStr = '';
    var headerArr = [];

    vm.downloadData.forEach(function (item) {
      var setHeader = true;
      if (headerArr.length) {
        setHeader = false;
      }
      var itemArr = [];
      Object.keys(item).forEach(function (key) {
        if (setHeader) {
          headerArr.push(key);
        }
        itemArr.push(getCellVal(item, key));
      });
      var itemStr = itemArr.join(',');
      downloadStr = downloadStr + itemStr + '\n';
    });

    var headerStr = headerArr.join(',') + '\n';
    var csvContent = headerStr + downloadStr;
    var csvFileName = vm.fileName ? vm.fileName + '.csv' : 'hirepool-data.csv';
    var blobdata = new Blob([csvContent],{type : 'text/csv'});
    var link = document.createElement('a');
    link.setAttribute('href', window.URL.createObjectURL(blobdata));
    link.setAttribute('download', csvFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function getCellVal (obj, key) {
    var str = JSON.stringify(obj[key]);
    if (str) {
      str = str.replace(/,/g, 'COMMA');
      str = str.replace('/[\r\n]+/g','NEWLINE');
    }
    return str || '';
  }

}

})();
