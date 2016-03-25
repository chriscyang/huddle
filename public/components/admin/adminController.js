angular.module('adminCtrl', [])
.controller('adminController', function($scope, $location, $log, Conferences, Events, popup, $state) {
	
    $scope.conferences = [];
    $scope.events = []; // array of arrays of events

	$scope.loadConferences = function () {
        Conferences.fetch().query()
            .$promise.then( function ( response ) {
                if ( response ) {
                    $scope.conferences = response;
                    for ( var i = 0; i < response.length; i++ ) {
                        Events.fetch().query( {cid: $scope.conferences[i].id} )
                            .$promise.then( function ( events ) {
                                if ( events ) {
                                    $scope.events[i] = events;
                                } else {
                                    $scope.events = [];
                                }
                            }, function () {
                                popup.connection();
                            })
                    }
                } else {
                    $scoope.conferences = [];
                }
            }, function () {
                popup.connection();
            })
    };

    $scope.loadConferences();

    $scope.deleteConference = function ( cid, e ) {
        e.preventDefault();
        e.stopPropagation();
        var modalInstance = popup.prompt('Delete', 'Are you sure you want to delete this conference?');

        modalInstance.result.then( function ( result ) {
            if (result) {
                Conferences.fetch().delete({cid: cid})
                    .$promise.then( function ( response ) {
                        if (response.status == 'success') {
                            popup.alert('success', 'Conference successfully deleted');
                        } else {
                            popup.error('Error');
                        }
                    }, function () {
                        popup.connection();
                    })
            }
        })
    };

    show = function(events) {
    	alert("hi");
		if (events.show == false) {
			events.show = true;
		}
	}

    $scope.goCreateEvent = function (cid, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        $state.go('create-event', {conferenceId: cid});
    }

    $scope.goAccommodations = function(id, event){  
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        $state.go('manage-accommodations', {conferenceId: id});
    }

    $scope.goTransportation = function(id, event){  
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        $state.go('manage-transportation', {conferenceId: id});
    }

})