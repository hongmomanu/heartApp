/**
 * Created by jack on 15-8-14.
 */
angular.module('app.controllers')
  .run(function($rootScope,$timeout,$state,$interval,$ionicSlideBoxDelegate){


    $rootScope.$on('initWebSocket', function (event, $scope) {
      //$scope.configmodal.show();
      var socket=null;


      var makeautostart=function(){
        try{
          cordova.plugins.autoStart.enable();
        }catch(e){

        }finally{

        }
      }
      makeautostart();

      var websocketInit=function(){
        //if(!$scope.configdata.serverurl)$scope.configdata.serverurl=localStorage.serverurl;
        $scope.configdata.serverurl=localStorage.serverurl;

        var url=$scope.configdata.serverurl;
        var areanum=$scope.configdata.areanum;
        if(!url||url==""){
          //Ext.Msg.alert('提示','服务地址为空');
          $scope.configmodal.show();
          return ;
        }
        if(!areanum||areanum==""){
          //Ext.Msg.alert('提示','诊区为空');
          $scope.configmodal.show();
          return ;
        }

        url=url.replace(/(:\d+)/g,":"+(eval(url.match(/(:\d+)/g)[0].slice(1))+1));
        url=url.replace("http","ws");


        socket = new WebSocket(url);

        socket.onmessage = function(event) {
          var res=JSON.parse(event.data);
          $timeout(function(){
            if(res.type=="bigscreendata"){



              /*for(var i=0;i<16;i++){

                if(i<res.data.length){
                  res.data[i].data=res.data[i].data.slice(0,localStorage.showlines);
                  $scope["data"+(i+1)]=res.data[i];
                }
                else $scope["data"+(i+1)]=[];
              }*/



            }else if(res.type=="callpatient"){
              //$state.go('index');
              if(res.status==0){
                $scope.removePatient(res);
                $scope.callPatient(res);
                $scope.removePassedPatient(res);
                $scope.makeSpeak(res);
              }else if(res.status==1){
                $scope.removePatient(res);
              }else if(res.status==2){
                $scope.removePatient(res);
              }else if(res.status==3){
                $scope.removePatient(res);
                $scope.addPassedPatient(res);

              }


            }else if(res.type=="changeroom"){
              $scope.configdata.areanum=res.data.newno;
              $scope.configdata.areaname=res.data.newname;
              localStorage.configdata=JSON.stringify($scope.configdata);
              window.location.href=""

            }else if(res.type=='firetip'){

              $rootScope.$broadcast('firetip', $scope,res);

            }else if(res.type=='freshsystem'){
              window.location.href="";
            }
            else if(res.type=='fireprop'){
              localStorage[res.name]=res.value;
              if(res.name=='tip'){
                $scope.maketip();
              }

            }
          },0);

        };
        socket.onclose = function(event) {
          $timeout(function(){
            websocketInit();
          },3000);
        };

        socket.onopen = function() {

          socket.send(JSON.stringify({
            type:"mainscreen",
            content: areanum
          }));

        };


      }
      //init websocket;
      websocketInit();


    });
  })
