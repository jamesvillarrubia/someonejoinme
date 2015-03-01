angular.module('someonejoinme.services', ['firebase'])
    .factory("Auth", ["$firebaseAuth", "$rootScope",
    function ($firebaseAuth, $rootScope) {
            var ref = new Firebase(firebaseUrl);
            return $firebaseAuth(ref);
}])

.factory('Chats', function ($firebase, Rooms) {

    var selectedRoomId;

    var ref = new Firebase(firebaseUrl);
    var chats;

    return {
        all: function () {
            return chats;
        },
        remove: function (chat) {
            chats.$remove(chat).then(function (ref) {
                ref.key() === chat.$id; // true item has been removed
            });
        },
        get: function (chatId) {
            for (var i = 0; i < chats.length; i++) {
                if (chats[i].id === parseInt(chatId)) {
                    return chats[i];
                }
            }
            return null;
        },
        getSelectedRoomName: function () {
            var selectedRoom;
            if (selectedRoomId && selectedRoomId != null) {
                selectedRoom = Rooms.get(selectedRoomId);
                if (selectedRoom)
                    return selectedRoom.name;
                else
                    return null;
            } else
                return null;
        },
        selectRoom: function (roomId) {
            console.log("selecting the room with id: " + roomId);
            selectedRoomId = roomId;
            if (!isNaN(roomId)) {
                chats = $firebase(ref.child('rooms').child(selectedRoomId).child('chats')).$asArray();
            }
        },
        send: function (from, message) {
            console.log("sending message from :" + from.displayName + " & message is " + message);
            if (from && message) {
                var chatMessage = {
                    from: from.displayName,
                    message: message,
                    createdAt: Firebase.ServerValue.TIMESTAMP
                };
                chats.$add(chatMessage).then(function (data) {
                    console.log("message added");
                });
            }
        }
    }
})

/**
 * Simple Service which returns Rooms collection as Array from Salesforce & binds to the Scope in Controller
 */
.factory('Rooms', ["$firebaseAuth", "$rootScope","$firebase", function ($firebaseAuth, $rootScope,$firebase) {
    // Might use a resource here that returns a JSON array

    var ref = new Firebase(firebaseUrl);
    var rooms = $firebase(ref.child('rooms')).$asArray();
    var users = $firebase(ref.child('users')).$asArray();
    var markers = $firebase(ref.child('markers')).$asArray();
    var auth = $firebaseAuth(ref);

    var authData = auth.$getAuth();
    var uid = authData.uid;

    return {
        all: function () {

            var rooms = [
                {'name':'yes','id':"1"}
            ];
            return rooms;
        },
        getwithuid: function(fire_ref){

            var authData = auth.$getAuth();
            var uid = authData.uid;
            console.log(fire_ref);
            var perm = fire_ref[fire_ref.$indexFor('permissions')];
            var pl = Object.keys(perm).length;
            var users = fire_ref[fire_ref.$indexFor('users')];
            var face = fire_ref[fire_ref.$indexFor('facebook')];
            var rooms = new Array();
            for(var k in perm){
                
                if (k == uid){
                    for(i=0; i<perm[uid].length;i++){
                        var obj = {};
                        obj.name = users[perm[uid][i].partner]['displayName'];
                        obj.icon = 'http://graph.facebook.com/'+face[perm[uid][i].partner]['username']+'/picture';
                        obj.id = perm[uid][i].chat;
                        rooms.push(obj);
                    }
                }
            }
            console.log(rooms);
            return rooms;
           

/*
            var set = perm.$indexFor(uid);
            var perm_rooms = {}
            for(i=0; i<set.length; i++){
                var keypair = set[i];
                var chat_id = keypair[0];
                var partnername = '';
                for(var pname in keypair) {
                    partnername = pname;
                }
                perm_rooms[i] = ref.child('rooms').child(chat_id);
                perm_rooms[i][chat_id].name = partnername;
            }
            console.log(perm_rooms);
            return perm_rooms;
          */  
        },
        get: function (roomId) {
            // Simple index lookup
            console.log(rooms);
            return rooms.$getRecord(roomId);
            
        }
    }
}])

.factory('Markers', function ($firebase) {
    // Might use a resource here that returns a JSON array
    var ref = new Firebase(firebaseUrl);
    var markers = $firebase(ref.child('markers')).$asArray();

    return {
        all: function () {
            return markers;
        },
        get: function (markerId) {
            // Simple index lookup
            return markers.$getRecord(markerId);
            console.log(markers);
        }
    }
});