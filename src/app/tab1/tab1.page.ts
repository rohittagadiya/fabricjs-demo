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
      selection: true,
      selectionBorderColor: '#00c3f9',
      selectionColor: 'rgba(0, 195, 249, 0.2)',
      preserveObjectStacking: true,
      originX: 'center',
      originY: 'center',
      fireRightClick: true,
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
