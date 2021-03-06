angular.module( 'manageRequestsCtrl', [] )
.controller( 'manageRequestsController', function ($scope, Conferences, Events, popup, $state) {

  $scope.events = []
  $scope.conferences = []
  $scope.events_conference_names = []

  // show conference creation application
  $scope.viewConferenceDraft = function(index){
    // route to conference application
    var _cid = $scope.conferences[index].id;
    $state.go('draft-conference', {conference_id: _cid});
  }


  // show events creation application
  $scope.viewEventDraft = function(index){
    // route to event application
    var _eid = $scope.events[index].id;
    console.log(_eid);
    var _cid = $scope.events[index].conference_id;
    //:event_id:conference_id'
    $state.go('draft-event', {event_id: _eid, conference_id: _cid });
  }


  // TODO: Need to change approved --> pending
  $scope.loadPendingConferences = function () {
    Conferences.status().query({status:'pending'})
    .$promise.then( function ( response ) {
      if ( response ) {
        $scope.conferences = response;
      } else {
        popup.error( 'Error', response.message );
      }
    })
  };
  $scope.loadPendingConferences();


  // TODO: Need to change approved --> pending
  $scope.loadPendingEvents = function () {
    Events.status().query({status:'pending'})
    .$promise.then( function ( response ) {
      if ( response ) {
        $scope.events = response;
        $scope.events_id_as_name = response;
        $scope.addConferenceAssociation($scope.events_id_as_name);
      } else {
        popup.error( 'Error', response.message );
      }
    })
  };
  $scope.loadPendingEvents();

  $scope.addConferenceAssociation = function (arr) {
    for (var i = 0; i < arr.length; i++) {
      Conferences.fetch().get({cid: arr[i].conference_id})
      .$promise.then( function ( response ) {
        if( response ){
          var conference = response
          $scope.events_conference_names.push(conference.name);
        } else {
          popup.error ('Error', response.message);
        }
      })
    }
  };

  // ================ Update Conference Status Methods ============== //
  $scope.publishConference = function (index) {
    var conference = {
      id: $scope.conferences[index].id,
      status: 'approved'
    };
    Conferences.fetch().update({cid: conference.id },{status: conference.status})
    .$promise.then( function (response) {
      if ( response.status == 200 ) {
        $scope.loadPendingConferences();
        popup.alert( 'success', 'Conference successfully published.' );
      } else {
        popup.error( 'Error', response.message );
      }
    })
  };

  $scope.declineConference = function (index) {
      var modalInstance = popup.prompt('Decline', 'Are you sure you want to decline this Conference?');

      modalInstance.result.then( function ( result ) {
          if (result) {
              $scope.declineConferenceAction(index);
          }
      })
  };

  $scope.declineConferenceAction = function (index) {
    var conference = {
      id: $scope.conferences[index].id,
      status: 'denied'
    };
    Conferences.fetch().update({cid: conference.id },{status: conference.status})
    .$promise.then( function (response) {
      if ( response.status == 200 ) {
        $scope.loadPendingConferences();
        popup.alert( 'danger', 'Conference request denied.' );
      } else {
        popup.error( 'Error', response.message );
      }
    })
  };


  // ================ Update Event Status Methods ============== //
  $scope.publishEvent = function (index) {

    var _event = {
      eid: $scope.events[index].id,
      cid: $scope.events[index].conference_id,
      status: 'approved'
    };


    Conferences.fetch().get({cid: _event.cid})
    .$promise.then( function ( response ) {
      if( response ){
        var conference = response
        if (response.status =="approved"){
          $scope.approveEvent(_event);
        } else {
          var warningMessage = 'Unable to perform action. Please approve ' + response.name + ' Conference first.'
          var modalInstance = popup.warning('Publish', warningMessage);
          modalInstance.result.then( function ( result ) {
            if (result) {
              $state.go('requests');
            }
          })
        }
      } else {
        popup.error ('Error', response.message);
      }
    })
  };

  $scope.approveEvent = function(_event){
    Events.fetch().update( {cid: _event.cid, eid: _event.eid },{status: _event.status})
    .$promise.then( function ( response ) {
      if ( response.status == 200 ) {
        $scope.loadPendingEvents();
        popup.alert( 'success', 'Event successfully published.' );
      } else {
        popup.error( 'Error', response.message );
      }
    })
  }
  $scope.declineEvent = function (index) {
      var modalInstance = popup.prompt('Decline', 'Are you sure you want to decline this Event?');

      modalInstance.result.then( function ( result ) {
          if (result) {
              $scope.cancelEventAction(index);
          }
      })
  };

  $scope.declineEventAction = function (index) {
    var _event = {
      eid: $scope.events[index].id,
      cid: $scope.events[index].conference_id,
      status: 'denied'
    };
    Events.fetch().update( {cid: _event.cid, eid: _event.eid },{status: _event.status})
    .$promise.then( function ( response ) {
      if ( response.status == 200 ) {
        $scope.loadPendingEvents();
        popup.alert( 'danger', 'Event request denied.' );
      } else {
        popup.error( 'Error', response.message );
      }
    })
  };

});
