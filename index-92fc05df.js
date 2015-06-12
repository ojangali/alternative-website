angular.module('angularbanking', ['firebase', 'ui.router']);

'use strict';

angular.module('angularbanking')
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
  $urlRouterProvider.otherwise('/');

  $stateProvider
  .state('home', {url: '/', templateUrl: '/views/general/home.html'})
  .state('about', {url: '/about', templateUrl: '/views/general/about.html'})
  .state('faq', {url: '/faq', templateUrl: '/views/general/faq.html'})
  .state('contact', {url: '/contact', templateUrl: '/views/general/contact.html'})
  .state('register', {url: '/register', templateUrl: '/views/users/users.html', controller: 'UsersCtrl'})
  .state('login', {url: '/login', templateUrl: '/views/users/users.html', controller: 'UsersCtrl'})
  .state('accounts', {url: '/accounts', templateUrl: '/views/accounts/accounts.html', controller: 'AccountsCtrl'});

}]);

'use strict';

angular.module('angularbanking')
.constant('firebaseUrl', 'https://angularbankingomid.firebaseio.com/');

'use strict';

angular.module('angularbanking')
.run(['$rootScope', '$window', '$firebaseAuth', 'firebaseUrl', function($rootScope, $window, $firebaseAuth, firebaseUrl){
  $rootScope.fbRoot = new $window.Firebase(firebaseUrl);
  $rootScope.afAuth = $firebaseAuth($rootScope.fbRoot);
}]);

'use strict';

window.swal.setDefaults({
  allowEscapeKey: true,
  allowOutsideClick: true,
  showConfirmButton: true
});

'use strict';

angular.module('angularbanking')
.factory('User', ['$rootScope', function($rootScope){

  function User(){
  }

  User.register = function(user){
    return $rootScope.afAuth.$createUser(user);
  };

  User.login = function(user){
    return $rootScope.afAuth.$authWithPassword(user);
  };

  User.logout = function(){
    return $rootScope.afAuth.$unauth();
  };

  return User;
}]);

'use strict';

angular.module('angularbanking')
.controller('AccountsCtrl', ['$scope', 'Account', function($scope, Account){
  var afUser = Account.init();
  afUser.$loaded().then(syncNames);

  $scope.addAccount = function(name){
    Account.add(name).then(syncNames);
    $scope.accountName = '';
  };

  $scope.addTransaction = function(name, tx){
    Account.addTransaction(name,tx);
  };


  function syncNames(){
    $scope.names = afUser.names ? afUser.names.split(',') : [];
  }
}]);

'use strict';
angular.module('angularbanking')
.factory('Account', ['$rootScope', '$firebaseObject', '$firebaseArray', function($rootScope, $firebaseObject, $firebaseArray){
  var fbUser;
  var afUser;

  function Account(){

  }

  Account.init = function(){
    fbUser = $rootScope.fbRoot.child('user/' + $rootScope.activeUser.uid);
    afUser = $firebaseObject(fbUser);
    return afUser;
  };

  Account.addTransaction = function(name,tx){
    var fbTransactions = fbUser.child('accounts/' + tx.type);
    var afTransactions = $firebaseArray(fbTransactions);
    afTransactions.$add(tx);
  };

  Account.add = function(name){
    var names = afUser.names ? afUser.names.split(',') : [];
    names.push(name);

    afUser.names = names.join(',');
    return afUser.$save();
  };
  return Account;
}]);

'use strict';

angular.module('angularbanking')
.controller('NavCtrl', ['$rootScope', '$scope', '$state', 'User', function($rootScope, $scope, $state, User){

  $scope.afAuth.$onAuth(function(data){
    if(data){
      $rootScope.activeUser = data;
    }else{
      $rootScope.activeUser = null;
    }

    $state.go('home');
  });

  $scope.logout = function(){
    User.logout();
  };
}]);

'use strict';

angular.module('angularbanking')
.controller('UsersCtrl', ['$scope', '$state', '$window', 'User', function($scope, $state, $window, User){
  $scope.name = $state.current.name;

  $scope.submit = function(user){
    if($scope.name === 'register'){
      User.register(user)
      .then(function(){
        $state.go('login');
      })
      .catch(function(){
        $window.swal({title: 'Registration Error', text: 'There was a problem with your registration. Please try again.', type: 'error'});
      });
    }else{
      User.login(user)
      .catch(function(){
        $window.swal({title: 'Login Error', text: 'There was a problem with your login. Please try again.', type: 'error'});
      });
    }
  };
}]);
