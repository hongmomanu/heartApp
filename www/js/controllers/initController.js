/**
 * Created by jack on 15-9-18.
 */

var remoteloaded=true;
angular.module('app.controllers')
  .controller('initController', function ($scope,$state, $interval, $timeout, $ionicModal, $rootScope, $ionicLoading) {
    if (!localStorage.totaltimes)localStorage.totaltimes = 1;
    if (!localStorage.showlines)localStorage.showlines = 10;
    if (!localStorage.tip)localStorage.tip = "温馨提示：常规过号人员自动退后5位，其他项目自动退后3位!";
    $scope.socket = null;
    $scope.speaktimes = 0;
    $scope.playlist = [];
    $scope.isplay=true;
    $scope.isplaying = false;
    $scope.callingindex = 0;



    $scope.maketip=function(){

        $("#marquee").html(localStorage.tip);
        $("#marquee").marquee({
          //speed in milliseconds of the marquee
          duration: 35000,
          //gap in pixels between the tickers
          gap: 50,
          //time in milliseconds before the marquee will start animating
          delayBeforeStart: 1000,
          pauseOnCycle:1000,
          //'left' or 'right'
          direction: 'left',
          //true or false - should the marquee be duplicated to show an effect of continues flow
          duplicated: true
        });

    };

    $scope.maketip();

    $scope.configdata = localStorage.configdata ? JSON.parse(localStorage.configdata) : {areaname:'心电图排队叫号',areanum:'heartbig'};


    console.log('initController');

    $ionicModal.fromTemplateUrl(localStorage.serverurl+'app/big/templates/config.html?t='+(new Date().getTime()), {
      scope: $scope
    }).then(function (modal) {
      $scope.configmodal = modal;
      $rootScope.$broadcast('initWebSocket', $scope);

    });

    //make config
    $scope.makeConfig = function (configdata) {
      localStorage.configdata = JSON.stringify(configdata);
      localStorage.serverurl=configdata.serverurl;
      $scope.configmodal.hide();
      window.location.reload();

    };




    $scope.playvoice = function (text) {
      $scope.speaktimes++;
      try {
        //navigator.speech.startSpeaking( text , {voice_name: 'xiaoyan',speed: localStorage.speed} );
        navigator.speech.startSpeaking(text[0], {voice_name: 'xiaoyan', speed: '30'});
        setTimeout(function () {
          navigator.speech.startSpeaking(text[1] + '.' + text[1], {voice_name: 'xiaoyan', speed: '10'});
        }, 2000);


        setTimeout(function () {
          navigator.speech.startSpeaking(text[2], {voice_name: 'xiaoyan', speed: '30'});
        }, (function (str) {
          if (!str || str == "")return 6000;
          else if (str.length == 2)return 5400;
          else if (str.length == 3)return 6400;
          else if (str.length == 4)return 6800;
          else return 6000;
        }(text[1])));


      } catch (e) {
      }
      finally {
        setTimeout(function () {
          if ($scope.speaktimes >= localStorage.totaltimes) {
            $scope.speaktimes = 0;
            delete $scope.playlist[$scope.callingindex];

            $scope.callingindex++;
            $ionicLoading.hide();
            $interval.cancel($scope.timer);
            $scope.makevoiceanddisplay();
          } else {
            //tipvoice.removeEventListener('ended',voiceEnd,false);

            $scope.playvoice(text);
          }
        }, 10000);
      }
      ;
    };


    $scope.showcallmsg = function (item) {
      $ionicLoading.show({
        template: '<div id="showmsg" style="font-size: 10px; line-height: normal;text-align: left;">' + '<a style="font-weight: bold">序号:' + item.hzxh + '</a>'
        + '<br><a style="font-weight: bold">姓名:' + item.hzxm + '</a>'
        + '<br><a style="font-weight: bold">诊室:' + item.zsmc + '</a>'
        + '</div>',
        animation: 'fade-in',
        /*maxWidth: 200,*/
        showBackdrop: false

      });
      $timeout(function () {
        $('#showmsg').animate({fontSize:'7em'},'slow');
      }, 100);

    };
    $scope.makevoiceanddisplay = function () {

      if (($scope.playlist.length - 1) >= $scope.callingindex) {


        var item = $scope.playlist[$scope.callingindex];
        //var text="请 "+item.showno+item.patname+" 到"+item.roomname+"机房门口等候检查";
        var text = ["请 " + item.hzxh, item.hzxm, " 到" + item.zsmc + "准备就诊"];
        //console.log(text);

        $scope.showcallmsg(item);
        $scope.timer = $interval(function () {
          $ionicLoading.hide();

          $timeout(function () {
            $scope.showcallmsg(item);
          }, 500);
        }, 3500)

        $scope.playvoice(text);

      } else {
        $scope.isplaying = false;
        /*me.isplaying=false;
         me.playlist=[];*/
        /*navigator.speech.removeEventListener("SpeakCompleted",function(){});
         navigator.speech.stopSpeaking();*/
      }


    };

    $scope.makeSpeak = function (data) {
      $scope.playlist = $scope.playlist.concat(data);
      if (!$scope.isplaying) {
        $scope.isplaying = true;
        $scope.makevoiceanddisplay();
      }
      //console.log(data);
    };


  });
