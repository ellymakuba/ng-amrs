/*
 jshint -W003, -W098, -W117, -W109
 */
/*
jscs:disable disallowQuotedKeysInObjects, safeContextKeyword, requireDotNotation, requirePaddingNewLinesBeforeLineComments, requireTrailingComma
*/
(function() {
  'use strict';

  angular
    .module('app.patientsearch')
    .controller('PatientSearchCtrl', PatientSearchCtrl);

  PatientSearchCtrl.$inject = ['$rootScope', 'OpenmrsRestService', '$scope',
    '$log', 'filterFilter', '$state', 'PatientSearchService', '$window', '$timeout','EtlRestService'
  ];

  function PatientSearchCtrl($rootScope, OpenmrsRestService, $scope, $log,
    filterFilter, $state, PatientSearchService, $window, $timeout,EtlRestService) {
    $scope.filter = '';
    $scope.patients = PatientSearchService.getPatients();
    $scope.isBusy = false;
    $scope.isResetButton = true;
    $scope.isSearchButton = true;
    $scope.loaderButton = false;
    // pagination controls
    $scope.currentPage = 1;
    $scope.entryLimit = 10; // items per page
    $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
    $scope.searchString = PatientSearchService.getSearchString();
    $scope.$watch('searchString', function(searchString) {
      console.log(searchString);
      $scope.patients = PatientSearchService.getPatients();
      if (searchString && searchString.length > 2) {
        searchPatients(searchString);
      }
    });

    $scope.$on('bar-code-scan-event', function(event, parameters) {
      $scope.searchString = '';
      var barcode = angular.element.find('#search-textbox')[0].value.replace('$', '');
      $scope.searchString = barcode;
      searchPatients(barcode);
    });

    $scope.loadPatient = function(patientUuid) {
      /*
       Get the selected patient and save the details in the root scope
       so that we don't do another round trip to get the patient details
       */
      $rootScope.broadcastPatient = _.find($scope.patients, function(patient) {
        if (patient.uuid() === patientUuid) {
          return patient;
        }
      });

      $state.go('patient', {
        uuid: patientUuid
      });
      var params={
        //patientID:$rootScope.broadcastPatient.commonIdentifiers().ampathMrsUId
        patientID:'15365BS-5'
      }
      getSyncronizedPatientLabOrders(params);
    };

    $scope.pageChanged = function() {
      $log.log('Page changed to: ' + $scope.currentPage);
    };

    $scope.items = [];
    // create empty search model (object) to trigger $watch on update
    $scope.search = {};
    $scope.resetFilters = function() {
      // needs to be a function or it won't trigger a $watch
      $scope.search = {};
    };

    $scope.resetSearchList = function() {
      $scope.isResetButton = true;
      PatientSearchService.resetPatients();
      $scope.searchString = '';
    };

    function searchPatients(searchString) {
      $scope.isSearchButton = false;
      $scope.loaderButton = true;
      $scope.isBusy = true;
      OpenmrsRestService.getPatientService().getPatientQuery({
          q: searchString
        },
        function(data) {
          $scope.isSearchButton = true;
          $scope.loaderButton = false;
          $scope.isBusy = false;
          $scope.isResetButton = false;
          $scope.patients = data;
          PatientSearchService.resetPatients();
          PatientSearchService.setPatients(data);
          PatientSearchService.setSearchString(searchString);
          $scope.totalItems = $scope.patients.length;
          $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
          $scope.currentPage = 1;
        }
      );
    }
    function getSyncronizedPatientLabOrders(params){
      params['apikey']='35243eba2';
      params['startDate']='2006-01-01';
      params['endDate']='2016-04-27';
      EtlRestService.getPatientLabOrderResults(params,
        function successCallback(response){
        console.log('patient lab orders success response is ',response);
      },
    function failedCallback(error){
      console.error('patient lab orders error response is ',error);
    });
    }
  }
})();
