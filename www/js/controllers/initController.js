/**
 * Created by jack on 15-9-18.
 */

var remoteloaded=true;
angular.module('app.controllers')
  .controller('initController', function ($scope,$state, $interval, $timeout, $ionicModal, $rootScope, $ionicLoading) {
    if (!localStorage.totaltimes)localStorage.totaltimes = 1;
    if (!localStorage.showlines)localStorage.showlines = 4;
    if (!localStorage.tip)localStorage.tip = "温馨提示：常规过号人员自动退后5位，其他项目自动退后3位!";
    $scope.socket = null;
    $scope.speaktimes = 0;
    $scope.playlist = [];
    $scope.isplay=true;
    $scope.isplaying = false;
    $scope.callingindex = 0;
    $scope.data0=[];
    $scope.data1=[];
    $scope.data2=[];
    $scope.data3=[];
    $scope.data4=[];


    $timeout(function(){
      $('#passeddiv').height($('tbody').height()-50);
    },1000);



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


    $scope["data0"]=[{lineno:"A001",name:"jack"},{lineno:"A001",name:"jack"},{lineno:"A001",name:"jack"},{lineno:"A001",name:"jack"}];



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
        template: '<div id="showmsg" style="font-size: 10px; line-height: normal;text-align: center;">'
        + '<a style="font-weight: bold">' + item.name + '</a>'
        + '<br><a style="font-weight: bold">第' + item.room + '诊室</a>'
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
        var text = ["请 " + item.lineno, item.name, " 到第" + item.room+"诊室" + "准备检查"];
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

    $scope.callPatient = function (data) {

      console.log($scope['data'+data.room].length);
      console.log(localStorage.showlines);
      if($scope['data'+data.room].length==localStorage.showlines){
        console.log(localStorage.showlines);
        $scope['data'+data.room]=$scope['data'+data.room].slice(1);
      }
      $scope['data'+data.room].push(data);
      //console.log(data);
    };
    $scope.removePatient=function(data) {
      for (var i = 0; i < $scope['data'+data.room].length; i++) {
        if ($scope['data'+data.room][i].lineno == data.lineno) {

          $timeout(function () {
            $scope['data'+data.room].splice(i, 1);
          }, 0);
          break;
        }
      }
    };
    $scope.addPassedPatient=function(data) {
      $scope['data0'].push(data);

      $timeout(function () {
        if($('#tablemain').height()<($('#passeddiv').find('.list').height()+50)){
          var scrollelement=$('#passeddiv').find('ion-scroll');
          scrollelement.scrollTo('max', 500);

            if(!$scope.scrolltimer){
              $scope.scrolltimer = $interval(function () {

                if(scrollelement.find('.list').height()<=(scrollelement.height()+scrollelement.scrollTop()+10)){
                  scrollelement.scrollTo(0,500);
                }else{
                  scrollelement.scrollTo('+=108',500);
                }
              }, 3500)
            }
        }

      },500)

    };
    $scope.removePassedPatient=function(data) {

      for (var i = 0; i < $scope['data0'].length; i++) {
        if ( $scope['data0'][i].lineno == data.lineno) {
          $timeout(function () {
            $scope['data0'].splice(i, 1);
          }, 0);
          break;
        }
      }
    }


  });
