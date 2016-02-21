'use strict';

//socket io
let socket;

//p5
let colorPickerSelectSatBriSketch_p5;

//scketch
let users = {};//チャットルームメンバーごとのデータ管理テーブル（各メンバーごとにストロークデータをストック）
let lines = [];//pathドローイング用、描画する全てのストロークを保持
let myData;
let myID;
let myColor;
let myAngle = 0;
let myDiff = 0;
let myPattern = 'path';
let myBorderW;
let myDragFlag = false;
let myHistoryPoints = [];
let myPathArr = [];
let myPath = {};
let myCurrentP = {x:-9999,y:-9999};
let myPrevP = {x:-9999,y:-9999};

//dom
let panel;
let panelInnerBox;
let selectBox;
let clearBtn;
let ttl;
let chatInfo;
let ttlChatNum;
let chatNum;
let colorPicker__selectSatBri;
let colorPicker__selectHue;
let ttlSliderAlpha;
let ttlSliderBorderW;
let sliderAlpha;
let sliderBorderW;

//
let pickerHue = 360;


/*--

  canvas main

------------------------------------*/
let scketch = function(p){

  let thisRenderer2dObj;

  p.setup = function(){
    p.frameRate(40);
    thisRenderer2dObj = p.createCanvas(p.windowWidth, p.windowHeight);
    thisRenderer2dObj.parent('mainCanvasWrapper');
    thisRenderer2dObj.id('mainCanvas');
    //p.blendMode(p.ADD);
    p.background(255);
    //p.color() で送るとサーバーから受け取るときに型がp5から普通のobjectに変わってしまうのでだめ
    //myColor = p.color(p.floor(p.random(255)),p.floor(p.random(255)),p.floor(p.random(255)),p.floor(p.random(255)));

    /*
      コンパネ作成
    --------------------------------------*/
    panel = p.createDiv('');
    panel.id('panel');

    panelInnerBox = p.createDiv('');
    panelInnerBox.id('panelInnerBox');
    panel.child(panelInnerBox);

    ttlChatNum = p.createP('number of people');
    ttlChatNum.id('ttlChatNum');
    panelInnerBox.child('ttlChatNum');

    chatNum = p.createP('');
    chatNum.id('chatNum');
    panelInnerBox.child(chatNum);

    selectBox = p.createSelect();
    selectBox.id('selectPattern');
    selectBox.class('form-control');
    selectBox.option('path');
    selectBox.option('line');
    selectBox.option('circle');
    selectBox.option('rect');
    selectBox.option('triangle');
    selectBox.changed(mySelectEvent);
    selectBox.value('triangle');
    panelInnerBox.child(selectBox);

    clearBtn = p.createButton('clear your canvas');
    clearBtn.id('clearBtn');
    clearBtn.class('btn btn-default');
    clearBtn.mouseClicked(clearCanvas);
    panelInnerBox.child(clearBtn);

    // chatInfo = p.createDiv('');
    // chatInfo.id('chatInfo');
    // panelInnerBox.child(chatInfo);

    ttlSliderAlpha = p.createP('alpha');
    ttlSliderAlpha.id('ttlSliderAlpha');
    panelInnerBox.child(ttlSliderAlpha);

    sliderAlpha = p.createSlider(0,255,100);
    sliderAlpha.id('sliderAlpha');
    panelInnerBox.child(sliderAlpha);

    ttlSliderBorderW = p.createP('border width');
    ttlSliderBorderW.id('ttlSliderBorderW');
    panelInnerBox.child(ttlSliderBorderW);

    sliderBorderW = p.createSlider(1,40,1);
    sliderBorderW.id('sliderBorderW');
    panelInnerBox.child(sliderBorderW);

    //myColor = [p.floor(p.random(255)),p.floor(p.random(255)),p.floor(p.random(255)),100];
    myColor = [0,0,0,sliderAlpha.value()];
    myPattern = selectBox.value();
    myData = {
      mx:myCurrentP.x,
      my:myCurrentP.y,
      pmx:myPrevP.x,
      pmy:myPrevP.y,
      pathArr:myPathArr,
      path:myPath,
      clr:myColor,
      drag: myDragFlag,
      angle: myAngle ,
      diff: myDiff,
      pattern: myPattern,
      bdW: myBorderW
    };

    /*--
      socket io
    ------------------------------------*/
    socket = io();

    //サーバーから自分のidを受け取る
    socket.on('setYourId',function(yourId){
      myID = yourId;
    });

    //サーバーから、更新されたユーザーデータを受け取る
    //対象ユーザーのストロークデータを初期化してlinesに新規ストロークを追加
    //linesに全部ストロークデータを保持することで他のユーザーのストロークも描画できるようになる
    socket.on('addToLines',function(id){
      users[id] = [];
      lines = [];
      lines.push(users[id]);
    });

    //サーバーからユーザーデータを受け取る
    //ユーザーごとの更新データを追加する
    socket.on('getUserData',function(userData){
      users[userData.id].push(userData);
      p.redraw();
    });

    //サーバーからチャット情報を受け取る
    socket.on('chatInfoUpdate',function(chatData){
      let chatNum = document.getElementById('chatNum');
      chatNum.innerHTML = chatData.length;
    });

    //
    socket.on('resetMyData',function(id){
      users[id] = [];
      lines = [];
    });

    //全員のキャンバスを初期化
    // socket.on('clearCanvas',function(id){
    //   users[id] = {};
    // });


    //ウィンドウを閉じたらサーバーに通信切断を通知する
    socket.on('disconnect',function(){
      socket.emit('disconnect');
    });

    p.noLoop();

  }//end setup


  p.draw = function(){

    for(let key in users) {
      if(users.hasOwnProperty(key)) {
        //ユーザーの最新のストロークデータを参照してドローイングの場合分けする
        let num = users[key].length - 1;
        if(!users[key][num])return;
        if(users[key][num].drag){
          switch (users[key][num].pattern) {
            case 'path':
              drawPath();
            break;
            case 'line':
              drawLine(users[key][num]);
            break;
            case 'circle':
              drawCircle(users[key][num]);
            break;
            case 'rect':
              drawRectangle(users[key][num]);
            break;
            case 'triangle':
              drawTriangle(users[key][num]);
            break;
          }
        }

      }
    }

    p.noLoop();

  }// end draw

  p.mousePressed = function(e){
    let t = e.srcElement || e.target;//for ie
    if(t == thisRenderer2dObj.canvas){
      myDragFlag = true;
      myData.drag = myDragFlag;
      socket.emit('pushUserStroke');
    }
  }

  p.mouseDragged = function(e) {
    let t = e.srcElement || e.target;//for ie

    //canvasでドラッグした時だけ実行したい。スライダー操作の時などに反応しないようにcanvasかどうか判定して条件分岐。
    if(t == thisRenderer2dObj.canvas){

      p.cursor(p.CROSS);

      //前回と今回のマウス座標
      if(myPrevP.x == -9999){//ドラッグ開始時のみmyPrevPにmyCurrentPの値を入れてやる
        myCurrentP.x = e.offsetX;
        myCurrentP.y = e.offsetY;
        myPrevP.x = myCurrentP.x;
        myPrevP.y = myCurrentP.y;
      }else{
        myCurrentP.x = e.offsetX;
        myCurrentP.y = e.offsetY;
      }

      //前回と今回のマウス座標の差を利用するのでとっておく
      let diff = p.sqrt(p.pow(myCurrentP.x - myPrevP.x,2) + p.pow(myCurrentP.y - myPrevP.y,2));
      diff *= 0.01;
      p.constrain(diff,1,180);
      myDiff = diff;

      //回転の角度更新
      myAngle += 1;
      myAngle = myAngle % 360;

      //座標ヒストリー保存
      let point = {x:myCurrentP.x,y:myCurrentP.y};

      //アルファ値
      myColor[3] = sliderAlpha.value();

      //ボーダーの太さ
      myBorderW = sliderBorderW.value();

      //今回のストロークの色
      let tempCol = [myColor[0],myColor[1],myColor[2],myColor[3]];

      //データをセット
      myData = {
        mx:myCurrentP.x,
        my:myCurrentP.y,
        pmx:myPrevP.x,
        pmy:myPrevP.y,
        clr:myColor,
        drag: myDragFlag,
        angle: myAngle ,
        diff: myDiff,
        pattern: myPattern,
        bdW: myBorderW
      };

      //サーバーに送信
      socket.emit('getClientInfo',myData);

      //前回のマウス座標を更新
      myPrevP.x = myCurrentP.x;
      myPrevP.y = myCurrentP.y;

    };

  };

  p.mouseReleased = function(e){
    let t = e.srcElement || e.target;//for ie
    if(t == thisRenderer2dObj.canvas){
      myDragFlag = false;
      myData.drag = myDragFlag;
      myPrevP.x = -9999;
      myPrevP.y = -9999;
      //サーバーに送信
      socket.emit('getClientInfo',myData);
    }
  }

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  }


  /*----------------------

  カスタムブラシ

  -----------------------*/
  function drawPath(){
    p.strokeCap(p.ROUND);
    //p.strokeCap(p.SQUARE);
    //p.strokeCap(p.PROJECT);
    p.noFill();
    for(let i=0; i<lines.length; i++){
      let line = lines[i];
      p.push();
        p.noFill();
        p.beginShape();
          for(let j = 0; j<line.length; j++){
            if(line[j].pattern == 'path') {
              let c = p.color(line[j].clr[0],line[j].clr[1],line[j].clr[2],line[j].clr[3]);
              p.stroke(c);
              p.strokeWeight(line[j].bdW);
              p.vertex(line[j].mx,line[j].my);
            };
          }
        p.endShape();
      p.pop();
    }

  }

  function drawTriangle(obj){
    let radius = 250;
    let c = p.color(obj.clr[0],obj.clr[1],obj.clr[2],obj.clr[3]);
    radius *= obj.diff;
    radius = p.constrain(radius,10,500);//外心から頂点までの長さ
    p.stroke(c);
    p.strokeWeight(obj.bdW);
    p.noFill();
    p.push();
      p.translate(obj.mx,obj.my);
      p.rotate(obj.angle * 2);
      let deg = -90;
      let p1_x = 0;
      let p1_y = -radius;
      deg += 120;
      let p2_x = (radius * p.cos(p.radians(deg)));
      let p2_y = (radius * p.sin(p.radians(deg)));
      deg += 120;
      let p3_x = (radius * p.cos(p.radians(deg)));
      let p3_y = (radius * p.sin(p.radians(deg)));
      p.triangle(p1_x,p1_y,p2_x,p2_y,p3_x,p3_y);
    p.pop();
  }

  function drawRectangle(obj){
    let radius = 200;
    let c = p.color(obj.clr[0],obj.clr[1],obj.clr[2],obj.clr[3]);
    radius *= obj.diff;
    radius = p.constrain(radius,10,500);
    p.rectMode(p.RADIUS);
    p.stroke(c);
    p.strokeWeight(obj.bdW);
    p.noFill();
    p.push();
      p.translate(obj.mx,obj.my);
      p.rotate(obj.angle * 0.05);
      p.rect(0,0,radius,radius);
    p.pop();
  }

  function drawCircle(obj){
    let width = 350;
    let c = p.color(obj.clr[0],obj.clr[1],obj.clr[2],obj.clr[3]);
    width *= obj.diff;
    width = p.constrain(width,20,500);
    p.rectMode(p.RADIUS);
    p.stroke(c);
    p.strokeWeight(obj.bdW);
    p.noFill();
    p.push();
      p.translate(obj.mx,obj.my);
      p.ellipse(0,0,width,width);
    p.pop();
  }

  function drawLine(obj){
    let len = 300;
    let c = p.color(obj.clr[0],obj.clr[1],obj.clr[2],obj.clr[3]);
    len *= obj.diff;
    len = p.constrain(len,40,500);
    p.stroke(c);
    p.strokeWeight(obj.bdW);
    p.noFill();
    p.push();
      p.translate(obj.mx,obj.my);
      p.rotate(obj.angle * 0.1);
      p.line(0,0,len,len);
    p.pop();
  }

  function mySelectEvent() {
    myPattern = selectBox.value();
    //ブラシパターンが変更したら自分のpathのデータを初期化
    socket.emit('resetMyData');
  }

  function clearCanvas(){
    users = {};//自分のとこだけ全部のユーザーのデータを初期化
    p.clear();
    //socket.emit('clearCanvas');
    socket.emit('resetMyData');
  }

}
new p5(scketch);









/*--

  canvas colorPicker saturation brightness

------------------------------------*/
let colorPicker__selectSatBriSketch = function(p){

  let pd;
  let cvsW = 100;
  let cvsH = 100;
  let thisRenderer2dObj;

  p.setup = function(){
    p.background(0);
    p.colorMode(p.HSB, cvsW);
    pd = p.pixelDensity();

    //dom作成
    colorPicker__selectSatBri = p.createDiv('');
    colorPicker__selectSatBri.id('colorPicker__selectSatBri');
    panelInnerBox.child(colorPicker__selectSatBri);

    //canvas作成
    thisRenderer2dObj = p.createCanvas(cvsW, cvsH);
    thisRenderer2dObj.mousePressed(changeColor);//こうするとthisRenderer2dObjがクリックされた時だけ呼び出されるのでmainCanvasに影響しない。
    thisRenderer2dObj.parent("colorPicker__selectSatBri");
    p.noLoop();
  }

  p.draw = function(){
    p.colorMode(p.HSB, 100);
    drawColor();
    p.loadPixels();
  }

  p.mousePressed = function(e){
    //ここはmainCanvasもクリックを検知してしまうので注意
  }

  function changeColor(e){
    /*
    noLoopしてるとmouseXなどが全部0で返ってくる仕様らしい。なのでeで普通にclientXのほうを使う。
    https://github.com/processing/p5.js/issues/1205
    */
    p.cursor(p.CROSS);
    let mx = e.offsetX;//http://phpjavascriptroom.com/?t=js&p=event_object
    let my = e.offsetY;

    //ピクセルの色取得
    let pos = (4 * cvsW * pd * my) + (4 * mx * pd);
    let r = p.pixels[pos];//画像の場合はp.getでいけるがcanvasの塗りの場合はp.pixels[]でやる必要がある
    let g = p.pixels[pos+1];
    let b = p.pixels[pos+2];

    myColor[0] = r;
    myColor[1] = g;
    myColor[2] = b;

  }

  function drawColor(){
    for (let i = 0; i < 100; i++) {
      for (let j = 0; j < 100; j++) {
        p.stroke(pickerHue, 100-j, i);
        p.point(i, j);
      }
    }
  }

}
colorPickerSelectSatBriSketch_p5 = new p5(colorPicker__selectSatBriSketch);



/*--

  canvas colorPicker hue

------------------------------------*/
let colorPicker__selectHueSkech = function(p){

  let pd;
  let cvsW = 100;
  let cvsH = 15;
  let thisRenderer2dObj;

  p.setup = function(){
    p.background(0);
    p.colorMode(p.HSB, cvsW);
    pd = p.pixelDensity();

    //dom作成
    colorPicker__selectHue = p.createDiv('');
    colorPicker__selectHue.id('colorPicker__selectHue');
    panelInnerBox.child(colorPicker__selectHue);

    //canvas作成
    thisRenderer2dObj = p.createCanvas(cvsW, cvsH);
    thisRenderer2dObj.mousePressed(changeColor);//こうするとthisRenderer2dObjがクリックされた時だけ呼び出されるのでmainCanvasに影響しない。
    thisRenderer2dObj.parent("colorPicker__selectHue");

    p.noLoop();
  }

  p.draw = function(){

    p.colorMode(p.HSB, 100);
    for (let k = 0; k < cvsW; k++) {
      for (let h = 0; h < cvsH; h++) {
        p.stroke(k, 100, 100);
        p.point(k, h);
      }
    }
    p.loadPixels();

  }

  p.mousePressed = function(e){
    //ここはmainCanvasもクリックを検知してしまうので注意
  }

  function changeColor(e){
    /*
    最新のp5だとnoLoopにした場合mouseXなどが全部0で返ってくるらしい。バグかは不明。なのでeで普通にclientXのほうを使う。
    https://github.com/processing/p5.js/issues/1205
    */
    p.cursor(p.CROSS);
    let mx = e.offsetX;//http://phpjavascriptroom.com/?t=js&p=event_object
    let my = e.offsetY;

    //ピクセルの色取得
    let pos = (4 * cvsW * pd * my) + (4 * mx * pd);
    let r = p.pixels[pos];//画像の場合はp.getでいけるがcanvasの塗りの場合はp.pixels[]でやる必要がある
    let g = p.pixels[pos+1];
    let b = p.pixels[pos+2];

    //RGBからHSBに変換 hueのみ
    let hue = getHue(r,g,b);
    hue = p.map(hue,0,360,0,100);

    //色相を更新
    pickerHue = hue;

    //彩度明度ピッカーを再描画
    colorPickerSelectSatBriSketch_p5.draw();

    //ドローイングの色を更新
    myColor[0] = r;
    myColor[1] = g;
    myColor[2] = b;

  }

  function getHue(r,g,b){
    let hue;
    let max = p.max(r,g,b);
    let min = p.min(r,g,b);

    if(max == r){
      hue = ((g-b)/(max-min)) * 60;
    }else if(max == g){
      hue = ((b-r)/(max-min)) * 60 + 120;
    }else if(max == b){
      hue = ((r-g)/(max-min)) * 60 + 240;
    }else if(r == g && g == b){
      hue = 0;
    }

    if(hue<0){
      hue += 360;
    }

    hue = p.floor(hue);

    return hue;

  }



}
new p5(colorPicker__selectHueSkech);
