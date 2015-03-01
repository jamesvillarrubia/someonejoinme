angular.module('someonejoinme.controllers',[]).controller('LoginController',['$scope','FIREBASE_REF','$firebaseSimpleLogin','userSession',function($scope,FIREBASE_REF,$firebaseSimpleLogin,userSession){
    userSession.auth=$firebaseSimpleLogin(new Firebase(FIREBASE_REF));
    $scope.login=function(provider){
        userSession.auth.$login(provider);
    }
}]);