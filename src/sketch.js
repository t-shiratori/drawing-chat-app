'use strict';

//import
import P5 from 'p5';



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
let chatNum;
let colorPicker__selectSatBri;
let colorPicker__selectHue;
let sliderAlpha;
let sliderBorderW;

//
let pickerHue = 360;


/*--

  canvas main

------------------------------------*/
let scketch = function(p){

  let mainCanvas;

  p.setup = function(){
    p.frameRate(40);
    mainCanvas = p.createCanvas(p.windowWidth, p.windowHeight);
    mainCanvas.parent('mainCanvasWrapper');
    mainCanvas.id('mainCanvas');
    //p.blendMode(p.ADD);
    p.background(255);
    //p.color() で送るとサーバーから受け取るときに型がp5から普通のobjectに変わってしまうのでだめ
    //myColor = p.color(p.floor(p.random(255)),p.floor(p.random(255)),p.floor(p.random(255)),p.floor(p.random(255)));

    /*
      コンパネ作成
    --------------------------------------*/
    panel = p.createDiv('');
    panel.id('panel');
    panel.position(10,10);

    panelInnerBox = p.createDiv('');
    panelInnerBox.id('panelInnerBox');
    panel.child(panelInnerBox);

    selectBox = p.createSelect();
    selectBox.id('selectPattern');
    selectBox.position(0, 0);
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
    clearBtn.position(100, 0);
    clearBtn.mouseClicked(clearCanvas);
    panelInnerBox.child(clearBtn);

    // chatInfo = p.createDiv('');
    // chatInfo.id('chatInfo');
    // panelInnerBox.child(chatInfo);

    chatNum = p.createP('');
    chatNum.id('chatMemberNum');
    panelInnerBox.child('chatMemberNum');
    chatNum.position(240,0);
    panelInnerBox.child(chatNum);

    sliderAlpha = p.createSlider(0,255,100);
    sliderAlpha.id('sliderAlpha');
    sliderAlpha.position(150,40);
    panelInnerBox.child(sliderAlpha);

    sliderBorderW = p.createSlider(1,40,10);
    sliderBorderW.id('sliderBorderW');
    sliderBorderW.position(150,70);
    panelInnerBox.child(sliderBorderW);


    //myColor = [p.floor(p.random(255)),p.floor(p.random(255)),p.floor(p.random(255)),100];
    myColor = [0,0,0,sliderAlpha.value()];
    myPattern = selectBox.value();
    myData = {mx:p.mouseX, my:p.mouseY, pmx:p.pmouseX, pmy:p.pmouseY, clr:myColor, drag: false, angle: myAngle ,diff: myDiff, pattern: myPattern, bdW: myBorderW};


    /*--
      socket io
    ------------------------------------*/
    socket = io();

    //
    socket.on('setClientData',function(clients){
      clientsObj = clients;
    });

    //
    socket.on('chatInfoUpdate',function(chatData){
      let chatMemberNum = document.getElementById('chatMemberNum');
      chatMemberNum.innerHTML= '人数: ' + chatData.length;
    });

    //
    socket.on('disconnect',function(){
      socket.emit('disconnect');
    });


  }//end setup


  p.draw = function(){
    //p.clear();
    //p.background(0);
    //p.background(255);

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
    if(t == mainCanvas.canvas){
      //スライダー操作の時に反応しないようにcanvasかどうか判定
      p.cursor(p.CROSS);

      //前回と今回のマウス座標の差を利用する
      let diff = p.sqrt(p.pow(p.mouseX - p.pmouseX,2) + p.pow(p.mouseY - p.pmouseY,2));
      diff *= 0.005;
      p.constrain(diff,1,45);

      //回転の角度更新
      myAngle += diff;
      myAngle = myAngle % 360;
      myDiff = diff;

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
    let radius = 100;
    let c = p.color(cltObj.clr[0],cltObj.clr[1],cltObj.clr[2],cltObj.clr[3]);
    radius *= cltObj.diff;
    radius = p.constrain(radius,20,200);
    p.stroke(c);
    p.strokeWeight(cltObj.bdW);
    p.noFill();
    p.push();
      p.translate(cltObj.mx,cltObj.my);
      p.rotate(cltObj.angle);
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
      p.rotate(cltObj.angle);
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
      p.rotate(cltObj.angle);
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
