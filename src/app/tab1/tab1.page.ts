import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

import * as alignededGuides from '../aligning_guidelines.js';

declare const fabric: any;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  canvas: any;
  drawThis: string;
  deviceWidth: any;
  deviceHeight: any;
  canvasWidth: any;
  canvasHeight: any;
  selected: any;
  canvasConfigOptions: any = {
    hoverCursor: 'pointer',
    selection: true,
    selectionBorderColor: '#00c3f9',
    selectionColor: 'rgba(0, 195, 249, 0.2)',
    preserveObjectStacking: true,
    originX: 'center',
    originY: 'center',
    fireRightClick: true,
    // imageSmoothingEnabled: true,
    // enableRetinaScaling: true
  }

  constructor(public platform: Platform) {
    this.deviceWidth = platform.width();
    this.deviceHeight = platform.height();
  }
  ngOnInit(): void {
    this.canvasWidth = this.deviceWidth - 50;
    this.canvasHeight = this.deviceHeight - 280;
    this.canvas = new fabric.Canvas('imageCanvas', {
      width: this.deviceWidth - 50,
      _width: this.deviceWidth - 50,
      height: this.deviceHeight - 280,
      _height: this.deviceHeight - 280,
      // hoverCursor: 'pointer',
      selection: false,
      selectionBorderColor: '#00c3f9',
      selectionColor: 'rgba(0, 195, 249, 0.2)',
      preserveObjectStacking: true,
      originX: 'center',
      originY: 'center',
      // fireRightClick: true,
    });
    alignededGuides.initAligningGuidelines(this.canvas);
    this.canvas.on({
      'selection:created': (e) => {

        this.selected = e.target;
      },
      'selection:cleared': (e) => {
        this.selected = null;
      },
      'object:moving': (e) => {
        let that = this;
        var obj = e.target;

        var edgedetection = 10;
        obj.setCoords(); //Sets corner position coordinates based on current angle, width and height
        that.canvas.forEachObject(function (targ) {
          let activeObject = that.canvas.getActiveObject();
          let activeObject_currentWidth = activeObject.width * activeObject.scaleX;
          let activeObject_currentHeight = activeObject.height * activeObject.scaleY;
          let target_currentWidth = targ.width * targ.scaleX;
          let target_currentHeight = targ.height * targ.scaleY;

          if (targ === activeObject) return;


          if (Math.abs(activeObject.oCoords.tr.x - targ.oCoords.tl.x) < edgedetection) {
            activeObject.left = targ.left - activeObject_currentWidth;
          }
          if (Math.abs(activeObject.oCoords.tl.x - targ.oCoords.tr.x) < edgedetection) {
            activeObject.left = targ.left + target_currentWidth;
          }
          if (Math.abs(activeObject.oCoords.br.y - targ.oCoords.tr.y) < edgedetection) {
            activeObject.top = targ.top - activeObject_currentHeight;
          }
          if (Math.abs(targ.oCoords.br.y - activeObject.oCoords.tr.y) < edgedetection) {
            activeObject.top = targ.top + target_currentHeight;
          }
          if (activeObject.intersectsWithObject(targ) && targ.intersectsWithObject(activeObject)) {
            targ.strokeWidth = 10;
            targ.stroke = 'red';
          } else {
            targ.strokeWidth = 0;
            targ.stroke = false;
          }
          if (!activeObject.intersectsWithObject(targ)) {
            activeObject.strokeWidth = 0;
            activeObject.stroke = false;
          }
        });

        /* var hSnapZone = 15;
        var hObjectMiddle = e.target.left + (obj.width * obj.scaleX) / 2;
        if (hObjectMiddle > obj.canvas.width / 2 - hSnapZone &&
          hObjectMiddle < obj.canvas.width / 2 + hSnapZone) {
          e.target.set({
            left: obj.canvas.width / 2 - (obj.width * obj.scaleX) / 2,
          }).setCoords();
        }
        var vSnapZone = 15;
        var vObjectMiddle = e.target.top + (obj.height * obj.scaleY) / 2;
        if (vObjectMiddle > obj.canvas.height / 2 - vSnapZone &&
          vObjectMiddle < obj.canvas.height / 2 + vSnapZone) {
          e.target.set({
            top: obj.canvas.height / 2 - (obj.height * obj.scaleY) / 2,
          }).setCoords();
        } */

        // console.log(obj, obj.height * obj.scaleY, obj.canvas.height)
        if (obj.top + (obj.height * obj.scaleY) > obj.canvas.height) {
          this.canvas.setHeight(obj.top + (obj.height * obj.scaleY) + 10);
        }
        if (obj.left + (obj.width * obj.scaleX) > obj.canvas.width) {
          this.canvas.setWidth(obj.left + (obj.width * obj.scaleX) + 10);
        }

        if (obj.currentHeight > obj.canvas.height || obj.currentWidth > obj.canvas.width) {
          return;
        }
        obj.setCoords();

        if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
          obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top);
          obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left);
        }
      },
      'object:scaling': (e) => {
        var obj = e.target;
        // console.log(obj, obj.height * obj.scaleY, obj.canvas.height)
        if (obj.top + (obj.height * obj.scaleY) > obj.canvas.height) {
          this.canvas.setHeight(obj.top + (obj.height * obj.scaleY) + 20);
        }
        if (obj.left + (obj.width * obj.scaleX) > obj.canvas.width) {
          this.canvas.setWidth(obj.left + (obj.width * obj.scaleX) + 20);
        }
      }
    });
    this.draw('square');
  }

  draw(value) {
    switch (value) {
      case 'square':
        let square = new fabric.Rect({
          top: 30, left: 30, width: 100, height: 100, stroke: 'black', fill: '#ffffff',
          strokeWidth: 1,
          cornerColor: '#3880ff',
          cornerSize: 10,
          cornerStyle: 'circle',
          transparentCorners: false
        });
        this.extend(square, this.randomId());
        this.canvas.add(square);
        this.canvas.renderAll();
        break;
      case 'rectangle':
        let rect = new fabric.Rect({
          top: 10, left: 10, width: 150, height: 75, stroke: 'black', fill: '#ffffff',
          strokeWidth: 1,
          cornerColor: '#3880ff',
          cornerSize: 10,
          cornerStyle: 'circle',
          transparentCorners: false
        });
        this.extend(rect, this.randomId());
        this.canvas.add(rect);
        this.canvas.renderAll();
        break;
      case 'triangle':
        let triangle = new fabric.Triangle({
          top: 100, left: 150, width: 100, height: 100, stroke: 'black', fill: '#ffffff',
          strokeWidth: 1,
          cornerColor: '#3880ff',
          cornerSize: 10,
          cornerStyle: 'circle',
          transparentCorners: false
        });
        this.extend(triangle, this.randomId());
        this.canvas.add(triangle);
        this.canvas.renderAll();
        break;
      case 'circle':
        let circle = new fabric.Circle({
          top: 0, left: 80, radius: 50, stroke: 'black', fill: '#ffffff',
          cornerColor: '#3880ff',
          cornerSize: 10,
          cornerStyle: 'circle',
          transparentCorners: false,
          strokeWidth: 1
        });
        this.extend(circle, this.randomId());
        this.canvas.add(circle);
        this.canvas.renderAll();
        break;

      default:
        break;
    }
  }

  deleteObject() {
    let that = this;
    let activeObjects = this.canvas.getActiveObjects();
    if (activeObjects) {
      activeObjects.forEach(function (object) {
        that.canvas.remove(object);
        that.canvas.renderAll();
      });
    }
  }

  extend(obj, id) {
    obj.toObject = (function (toObject) {
      return function () {
        return fabric.util.object.extend(toObject.call(this), {
          id: id
        });
      };
    })(obj.toObject);
  }

  randomId() {
    return Math.floor(Math.random() * 999999) + 1;
  }
}
