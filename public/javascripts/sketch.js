!function e(r,o,t){function i(a,c){if(!o[a]){if(!r[a]){var l="function"==typeof require&&require;if(!c&&l)return l(a,!0);if(n)return n(a,!0);var s=new Error("Cannot find module '"+a+"'");throw s.code="MODULE_NOT_FOUND",s}var d=o[a]={exports:{}};r[a][0].call(d.exports,function(e){var o=r[a][1][e];return i(o?o:e)},d,d.exports,e,r,o,t)}return o[a].exports}for(var n="function"==typeof require&&require,a=0;a<t.length;a++)i(t[a]);return i}({1:[function(e,r,o){"use strict";var t=void 0,i=void 0,n=void 0,a=void 0,c=void 0,l=0,s=0,d="path",u=void 0,p=void 0,f=void 0,v=void 0,m=void 0,h=void 0,g=void 0,x=void 0,k=void 0,w=void 0,S=void 0,b=void 0,C=void 0,W=360,y=function(e){function r(r){var o=e.color(r.clr[0],r.clr[1],r.clr[2],r.clr[3]);e.stroke(o),e.strokeCap(e.ROUND),e.strokeWeight(r.bdW),e.noFill(),e.push(),e.beginShape(),e.vertex(r.pmx,r.pmy),e.vertex(r.mx,r.my),e.endShape(),e.pop()}function o(r){var o=100,t=e.color(r.clr[0],r.clr[1],r.clr[2],r.clr[3]);o*=r.diff,o=e.constrain(o,20,200),e.stroke(t),e.strokeWeight(r.bdW),e.noFill(),e.push(),e.translate(r.mx,r.my),e.rotate(2*r.angle);var i=-90,n=0,a=-o;i+=120;var c=o*e.cos(e.radians(i)),l=o*e.sin(e.radians(i));i+=120;var s=o*e.cos(e.radians(i)),d=o*e.sin(e.radians(i));e.triangle(n,a,c,l,s,d),e.pop()}function i(r){var o=100,t=e.color(r.clr[0],r.clr[1],r.clr[2],r.clr[3]);o*=r.diff,o=e.constrain(o,15,200),e.rectMode(e.RADIUS),e.stroke(t),e.strokeWeight(r.bdW),e.noFill(),e.push(),e.translate(r.mx,r.my),e.rotate(.05*r.angle),e.rect(0,0,o,o),e.pop()}function x(r){var o=300,t=e.color(r.clr[0],r.clr[1],r.clr[2],r.clr[3]);o*=r.diff,o=e.constrain(o,20,200),e.rectMode(e.RADIUS),e.stroke(t),e.strokeWeight(r.bdW),e.noFill(),e.push(),e.translate(r.mx,r.my),e.ellipse(0,0,o,o),e.pop()}function k(r){var o=300,t=e.color(r.clr[0],r.clr[1],r.clr[2],r.clr[3]);o*=r.diff,o=e.constrain(o,40,300),e.stroke(t),e.strokeWeight(r.bdW),e.noFill(),e.push(),e.translate(r.mx,r.my),e.rotate(.1*r.angle),e.line(0,0,o,o),e.pop()}function W(){d=v.value()}function y(){e.clear()}var P=void 0;e.setup=function(){e.frameRate(40),P=e.createCanvas(e.windowWidth,e.windowHeight),P.parent("mainCanvasWrapper"),P.id("mainCanvas"),e.background(255),p=e.createDiv(""),p.id("panel"),f=e.createDiv(""),f.id("panelInnerBox"),p.child(f),h=e.createP("number of people"),h.id("ttlChatNum"),f.child("ttlChatNum"),g=e.createP(""),g.id("chatNum"),f.child(g),v=e.createSelect(),v.id("selectPattern"),v["class"]("form-control"),v.option("path"),v.option("line"),v.option("circle"),v.option("rect"),v.option("triangle"),v.changed(W),v.value("triangle"),f.child(v),m=e.createButton("clear canvas"),m.id("clearBtn"),m["class"]("btn btn-default"),m.mouseClicked(y),f.child(m),w=e.createP("alpha"),w.id("ttlSliderAlpha"),f.child(w),b=e.createSlider(0,255,100),b.id("sliderAlpha"),f.child(b),S=e.createP("border width"),S.id("ttlSliderBorderW"),f.child(S),C=e.createSlider(1,40,1),C.id("sliderBorderW"),f.child(C),c=[0,0,0,b.value()],d=v.value(),a={mx:e.mouseX,my:e.mouseY,pmx:e.pmouseX,pmy:e.pmouseY,clr:c,drag:!1,angle:l,diff:s,pattern:d,bdW:u},t=io(),t.on("setClientData",function(e){n=e}),t.on("chatInfoUpdate",function(e){var r=document.getElementById("chatNum");r.innerHTML=e.length}),t.on("disconnect",function(){t.emit("disconnect")})},e.draw=function(){c[3]=b.value(),u=C.value();for(var e in n)if(n.hasOwnProperty(e)&&n[e].drag)switch(n[e].pattern){case"path":r(n[e]);break;case"line":k(n[e]);break;case"circle":x(n[e]);break;case"rect":i(n[e]);break;case"triangle":o(n[e])}},e.mouseDragged=function(r){var o=r.srcElement||r.target;if(o==P.canvas){e.cursor(e.CROSS);var i=e.sqrt(e.pow(e.mouseX-e.pmouseX,2)+e.pow(e.mouseY-e.pmouseY,2));i*=.01,e.constrain(i,1,180),s=i,l+=1,l%=360,a={mx:e.mouseX,my:e.mouseY,pmx:e.pmouseX,pmy:e.pmouseY,clr:c,drag:!0,angle:l,diff:s,pattern:d,bdW:u},t.emit("getClientInfo",a)}},e.mouseReleased=function(){a.drag=!1,t.emit("getClientInfo",a)},e.windowResized=function(){e.resizeCanvas(e.windowWidth,e.windowHeight)}};new p5(y);var P=function(e){function r(r){e.cursor(e.CROSS);var o=r.offsetX,n=r.offsetY,a=4*i*t*n+4*o*t,l=e.pixels[a],s=e.pixels[a+1],d=e.pixels[a+2];c[0]=l,c[1]=s,c[2]=d}function o(){for(var r=0;100>r;r++)for(var o=0;100>o;o++)e.stroke(W,100-o,r),e.point(r,o)}var t=void 0,i=100,n=100,a=void 0;e.setup=function(){e.background(0),e.colorMode(e.HSB,i),t=e.pixelDensity(),x=e.createDiv(""),x.id("colorPicker__selectSatBri"),f.child(x),a=e.createCanvas(i,n),a.mousePressed(r),a.parent("colorPicker__selectSatBri"),e.noLoop()},e.draw=function(){e.colorMode(e.HSB,100),o(),e.loadPixels()},e.mousePressed=function(e){}};i=new p5(P);var D=function(e){function r(r){e.cursor(e.CROSS);var a=r.offsetX,l=r.offsetY,s=4*n*t*l+4*a*t,d=e.pixels[s],u=e.pixels[s+1],p=e.pixels[s+2],f=o(d,u,p);f=e.map(f,0,360,0,100),W=f,i.draw(),c[0]=d,c[1]=u,c[2]=p}function o(r,o,t){var i=void 0,n=e.max(r,o,t),a=e.min(r,o,t);return n==r?i=(o-t)/(n-a)*60:n==o?i=(t-r)/(n-a)*60+120:n==t?i=(r-o)/(n-a)*60+240:r==o&&o==t&&(i=0),0>i&&(i+=360),i=e.floor(i)}var t=void 0,n=100,a=15,l=void 0;e.setup=function(){e.background(0),e.colorMode(e.HSB,n),t=e.pixelDensity(),k=e.createDiv(""),k.id("colorPicker__selectHue"),f.child(k),l=e.createCanvas(n,a),l.mousePressed(r),l.parent("colorPicker__selectHue"),e.noLoop()},e.draw=function(){e.colorMode(e.HSB,100);for(var r=0;n>r;r++)for(var o=0;a>o;o++)e.stroke(r,100,100),e.point(r,o);e.loadPixels()},e.mousePressed=function(e){}};new p5(D)},{}]},{},[1]);