var app = angular.module('signupConfCtrl', []);
app.controller('signupConferenceController', function($scope, $stateParams, Conferences, Countries, Profile, popup, $rootScope, $filter, $state) {

    $scope.calendar = [];
    // Only for depart calendar
    $scope.calendar2 = [];
    $scope.today = new Date();

    $scope.accordionIsOpen = [];

    $scope.countries = Countries;
    $scope.header = "Signup";

    $scope.changeCountry = function(country) {
        $scope.citiesOnly.componentRestrictions = { country: country.code };
    };

    $scope.citiesOnly = {
        types: ['(cities)']
    };

    $scope.emergencyContact = {
        contact_first_name: null,
        contact_last_name: null,
        contact_phone: null,
        contact_email: null
    }

    $scope.conference = {
        conferenceId: $stateParams.conferenceId,
        name: $stateParams.name
    }

    $scope.arrival = {
        arrv_ride_req: false,
        arrv_flight: null,
        arrv_airport: null,
        arrv_date: null,
        arrv_time: null
    }

    $scope.departure = {
        dept_ride_req: false,
        dept_airport: null,
        dept_flight: null,
        dept_date: null,
        dept_time: null
    }

    $scope.familyMembers = [];

    $scope.members = [];

    $scope.loadProfiles = function() {
        Profile.query({ uid: $rootScope.user.id })
            .$promise.then( function ( response ) {
                if ( response ) {
                    var profiles = [];
                    for (var i=0; i < response.length; i++) {
                        var date = response[i].birthdate.split('-');
                        response[i]['profile_id'] = response[i]['id'];
                        delete response[i]['id'];
                        //response[i].country = null;
                        //response[i].city = null;
                        delete response[i]['user_id'];
                        response[i].birthdate = new Date(parseInt(date[0]), parseInt(date[1])-1, parseInt(date[2]));
                        if (response[i]['is_owner']) {
                            delete response[i]['is_owner'];
                            $scope.user = response[i];
                        } else {
                            delete response[i]['is_owner'];
                            profiles.push(response[i]);
                        }
                    }
                    $scope.members = profiles;
                } else {
                }
            })
    }
    $scope.loadProfiles();

    $scope.conference = {
        conferenceId: $stateParams.conferenceId,
        name: $stateParams.name
    }

    $scope.accommodations = [];

    $scope.loadAccommodations = function () {
      Conferences.accommodations().query( {cid: $stateParams.conferenceId} )
          .$promise.then( function( response ) {
              if ( response ) {
                  $scope.accommodations = response;
              } else {
                // TODO error
              }
          })
    }

    $scope.loadAccommodations();

    $scope.accommodation = {
        accommodation_req: false,
        accommodation_pref: null
    }

    $scope.signupMember = function (member, $index) {
        if ($scope.familyMembers[$index]) {
            delete $scope.familyMembers[$index];
            $scope.accordionIsOpen[$index] = false;
        } else {
            var newSignup = {
                profile_id: member.profile_id,
                first_name: member.first_name,
                middle_name: member.middle_name,
                last_name: member.last_name,
                birthdate: member.birthdate,
                gender: member.gender,
                arrv_ride_req: $scope.arrival.arrv_ride_req,
                arrv_flight: $scope.arrival.arrv_flight,
                arrv_airport: $scope.arrival.arrv_airport,
                arrv_date: $scope.arrival.arrv_date,
                arrv_time: $scope.arrival.arrv_time,
                dept_ride_req: $scope.departure.dept_ride_req,
                dept_airport: $scope.departure.dept_airport,
                dept_flight: $scope.departure.dept_flight,
                dept_date: $scope.departure.dept_date,
                dept_time: $scope.departure.dept_time,
                accommodation_req: $scope.accommodation.accommodation_req,
                accommodation_pref: $scope.accommodation.accommodation_pref
            }
            $scope.familyMembers[$index] = newSignup;
            $scope.accordionIsOpen[$index] = true;
        }
    }

    var processMembers = function (family) {
        var result = [];
        for (var i=0; i < family.length; i++) {
            if (family[i]) {
                var member = angular.extend({}, family[i]);
                member.birthdate = $filter('date')(member.birthdate, 'yyyy-MM-dd');
                member.arrv_time = $filter('date')(member.arrv_time, 'HH:mm');
                member.arrv_date = $filter('date')(member.arrv_date, 'yyyy-MM-dd');
                member.dept_time = $filter('date')(member.dept_time, 'HH:mm');
                member.dept_date = $filter('date')(member.dept_date, 'yyyy-MM-dd');
                member.phone = $scope.user.phone;
                member.contact_first_name = $scope.emergencyContact.contact_first_name,
                member.contact_last_name = $scope.emergencyContact.contact_last_name,
                member.contact_phone = $scope.emergencyContact.contact_phone,
                member.contact_email = $scope.emergencyContact.contact_email,
                member.country = $scope.user.country;
                member.city = $scope.user.city;
                result.push(member);
            }
        }
        return result;
    }

    var signup = function (profile) {
		Conferences.attendees().save({ cid: $scope.conference.conferenceId }, profile)
            .$promise.then(function(response) {
                if (response.status == 200) {
                    popup.alert('success', 'You have been successfully signed up for approval to attend this conference.');
                    $state.go('conference', { conferenceId: $scope.conference.conferenceId });
                } else {
                    popup.error('Error', response.message);
                }
            });
    }

    $scope.submitRequest = function() {
    	var members = processMembers($scope.familyMembers);
        if ($scope.profileForm.$valid && $scope.contactForm.$valid && $scope.arrivalForm.$valid && $scope.departureForm.$valid && $scope.accommForm.$valid && checkDates(members)) {
            var city, country = null;
            if ( $scope.user.city ) {
                city = $scope.user.city;
                if ( $scope.user.city.formatted_address ) {
                    city = $scope.user.city.formatted_address;
                }
            }

            if ( $scope.user.country ) {
                country = $scope.user.country;
                if ( $scope.user.country.name ) {
                    country = $scope.user.country.name;
                }
            }
            $scope.user.country = country;
            $scope.user.city = city;
            var profile = angular.extend({}, $scope.user);
            delete profile['updated_at'];
            angular.extend(profile, $scope.accommodation);
            angular.extend(profile, $scope.arrival);
            angular.extend(profile, $scope.departure);
            angular.extend(profile, $scope.emergencyContact);
            profile.arrv_time = $filter('date')(profile.arrv_time, 'HH:mm');
            profile.dept_time = $filter('date')(profile.dept_time, 'HH:mm');
            profile.birthdate = $filter('date')(profile.birthdate, 'yyyy-MM-dd');
            profile.arrv_date = $filter('date')(profile.arrv_date, 'yyyy-MM-dd');
            profile.dept_date = $filter('date')(profile.dept_date, 'yyyy-MM-dd');
            for (var i=0; i<members.length; i++) {
                signup(members[i]);
            }
            signup(profile);
        } else {
            popup.alert('warning', 'Make sure you fill in all required (*) fields.');
        }
    }

    $scope.resetFields = function (object) {
        angular.forEach(object, function (value, key) {
            if (typeof(object[key]) === 'boolean') {} else {
                object[key] = null;
            }
        })
    }

    var checkDates = function (members) {
    	var isOkay = true;
    	for (var i=0; i<members.length; i++) {
    		if (members[i]) {
    			var isDateAfter = $scope.isDateAfter(members[i].arrv_date, members[i].dept_date);
    			if (!isDateAfter) {
    				popup.error('Invalid Transportation Dates', 'Check members\' departure date is after arrival date');
    			}
    			isOkay = isOkay && $scope.isDateAfter(members[i].arrv_date, members[i].dept_date);
    		}
    	}
    	return isOkay;
    }

    // returns if date 2 is after date1
    $scope.isDateAfter = function (date1, date2) {
    	if (!date1 || !date2) return true;
        var start = new Date(date1);
        var end = new Date(date2);
        if (end.getTime() > start.getTime()) {
            return true;
        } else {
            return false;
        }
    }

    $scope.isDateAfterForm = function (date1, date2) {
    	if (date1 && date2) {
	        var start = new Date(date1);
	        var end = new Date(date2);
	        if (end.getTime() > start.getTime()) {
	            $scope.departureForm.departDate.$invalid = false;
	        } else {
	            $scope.departureForm.departDate.$invalid = true;
	        }
	    }
    }

})
