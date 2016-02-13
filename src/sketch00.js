'use strict';

//import
import P5 from 'p5';
import Agent from "./Agent";



//sketch inline mode
let sketch = function (p5){

  let agent;

  p5.setup = function(){
    agent = new Agent(p5);
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.background(0,0,0,15);
  }

  p5.draw = function(){
    p5.background(0,0,0,15);

    p5.fill(200,180,10,255);
    p5.strokeWeight(3);
    p5.stroke(255,255,255,255);

    let pm = p5.createVector(p5.pmouseX,p5.pmouseY);
    let cm = p5.createVector(p5.mouseX,p5.mouseY);
    let diff = cm.sub(pm);
    let len = diff.mag();
    let size = len * 3;
    p5.ellipse(p5.mouseX,p5.mouseY,size,size);

    agent.update(p5);
    agent.wrapWindow(p5);
    agent.display(p5);
  }

  p5.windowResized = function(){
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  }

}

new P5(sketch);
