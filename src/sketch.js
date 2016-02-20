'use strict';

//socket io
let socket;

//p5
let colorPickerSelectSatBriSketch_p5;

//scketch
let clientsObj;
let myData;
let myColor;
let myAngle = 0;
let myDiff = 0;
let myPattern = 'path';
let myBorderW;

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

    clearBtn = p.createButton('clear canvas');
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
    myData = {mx:p.mouseX, my:p.mouseY, pmx:p.pmouseX, pmy:p.pmouseY, clr:myColor, drag: false, angle: myAngle ,diff: myDiff, pattern: myPattern, bdW: myBorderW};


    /*--
      socket io
    ------------------------------------*/
    socket = io();

    //サーバーからクライアントデータを受け取る
    socket.on('setClientData',function(clients){
      clientsObj = clients;
    });

    //サーバーからチャット情報を受け取る
    socket.on('chatInfoUpdate',function(chatData){
      let chatNum = document.getElementById('chatNum');
      chatNum.innerHTML = chatData.length;
    });

    //ウィンドウを閉じたらサーバーに通信切断を通知する
    socket.on('disconnect',function(){
      socket.emit('disconnect');
    });


  }//end setup


  p.draw = function(){
    //p.clear();
    //p.background(0);
    //p.background(255);
    //p.fill(255,255,255,50);
    //p.rect(0,0,p.windowWidth, p.windowHeight);

    myColor[3] = sliderAlpha.value();
    myBorderW = sliderBorderW.value();

    for(let key in clientsObj) {
      if(clientsObj.hasOwnProperty(key)) {
        if(clientsObj[key].drag){
          switch (clientsObj[key].pattern) {
            case 'path':
              drawPath(clientsObj[key]);
            break;
            case 'line':
              drawLine(clientsObj[key]);
            break;
            case 'circle':
              drawCircle(clientsObj[key]);
            break;
            case 'rect':
              drawRectangle(clientsObj[key]);
            break;
            case 'triangle':
              drawTriangle(clientsObj[key]);
            break;
          }
        }
      }
    }

  }// end draw

  p.mouseDragged = function(e) {
    let t = e.srcElement || e.target;//for ie

    //canvasでドラッグした時だけ実行したい。スライダー操作の時などに反応しないようにcanvasかどうか判定して条件分岐。
    if(t == thisRenderer2dObj.canvas){

      p.cursor(p.CROSS);

      //前回と今回のマウス座標の差を利用する
      let diff = p.sqrt(p.pow(p.mouseX - p.pmouseX,2) + p.pow(p.mouseY - p.pmouseY,2));
      diff *= 0.01;
      p.constrain(diff,1,180);
      myDiff = diff;

      //回転の角度更新
      myAngle += 1;
      myAngle = myAngle % 360;

      //データをセット
      myData = {mx:p.mouseX, my:p.mouseY, pmx:p.pmouseX, pmy:p.pmouseY, clr:myColor, drag: true, angle: myAngle ,diff: myDiff, pattern: myPattern, bdW: myBorderW};

      //サーバーに送信
      socket.emit('getClientInfo',myData);
    };

  };

  p.mouseReleased = function(){
    myData.drag = false;
    socket.emit('getClientInfo',myData);
  }

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  }

  function drawPath(cltObj){
    let c = p.color(cltObj.clr[0],cltObj.clr[1],cltObj.clr[2],cltObj.clr[3]);
    p.stroke(c);
    p.strokeCap(p.ROUND);
    //p.strokeCap(p.SQUARE);
    //p.strokeCap(p.PROJECT);
    p.strokeWeight(cltObj.bdW);
    p.noFill();
    p.push();
      //p.translate(cltObj.mx,cltObj.my);
      //p.line(cltObj.mx,cltObj.my,cltObj.pmx,cltObj.pmy);
      p.beginShape();
      p.vertex(cltObj.pmx,cltObj.pmy);
      p.vertex(cltObj.mx,cltObj.my);
      p.endShape();
    p.pop();
  }

  function drawTriangle(cltObj){
    let radius = 200;
    let c = p.color(cltObj.clr[0],cltObj.clr[1],cltObj.clr[2],cltObj.clr[3]);
    radius *= cltObj.diff;
    radius = p.constrain(radius,20,200);
    p.stroke(c);
    p.strokeWeight(cltObj.bdW);
    p.noFill();
    p.push();
      p.translate(cltObj.mx,cltObj.my);
      p.rotate(cltObj.angle * 2);
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

  function drawRectangle(cltObj){
    let radius = 100;
    let c = p.color(cltObj.clr[0],cltObj.clr[1],cltObj.clr[2],cltObj.clr[3]);
    radius *= cltObj.diff;
    radius = p.constrain(radius,15,200);
    p.rectMode(p.RADIUS);
    p.stroke(c);
    p.strokeWeight(cltObj.bdW);
    p.noFill();
    p.push();
      p.translate(cltObj.mx,cltObj.my);
      p.rotate(cltObj.angle * 0.05);
      p.rect(0,0,radius,radius);
    p.pop();
  }

  function drawCircle(cltObj){
    let width = 300;
    let c = p.color(cltObj.clr[0],cltObj.clr[1],cltObj.clr[2],cltObj.clr[3]);
    width *= cltObj.diff;
    width = p.constrain(width,20,200);
    p.rectMode(p.RADIUS);
    p.stroke(c);
    p.strokeWeight(cltObj.bdW);
    p.noFill();
    p.push();
      p.translate(cltObj.mx,cltObj.my);
      p.ellipse(0,0,width,width);
    p.pop();
  }

  function drawLine(cltObj){
    let len = 300;
    let c = p.color(cltObj.clr[0],cltObj.clr[1],cltObj.clr[2],cltObj.clr[3]);
    len *= cltObj.diff;
    len = p.constrain(len,40,300);
    p.stroke(c);
    p.strokeWeight(cltObj.bdW);
    p.noFill();
    p.push();
      p.translate(cltObj.mx,cltObj.my);
      p.rotate(cltObj.angle * 0.1);
      p.line(0,0,len,len);
    p.pop();
  }

  function mySelectEvent() {
    myPattern = selectBox.value();
  }

  function clearCanvas(){
    p.clear();
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

    //RGBからHSBに変換 hueのみ
    let hue = getHue(r,g,b);
    hue = p.map(hue,0,360,0,100);

    //
    pickerHue = hue;
    colorPickerSelectSatBriSketch_p5.draw();

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
