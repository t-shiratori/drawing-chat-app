!function e(r,o,t){function i(a,c){if(!o[a]){if(!r[a]){var l="function"==typeof require&&require;if(!c&&l)return l(a,!0);if(n)return n(a,!0);var s=new Error("Cannot find module '"+a+"'");throw s.code="MODULE_NOT_FOUND",s}var d=o[a]={exports:{}};r[a][0].call(d.exports,function(e){var o=r[a][1][e];return i(o?o:e)},d,d.exports,e,r,o,t)}return o[a].exports}for(var n="function"==typeof require&&require,a=0;a<t.length;a++)i(t[a]);return i}({1:[function(e,r,o){"use strict";var t=void 0,i=void 0,n=void 0,a=void 0,c=void 0,l=0,s=0,d="path",f=void 0,u=!1,p=[],v={x:-9999,y:-9999},h={x:-9999,y:-9999},m=void 0,x=void 0,y=void 0,g=void 0,k=void 0,w=void 0,P=void 0,S=void 0,b=void 0,W=void 0,C=void 0,D=void 0,B=360,_=function(e){function r(r){var o=e.color(r.clr[0],r.clr[1],r.clr[2],r.clr[3]);e.stroke(o),e.strokeCap(e.ROUND),e.strokeWeight(r.bdW),e.noFill(),e.push(),e.beginShape();for(var t=0;t<r.historyPoints.length;t++){var i=r.historyPoints[t];e.vertex(i.x,i.y)}e.endShape(),e.pop()}function o(r){var o=100,t=e.color(r.clr[0],r.clr[1],r.clr[2],r.clr[3]);o*=r.diff,o=e.constrain(o,10,500),e.stroke(t),e.strokeWeight(r.bdW),e.noFill(),e.push(),e.translate(r.mx,r.my),e.rotate(2*r.angle);var i=-90,n=0,a=-o;i+=120;var c=o*e.cos(e.radians(i)),l=o*e.sin(e.radians(i));i+=120;var s=o*e.cos(e.radians(i)),d=o*e.sin(e.radians(i));e.triangle(n,a,c,l,s,d),e.pop()}function i(r){var o=100,t=e.color(r.clr[0],r.clr[1],r.clr[2],r.clr[3]);o*=r.diff,o=e.constrain(o,10,500),e.rectMode(e.RADIUS),e.stroke(t),e.strokeWeight(r.bdW),e.noFill(),e.push(),e.translate(r.mx,r.my),e.rotate(.05*r.angle),e.rect(0,0,o,o),e.pop()}function P(r){var o=300,t=e.color(r.clr[0],r.clr[1],r.clr[2],r.clr[3]);o*=r.diff,o=e.constrain(o,20,500),e.rectMode(e.RADIUS),e.stroke(t),e.strokeWeight(r.bdW),e.noFill(),e.push(),e.translate(r.mx,r.my),e.ellipse(0,0,o,o),e.pop()}function S(r){var o=300,t=e.color(r.clr[0],r.clr[1],r.clr[2],r.clr[3]);o*=r.diff,o=e.constrain(o,40,300),e.stroke(t),e.strokeWeight(r.bdW),e.noFill(),e.push(),e.translate(r.mx,r.my),e.rotate(.1*r.angle),e.line(0,0,o,o),e.pop()}function B(){d=y.value()}function _(){e.clear()}var H=void 0;e.setup=function(){e.frameRate(40),H=e.createCanvas(e.windowWidth,e.windowHeight),H.parent("mainCanvasWrapper"),H.id("mainCanvas"),e.background(255),m=e.createDiv(""),m.id("panel"),x=e.createDiv(""),x.id("panelInnerBox"),m.child(x),k=e.createP("number of people"),k.id("ttlChatNum"),x.child("ttlChatNum"),w=e.createP(""),w.id("chatNum"),x.child(w),y=e.createSelect(),y.id("selectPattern"),y["class"]("form-control"),y.option("path"),y.option("line"),y.option("circle"),y.option("rect"),y.option("triangle"),y.changed(B),y.value("triangle"),x.child(y),g=e.createButton("clear your canvas"),g.id("clearBtn"),g["class"]("btn btn-default"),g.mouseClicked(_),x.child(g),b=e.createP("alpha"),b.id("ttlSliderAlpha"),x.child(b),C=e.createSlider(0,255,100),C.id("sliderAlpha"),x.child(C),W=e.createP("border width"),W.id("ttlSliderBorderW"),x.child(W),D=e.createSlider(1,40,1),D.id("sliderBorderW"),x.child(D),c=[0,0,0,C.value()],d=y.value(),a={mx:v.x,my:v.y,pmx:h.x,pmy:h.y,historyPoints:p,clr:c,drag:u,angle:l,diff:s,pattern:d,bdW:f},t=io(),t.on("setClientData",function(r){n=r,e.redraw()}),t.on("chatInfoUpdate",function(e){var r=document.getElementById("chatNum");r.innerHTML=e.length}),t.on("disconnect",function(){t.emit("disconnect")}),e.noLoop()},e.draw=function(){c[3]=C.value(),f=D.value();for(var t in n)if(n.hasOwnProperty(t)&&n[t].drag)switch(n[t].pattern){case"path":r(n[t]);break;case"line":S(n[t]);break;case"circle":P(n[t]);break;case"rect":i(n[t]);break;case"triangle":o(n[t])}e.noLoop()},e.mousePressed=function(e){var r=e.srcElement||e.target;r==H.canvas&&(u=!0)},e.mouseDragged=function(r){var o=r.srcElement||r.target;if(o==H.canvas){e.cursor(e.CROSS),-9999==h.x?(v.x=r.offsetX,v.y=r.offsetY,h.x=v.x,h.y=v.y):(v.x=r.offsetX,v.y=r.offsetY);var i=e.sqrt(e.pow(v.x-h.x,2)+e.pow(v.y-h.y,2));i*=.01,e.constrain(i,1,180),s=i,l+=1,l%=360;var n={x:v.x,y:v.y};p.push(n),a={mx:v.x,my:v.y,pmx:h.x,pmy:h.y,historyPoints:p,clr:c,drag:u,angle:l,diff:s,pattern:d,bdW:f},t.emit("getClientInfo",a),h.x=v.x,h.y=v.y}},e.mouseReleased=function(e){var r=e.srcElement||e.target;r==H.canvas&&(u=!1,p=[],a={mx:v.x,my:v.y,pmx:h.x,pmy:h.y,historyPoints:p,clr:c,drag:u,angle:l,diff:s,pattern:d,bdW:f},t.emit("getClientInfo",a))},e.windowResized=function(){e.resizeCanvas(e.windowWidth,e.windowHeight)}};new p5(_);var H=function(e){function r(r){e.cursor(e.CROSS);var o=r.offsetX,n=r.offsetY,a=4*i*t*n+4*o*t,l=e.pixels[a],s=e.pixels[a+1],d=e.pixels[a+2];c[0]=l,c[1]=s,c[2]=d}function o(){for(var r=0;100>r;r++)for(var o=0;100>o;o++)e.stroke(B,100-o,r),e.point(r,o)}var t=void 0,i=100,n=100,a=void 0;e.setup=function(){e.background(0),e.colorMode(e.HSB,i),t=e.pixelDensity(),P=e.createDiv(""),P.id("colorPicker__selectSatBri"),x.child(P),a=e.createCanvas(i,n),a.mousePressed(r),a.parent("colorPicker__selectSatBri"),e.noLoop()},e.draw=function(){e.colorMode(e.HSB,100),o(),e.loadPixels()},e.mousePressed=function(e){}};i=new p5(H);var R=function(e){function r(r){e.cursor(e.CROSS);var a=r.offsetX,l=r.offsetY,s=4*n*t*l+4*a*t,d=e.pixels[s],f=e.pixels[s+1],u=e.pixels[s+2],p=o(d,f,u);p=e.map(p,0,360,0,100),B=p,i.draw(),c[0]=d,c[1]=f,c[2]=u}function o(r,o,t){var i=void 0,n=e.max(r,o,t),a=e.min(r,o,t);return n==r?i=(o-t)/(n-a)*60:n==o?i=(t-r)/(n-a)*60+120:n==t?i=(r-o)/(n-a)*60+240:r==o&&o==t&&(i=0),0>i&&(i+=360),i=e.floor(i)}var t=void 0,n=100,a=15,l=void 0;e.setup=function(){e.background(0),e.colorMode(e.HSB,n),t=e.pixelDensity(),S=e.createDiv(""),S.id("colorPicker__selectHue"),x.child(S),l=e.createCanvas(n,a),l.mousePressed(r),l.parent("colorPicker__selectHue"),e.noLoop()},e.draw=function(){e.colorMode(e.HSB,100);for(var r=0;n>r;r++)for(var o=0;a>o;o++)e.stroke(r,100,100),e.point(r,o);e.loadPixels()},e.mousePressed=function(e){}};new p5(R)},{}]},{},[1]);