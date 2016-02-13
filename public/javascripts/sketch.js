//socket io
var socket;

//p5
var colorPickerSelectSatBriSketch_p5;

//scketch
var clientsObj;
var myData;
var myColor;
var myAngle = 0;
var myDiff = 0;
var myPattern = 'path';
var myBorderW;

//dom
var panel;
var panelInnerBox;
var selectBox;
var clearBtn;
var ttl;
var chatInfo;
var chatNum;
var colorPicker__selectSatBri;
var colorPicker__selectHue;
var sliderAlpha;
var sliderBorderW;

//
var pickerHue = 360;






/*--

  canvas main

------------------------------------*/
var scketch = function(p){

  var mainCanvas;

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
      var chatMemberNum = document.getElementById('chatMemberNum');
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

    for(var key in clientsObj) {
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
    var t = e.srcElement || e.target;//for ie
    if(t == mainCanvas.canvas){
      //スライダー操作の時に反応しないようにcanvasかどうか判定
      p.cursor(p.CROSS);

      //前回と今回のマウス座標の差を利用する
      var diff = p.sqrt(p.pow(p.mouseX - p.pmouseX,2) + p.pow(p.mouseY - p.pmouseY,2));
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
    var c = p.color(cltObj.clr[0],cltObj.clr[1],cltObj.clr[2],cltObj.clr[3]);
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
    var radius = 100;
    var c = p.color(cltObj.clr[0],cltObj.clr[1],cltObj.clr[2],cltObj.clr[3]);
    radius *= cltObj.diff;
    radius = p.constrain(radius,20,200);
    p.stroke(c);
    p.strokeWeight(cltObj.bdW);
    p.noFill();
    p.push();
      p.translate(cltObj.mx,cltObj.my);
      p.rotate(cltObj.angle);
      var deg = -90;
      var p1_x = 0;
      var p1_y = -radius;
      deg += 120;
      var p2_x = (radius * p.cos(p.radians(deg)));
      var p2_y = (radius * p.sin(p.radians(deg)));
      deg += 120;
      var p3_x = (radius * p.cos(p.radians(deg)));
      var p3_y = (radius * p.sin(p.radians(deg)));
      p.triangle(p1_x,p1_y,p2_x,p2_y,p3_x,p3_y);
    p.pop();
  }

  function drawRectangle(cltObj){
    var radius = 100;
    var c = p.color(cltObj.clr[0],cltObj.clr[1],cltObj.clr[2],cltObj.clr[3]);
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
    var width = 300;
    var c = p.color(cltObj.clr[0],cltObj.clr[1],cltObj.clr[2],cltObj.clr[3]);
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
    var len = 300;
    var c = p.color(cltObj.clr[0],cltObj.clr[1],cltObj.clr[2],cltObj.clr[3]);
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




/*--

  canvas colorPicker saturation brightness

------------------------------------*/
var colorPicker__selectSatBriSketch = function(p){

  var pd;
  var cvsW = 100;
  var cvsH = 100;
  var pickerCanvas;

  p.setup = function(){
    p.background(0);
    p.colorMode(p.HSB, cvsW);
    pd = p.pixelDensity();
    colorPicker__selectSatBri = p.createDiv('');
    colorPicker__selectSatBri.id('colorPicker__selectSatBri');
    panelInnerBox.child(colorPicker__selectSatBri);
    colorPicker__selectSatBri.position(0,40);
    pickerCanvas = p.createCanvas(cvsW, cvsH);
    pickerCanvas.mousePressed(changeColor);//こうするとpickerCanvasがクリックされた時だけ呼び出されるのでmainCanvasに影響しない。
    pickerCanvas.parent("colorPicker__selectSatBri");
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
    var mx = e.offsetX;//http://phpjavascriptroom.com/?t=js&p=event_object
    var my = e.offsetY;

    //ピクセルの色取得
    var pos = (4 * cvsW * pd * my) + (4 * mx * pd);
    var r = p.pixels[pos];//画像の場合はp.getでいけるがcanvasの塗りの場合はp.pixels[]でやる必要がある
    var g = p.pixels[pos+1];
    var b = p.pixels[pos+2];

    myColor[0] = r;
    myColor[1] = g;
    myColor[2] = b;

  }

  function drawColor(){
    for (i = 0; i < 100; i++) {
      for (j = 0; j < 100; j++) {
        p.stroke(pickerHue, 100-j, i);
        p.point(i, j);
      }
    }
  }

}
var colorPickerSelectSatBriSketch_p5 = new p5(colorPicker__selectSatBriSketch);



/*--

  canvas colorPicker hue

------------------------------------*/
var colorPicker__selectHueSkech = function(p){

  var pd;
  var cvsW = 15;
  var cvsH = 100;
  var pickerCanvas;

  p.setup = function(){
    p.background(0);
    p.colorMode(p.HSB, cvsW);
    pd = p.pixelDensity();
    colorPicker__selectHue = p.createDiv('');
    colorPicker__selectHue.id('colorPicker__selectHue');
    panelInnerBox.child(colorPicker__selectHue);
    colorPicker__selectHue.position(110,40);
    pickerCanvas = p.createCanvas(cvsW, cvsH);
    pickerCanvas.mousePressed(changeColor);//こうするとpickerCanvasがクリックされた時だけ呼び出されるのでmainCanvasに影響しない。
    pickerCanvas.parent("colorPicker__selectHue");
    p.noLoop();
  }

  p.draw = function(){
    p.colorMode(p.HSB, 100);
    for (k = 0; k < cvsW; k++) {
      for (h = 0; h < cvsH; h++) {
        p.stroke(h, 100, 100);
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
    var mx = e.offsetX;//http://phpjavascriptroom.com/?t=js&p=event_object
    var my = e.offsetY;

    //ピクセルの色取得
    var pos = (4 * cvsW * pd * my) + (4 * mx * pd);
    var r = p.pixels[pos];//画像の場合はp.getでいけるがcanvasの塗りの場合はp.pixels[]でやる必要がある
    var g = p.pixels[pos+1];
    var b = p.pixels[pos+2];

    //RGBからHSB変換 hueのみ
    var hue;
    var max = p.max(r,g,b);
    var min = p.min(r,g,b);

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

    hue = p.map(hue,0,360,0,100);

    //
    pickerHue = hue;
    colorPickerSelectSatBriSketch_p5.draw();

    myColor[0] = r;
    myColor[1] = g;
    myColor[2] = b;

    // console.log('pixels :',p.pixels);
    // console.log('pixels len :',p.pixels.length);
    // console.log('mx:',mx);
    // console.log('my:',my);
    // console.log('r:',r);
    // console.log('g:',g);
    // console.log('b:',b);
    // console.log(colorPickerSelectSatBriSketch_p5);
    // console.log(pos);
    // console.log(my);
    // console.log(myColor);
  }
}
new p5(colorPicker__selectHueSkech);
