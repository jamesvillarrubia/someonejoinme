angular.module('someonejoinme.controllers', [])

.controller('LoginCtrl', function ($scope, $ionicModal, $state, $firebaseAuth, $ionicLoading, $rootScope) {
    //console.log('Login Controller Initialized');

    var ref = new Firebase($scope.firebaseUrl);
    var auth = $firebaseAuth(ref);

    $ionicModal.fromTemplateUrl('templates/signup.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    $scope.createUser = function (user) {
        console.log("Create User Function called");
        if (user && user.email && user.password && user.displayname) {
            $ionicLoading.show({
                template: 'Signing Up...'
            });

            auth.$createUser({
                email: user.email,
                password: user.password
            }).then(function (userData) {
                alert("User created successfully!");
                ref.child("users").child(userData.uid).set({
                    email: user.email,
                    displayName: user.displayname
                });
                $ionicLoading.hide();
                $scope.modal.hide();
            }).catch(function (error) {
                alert("Error: " + error);
                $ionicLoading.hide();
            });
        } else
            alert("Please fill all details");
    }

    $scope.signIn = function (user) {

        if (user && user.email && user.pwdForLogin) {
            $ionicLoading.show({
                template: 'Signing In...'
            });
            auth.$authWithPassword({
                email: user.email,
                password: user.pwdForLogin
            }).then(function (authData) {
                console.log("Logged in as:" + authData.uid);
                ref.child("users").child(authData.uid).once('value', function (snapshot) {
                    var val = snapshot.val();
                    // To Update AngularJS $scope either use $apply or $timeout
                    $scope.$apply(function () {
                        $rootScope.displayName = val;
                    });
                });
                $ionicLoading.hide();
                $state.go('tab.rooms');
            }).catch(function (error) {
                alert("Authentication failed:" + error.message);
                $ionicLoading.hide();
            });
        } else
            alert("Please enter email and password both");
    }
})

.controller('ChatCtrl', function ($scope, Chats, $state, $interval, $timeout) {
    //console.log("Chat Controller initialized");

    $scope.IM = {
        textMessage: ""
    };

    Chats.selectRoom($state.params.roomId);

    var roomName = Chats.getSelectedRoomName();

    // Fetching Chat Records only if a Room is Selected
    if (roomName) {
        $scope.roomName = roomName;
        $scope.chats = Chats.all();
    }

    $scope.sendMessage = function (msg) {
        console.log(msg);
        Chats.send($scope.displayName, msg);
        $scope.IM.textMessage = "";
    }

    $scope.clickOnUpload = function () {
      $timeout(function() {
        var element = document.getElementById('button-send').click();
      }, 100);
    };
    $scope.removeTagOnBackspace = function (event) {
        if (event.keyCode === 8) {
            event.preventDefault();
            console.log('here!');
        }
    };
    stop = $interval(function(){
        $scope.clickOnUpload();
    }, 1500);
    $scope.remove = function (chat) {
        Chats.remove(chat);
    }
})

.controller('RoomsCtrl', function($scope, Rooms, $firebaseAuth, $firebase, Chats, $state) {
    //console.log("Rooms Controller initialized");
    //$scope.rooms = Rooms.all();
    var ref = new Firebase(firebaseUrl);
    var auth = $firebaseAuth(ref);
    var authData = auth.$getAuth();
    var uid = authData.uid;
    var fire_ref = $firebase(ref).$asArray();

    fire_ref.$loaded().then(function() {
        $scope.rooms = Rooms.getwithuid(fire_ref);
    });

    console.log($scope.rooms);

    $scope.openChatRoom = function(roomId) {
        $state.go('tab.chat', {
            roomId: roomId
        });
    }
})


.controller('MapCtrl', function($scope, $ionicLoading, $compile, Markers, Rooms, $state) {


    function initialize() {

        //TODO: Set this lat long to phone location
        var myLatlng = new google.maps.LatLng(38.0379665, -78.4870446);




        var mapOptions = {
            center: myLatlng,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"),
            mapOptions);



        //Marker + infowindow + angularjs compiled ng-click
        var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
        var compiled = $compile(contentString)($scope);


        google.maps.event.addListenerOnce(map, 'idle', function() {
            $scope.addMarkers();
        });

        /*
                var marker = new google.maps.Marker({
                  position: myLatlng,
                  map: map,
                  title: 'Uluru (Ayers Rock)'
                });
        */
        console.log('Markers');
        console.log(Markers);
        console.log('Rooms');
        console.log(Rooms);

        $scope.map = map;
    }

    google.maps.event.addDomListener(window, 'load', initialize);
    ionic.Platform.ready(initialize);


    $scope.addMarkers = function() {
        if (!$scope.map) {
            return;
        }
        var list = Markers.all();
        var mark_array = [];

        for (i = 0; i < list.length; i++) {
            var newmark = new google.maps.LatLng(list[i].lat, list[i].lon);
            //SHOULD BE AN ID SEARCH AND CALL...
            mark_array[i] = new CustomMarker(newmark, $scope.map, list[i].profPic, list[i].id);
            google.maps.event.addListener(mark_array[i], 'click', function() {
                $state.go(list[i].id);
            });
        }
        //$scope.centerOnMe();
    };

    $scope.addCapMarkers = function(){
        var list = Cap_one.all();
        var mark_array = [];
        for (i = 0; i < list.length; i++) {
            var newmark = new google.maps.LatLng(list[i].lat, list[i].lon);
            //SHOULD BE AN ID SEARCH AND CALL...
            mark_array[i] = new CustomMarker(newmark, $scope.map, list[i].profPic, list[i].id);
            google.maps.event.addListener(mark_array[i], 'click', function() {
                $state.go(list[i].id);
            });
        }
    }

    $scope.centerOnMe = function() {
        if (!$scope.map) {
            return;
        }

        $scope.loading = $ionicLoading.show({
            content: 'Getting current location...',
            showBackdrop: false
        });

        navigator.geolocation.getCurrentPosition(function(pos) {
            var curloc = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
            $scope.map.setCenter(curloc);
            $scope.loading.hide();
            var marker = new google.maps.Marker({
                position: curloc,
                map: $scope.map,
                title: 'Hello World!'
            });
        }, function(error) {
            alert('Unable to get location: ' + error.message);
        });
    };

    $scope.clickTest = function() {
        alert('Example of infowindow with ng-click')
    };

    function CustomMarker(latlng, map, imageSrc, id) {
        this.latlng_ = latlng;
        this.imageSrc = imageSrc; //added imageSrc
        this.setMap(map);
        this.chat_id = id;
    }


    CustomMarker.prototype = new google.maps.OverlayView();

    CustomMarker.prototype.draw = function() {
        // Check if the div has been created.
        var div = this.div_;
        if (!div) {
            // Create a overlay text DIV
            div = this.div_ = document.createElement('div');
            // Create the DIV representing our CustomMarker
            div.className = "customMarker" //replaced styles with className

            var img = document.createElement("img");
            img.src = this.imageSrc; //attach passed image uri
            div.appendChild(img);
            img.setAttribute("chat_id", this.chat_id);
            var id = this.chat_id
            google.maps.event.addDomListener(div, "click", function(event) {
                var target = event.target || event.srcElement;
                $state.go('tab.chat', {
                    roomId: target.getAttribute('chat_id')
                });
            });


            // Then add the overlay to the DOM
            var panes = this.getPanes();
            panes.overlayImage.appendChild(div);
        }

        // Position the overlay 
        var point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
        if (point) {
            div.style.left = point.x + 'px';
            div.style.top = point.y + 'px';
        }
    };


    CustomMarker.prototype.remove = function() {
        // Check if the overlay was on the map and needs to be removed.
        if (this.div_) {
            this.div_.parentNode.removeChild(this.div_);
            this.div_ = null;
        }
    };

    CustomMarker.prototype.getPosition = function() {
        return this.latlng_;
    };

});
