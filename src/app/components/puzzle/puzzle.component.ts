import { Component, Renderer2, ViewChild, ElementRef, OnInit, HostListener } from '@angular/core';
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
    height: 300,
    covered: 85,
    points: 0,
    games: 0
  }

  screenHeight: any;
  screenWidth: any;

  currentX: number;
  currentY: number;
  currenPositionImageX: number;
  currenPositionImageY: number;
  currenPositionRectX: number;
  currenPositionRectY: number;
  imageSelected;
  rectSelected;

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

    this.getScreenSize();
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

    this.propertiesImage.games++;

    this.starGame = true;

    this.clearSVG();

    this.renderer.setAttribute(this.entorno.nativeElement, "height", `${this.propertiesImage.height}`);
    this.renderer.setAttribute(this.entorno.nativeElement, "width", `${this.screenWidth}`);
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
        this.renderer.setProperty(newG, "id", `padre${x}${y}`);

        this.renderer.setAttribute(newImage, "preserveAspectRatio", "none");
        this.renderer.addClass(newImage, "movil");
        this.renderer.setAttribute(newImage, "href", `${this.propertiesImage.urlImage}`, "xlink");
        this.renderer.setAttribute(newImage, "height", `${this.propertiesImage.height}`);
        this.renderer.setAttribute(newImage, "width", `${this.propertiesImage.width}`);
        this.renderer.setAttribute(newImage, "x", `${positionImageX}`);
        this.renderer.setAttribute(newImage, "y", `${positionImageY}`);
        this.renderer.setAttribute(newImage, "clip-path", `url(#${idClip})`);
        this.renderer.setAttribute(newImage, "onmousedown", "");

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
   * Change the position the rectangle and image
   * @param x value to sume in "x" of Rectangle and Image from SVG
   * @param y value to sume in "y" of Rectangle and Image from SVG
   */
  changePosition(x: number, y: number) {
    // Sum x a atribute x o y the Image and Rectangle
    this.renderer.setAttribute(this.imageSelected, "x", `${parseFloat(this.getAttribute(this.imageSelected, "x")) + x}`);
    this.renderer.setAttribute(this.imageSelected, "y", `${parseFloat(this.getAttribute(this.imageSelected, "y")) + y}`);
    this.renderer.setAttribute(this.rectSelected, "x", `${parseFloat(this.getAttribute(this.rectSelected, "x")) + x}`);
    this.renderer.setAttribute(this.rectSelected, "y", `${parseFloat(this.getAttribute(this.rectSelected, "y")) + y}`);

  }

  remplacePosition(xRect: number, yRect: number, xImage: number, yImage: number) {
    // Sum x a atribute x o y the Image and Rectangle
    /*this.renderer.setAttribute(this.imageSelected, "x", `${parseFloat(this.getAttribute(this.imageSelected, "x")) + x}`);
    this.renderer.setAttribute(this.imageSelected, "y", `${parseFloat(this.getAttribute(this.imageSelected, "y")) + y}`);
    this.renderer.setAttribute(myRect, "x", `${parseFloat(this.getAttribute(myRect, "x")) + x}`);
    this.renderer.setAttribute(myRect, "y", `${parseFloat(this.getAttribute(myRect, "y")) + y}`);*/
  }

  getRectToImage() {
    let nodeValue = this.getAttribute(this.imageSelected, "clip-path");

    let idClipPath = nodeValue.substring(5, nodeValue.length - 1);

    return this.entorno.nativeElement.firstChild.children.namedItem(idClipPath).firstChild;
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
    console.log(this.screenHeight, this.screenWidth);
  }

  /**
   * Captura la posición del mouse y de la pieza seleccionada y asigna a esta última la propiedad onmousemove
   * @param event evento capturado
   */
  @HostListener('document:mousedown', ['$event'])
  selectElement(event) {
    this.imageSelected = this.reordenar(event);
    this.rectSelected = this.getRectToImage();

    this.currentX = event.clientX;
    this.currentY = event.clientY;

    this.currenPositionImageX = parseFloat(this.getAttribute(this.imageSelected, "x"));
    this.currenPositionImageY = parseFloat(this.getAttribute(this.imageSelected, "y"));
    this.currenPositionRectX = parseFloat(this.getAttribute(this.rectSelected, "x"));
    this.currenPositionRectY = parseFloat(this.getAttribute(this.rectSelected, "y"));

    this.renderer.setAttribute(this.imageSelected, "onmousemove", "");
  }

  @HostListener('document:mousemove', ['$event'])
  moveElement(event) {
    /** Diferencia entre la posición horizontal del puntero actual y la anterior*/
    let dx = event.clientX - this.currentX;
    /** Diferencia entre la posición vertical del puntero actual y la anterior*/
    let dy = event.clientY - this.currentY;

    this.currenPositionImageX += dx;
    this.currenPositionImageY += dy;
    this.currenPositionRectX += dx;
    this.currenPositionRectY += dy

    this.renderer.setAttribute(this.imageSelected, "x", `${this.currenPositionImageX}`);
    this.renderer.setAttribute(this.imageSelected, "y", `${this.currenPositionImageY}`);
    this.renderer.setAttribute(this.rectSelected, "x", `${this.currenPositionRectX}`);
    this.renderer.setAttribute(this.rectSelected, "y", `${this.currenPositionRectY}`);

    this.currentX = event.clientX;
    this.currentY = event.clientY;

    this.renderer.setAttribute(this.imageSelected, "onmouseout", "");
    this.renderer.setAttribute(this.imageSelected, "onmouseup", "");

    this.iman();
  }

  @HostListener('document:mouseout', ['$event'])
  onMouseout() {
    this.deSelectElemento();
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseup() {
    this.deSelectElemento();
  }

  deSelectElemento() {
    this.verifyWin();
    if (this.imageSelected != 0) {
      this.renderer.removeAttribute(this.imageSelected, "onmousemove");
      this.renderer.removeAttribute(this.imageSelected, "onmouseout");
      this.renderer.removeAttribute(this.imageSelected, "onmouseup");
      this.imageSelected = 0;
    }
  }

  verifyWin() {
    let bien_ubicada: number = 0;
    console.log(this.entorno);
    this.entorno.nativeElement.childNodes.forEach((element, key) => {
      if (key > 1) {
        let posx = parseFloat(this.getAttribute(element.firstChild, "x"));
        let posy = parseFloat(this.getAttribute(element.firstChild, "y"));
        console.log(element.firstChild);
        if (0 == posx && 0 == posy) {
          bien_ubicada++;
        }
      }
    });

    if (bien_ubicada == this.entorno.nativeElement.childElementCount - 2) {
      !this.starGame;
      this.restart();
      this.propertiesImage.points++;
    }
  }

  iman() {
    if (
      Math.abs(this.currenPositionImageX) < (100 - this.propertiesImage.covered) &&
      Math.abs(this.currenPositionImageY) < (100 - this.propertiesImage.covered)) {
      this.renderer.setAttribute(this.imageSelected, "x", "0");
      this.renderer.setAttribute(this.imageSelected, "y", "0");
      this.renderer.setAttribute(this.rectSelected, "x", `${this.currenPositionRectX - this.currenPositionImageX}`);
      this.renderer.setAttribute(this.rectSelected, "y", `${this.currenPositionRectY - this.currenPositionImageY}`);
    }
  }

  /**
   * Coloca al nodo seleccionado al final de la lista del svg
   */
  reordenar(event: any) {
    let nodeG = this.renderer.parentNode(event.target); // obtenemos el padre del nodo que desencadenó un evento
    let cloneG = nodeG.cloneNode(true); // clonamos al padre y lo guardamos en clone
    this.renderer.removeChild(this.entorno.nativeElement, nodeG); // Eliminamos el nodo seleccionado
    this.renderer.appendChild(this.entorno.nativeElement, cloneG); // agrega el nodo padre al final de la lista del svg
    return this.entorno.nativeElement.lastChild.firstChild; // retorna la imagen (firstChild) del padre seleccionado
  }

  getAttribute(el: any, atribute: string) {
    return el.attributes.getNamedItem(atribute).nodeValue;
  }

}
