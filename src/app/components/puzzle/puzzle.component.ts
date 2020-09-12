import { Component, Renderer2, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup, AbstractControl } from '@angular/forms';

const reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

@Component({
  selector: 'app-puzzle',
  templateUrl: './puzzle.component.html',
  styleUrls: ['./puzzle.component.css',]
})
export class PuzzleComponent implements OnInit {
  @ViewChild("imagen") imagen: ElementRef;
  @ViewChild("entorno") entorno: ElementRef;
  @ViewChild("clip") clip: ElementRef;

  starGame = false;

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  firtStepCompleted = false;

  propertiesImage = {
    urlImage: null,
    partHorizontal: 3,
    partVertical: 3,
    width: 300,
    height: 300
  }

  constructor(
    private _formBuilder: FormBuilder,
    private renderer: Renderer2) { }

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      part: ['', [Validators.required]],
      url: ['', [Validators.required/*, Validators.pattern(reg)*/]]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });

  }

  getErrorMessage(element: AbstractControl) {
    if (element.hasError('required')) {
      return 'You must enter a value';
    }

    if (element.hasError('pattern')) {
      return 'Not a valid url';
    }

    return element.hasError('parts') ? 'Not a valid parts' : '';
  }

  /**
   * Lo máximo que se puede mover el rectángulo es [0; maxHeight]
   * Lo máximo que se puede mover la imagen es [-positionInitRectY; maxHeight - positionInitRectY]
   */
  start() {

    this.starGame = true;

    this.clearSVG();

    this.renderer.setAttribute(this.entorno.nativeElement, "height", `${this.propertiesImage.height}`);
    this.renderer.setAttribute(this.entorno.nativeElement, "width", `700`);
    this.renderer.setAttribute(this.entorno.nativeElement, "viewBox", `0 0 ${this.propertiesImage.width} ${this.propertiesImage.height}`);

    let newDefs = this.renderer.createElement("defs", "http://www.w3.org/2000/svg");

    this.renderer.appendChild(this.entorno.nativeElement, newDefs);

    let widhtPart = this.propertiesImage.width / this.propertiesImage.partHorizontal;
    let heightPart = this.propertiesImage.height / this.propertiesImage.partVertical;
    let maxHeight = this.propertiesImage.height - heightPart;

    for (let y = 0; y < this.propertiesImage.partVertical; y++) {
      for (let x = 0; x < this.propertiesImage.partHorizontal; x++) {
        let idClip = `clip${x}${y}`;

        let positionInitRectX = x * widhtPart;

        /** Posición inicial en Y del Rectangulo */
        let positionInitRectY = y * heightPart;

        const MOVE_IN_X = widhtPart + positionInitRectX + Math.floor(Math.random() * widhtPart);

        /** contante aleatoria que va desde (maxHeight -positionInitRectY) hasta  positionInitRectY*/
        const MOVE_IN_Y = Math.floor(((maxHeight - positionInitRectY) * Math.random()) + Math.random() * -positionInitRectY);

        let positionRectX = positionInitRectX - MOVE_IN_X;

        /** Se va a mover desde 0 hasta maxHeight */
        let positionRectY = positionInitRectY + MOVE_IN_Y;

        let positionImageX = -MOVE_IN_X;

        /** Se va a mover desde (-positionInitRectY) hasta maxHeight */
        let positionImageY = MOVE_IN_Y;

        let newClipPath = this.renderer.createElement("clipPath", "http://www.w3.org/2000/svg");
        let newRect = this.renderer.createElement("rect", "http://www.w3.org/2000/svg");
        let newG = this.renderer.createElement("g", "http://www.w3.org/2000/svg");
        let newImage = this.renderer.createElement("image", "http://www.w3.org/2000/svg");

        this.renderer.appendChild(newClipPath, newRect);
        this.renderer.appendChild(newDefs, newClipPath);

        if (x == y && y == 0) {
          let newG1 = this.renderer.createElement("g", "http://www.w3.org/2000/svg");
          let newImage1 = this.renderer.createElement("image", "http://www.w3.org/2000/svg");

          this.renderer.appendChild(newG1, newImage1);
          this.renderer.appendChild(this.entorno.nativeElement, newG1);

          this.renderer.setAttribute(newImage1, "preserveAspectRatio", "none");
          this.renderer.setAttribute(newImage1, "href", `${this.propertiesImage.urlImage}`, "xlink");
          this.renderer.setAttribute(newImage1, "height", `${this.propertiesImage.height}`);
          this.renderer.setAttribute(newImage1, "width", `${this.propertiesImage.width}`);
          this.renderer.setAttribute(newImage1, "x", `${0}`);
          this.renderer.setAttribute(newImage1, "y", `${0}`);
          this.renderer.setStyle(newImage1, "opacity", "0.2");
        }

        this.renderer.appendChild(newG, newImage);
        this.renderer.appendChild(this.entorno.nativeElement, newG);

        this.renderer.setProperty(newClipPath, "id", idClip);

        this.renderer.setAttribute(newRect, "x", `${positionRectX}`);
        this.renderer.setAttribute(newRect, "y", `${positionRectY}`);
        this.renderer.setAttribute(newRect, "width", `${widhtPart}`);
        this.renderer.setAttribute(newRect, "height", `${heightPart}`);
        //this.renderer.setStyle(newRect, "stroke", "#000");

        this.renderer.addClass(newG, "padre");
        this.renderer.setProperty(newG, "id", "padre0");

        this.renderer.setAttribute(newImage, "preserveAspectRatio", "none");
        this.renderer.addClass(newImage, "movil");
        this.renderer.setAttribute(newImage, "href", `${this.propertiesImage.urlImage}`, "xlink");
        this.renderer.setAttribute(newImage, "height", `${this.propertiesImage.height}`);
        this.renderer.setAttribute(newImage, "width", `${this.propertiesImage.width}`);
        this.renderer.setAttribute(newImage, "x", `${positionImageX}`);
        this.renderer.setAttribute(newImage, "y", `${positionImageY}`);
        this.renderer.setAttribute(newImage, "clip-path", `url(#${idClip})`);

      }
    }
  }

  clearSVG() {
    this.entorno.nativeElement.childNodes.forEach(element => {
      this.renderer.removeChild(this.entorno.nativeElement, element)
    });

    this.renderer.removeAttribute(this.entorno.nativeElement, "height");
    this.renderer.removeAttribute(this.entorno.nativeElement, "width");
    this.renderer.removeAttribute(this.entorno.nativeElement, "viewBox");

  }

  restart() {
    this.clearSVG();
    this.starGame = false;
  }

  /**
   * Changes the position the parts from image
   */
  /*
   reRandom() {
    this.entorno.nativeElement.childNodes.forEach(element => {
      this.renderer.removeChild(this.entorno.nativeElement, element)
    });
  }*/

}
