import { Component, Renderer2, ViewChild, ElementRef, OnInit, HostListener, DoCheck } from '@angular/core';
import { Validators, FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

const reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

@Component({
  selector: 'app-puzzle',
  templateUrl: './puzzle.component.html',
  styleUrls: ['./puzzle.component.css',]
})
export class PuzzleComponent implements OnInit, DoCheck {
  @ViewChild("entorno") entorno: ElementRef;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  starGame = false;

  themeDark = false;

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  firtStepCompleted = false;

  propertiesImage = {
    titleGame: "Puzzle",
    urlImage: "https://img1.codigonuevo.com/bd/25/51/large-29-930x600.jpg",
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

  jsonPuzzle: string;

  constructor(
    private _formBuilder: FormBuilder,
    private renderer: Renderer2,
    private breakpointObserver: BreakpointObserver) { }

  ngOnInit() {

    this.jsonPuzzle = this.getJsonFormated();

    console.log(this.propertiesImage);

    this.firstFormGroup = this._formBuilder.group({
      part: ['', [Validators.required]],
      url: ['', [Validators.required/*, Validators.pattern(reg)*/]]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });

    //this.getScreenSize();

    this.renderer.listen("document", "mousedown", (event: MouseEvent) => {
      this.selectElement(event);
      //console.log("mousedown");
    });

    this.renderer.listen("document", "mousemove", (event: MouseEvent) => {
      this.moveElement(event);
      //console.log("mousemove");
    });

    this.renderer.listen("document", "mouseout", (event: MouseEvent) => {
      this.deSelectElement(event);
      //console.log("mouseout");
    });

    this.renderer.listen("document", "mouseup", (event: MouseEvent) => {
      this.deSelectElement(event);
      //console.log("mouseup");
    });
  }

  ngDoCheck() {
    //this.jsonPuzzle = this.getJsonFormated();
    this.propertiesImage = JSON.parse(this.jsonPuzzle);
  }

  getJsonFormated(): string {
    return JSON.stringify(this.propertiesImage)
      .replace(/,/g, ",\n  ")
      .replace(/{/, "{\n  ")
      .replace(/}/, "\n}")
      .replace(/:/g, ": ");
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

        let positionInitRectY = y * heightPart; // Posición inicial en Y del Rectangulo

        const MOVE_IN_X = widhtPart + positionInitRectX + Math.floor(Math.random() * widhtPart);

        /** contante aleatoria que va desde (maxHeight -positionInitRectY) hasta  positionInitRectY*/
        const MOVE_IN_Y = Math.floor(((maxHeight - positionInitRectY) * Math.random()) + Math.random() * -positionInitRectY);

        let positionRectX = positionInitRectX - MOVE_IN_X;

        let positionRectY = positionInitRectY + MOVE_IN_Y; // Se va a mover desde 0 hasta maxHeight

        let positionImageX = -MOVE_IN_X;

        let positionImageY = MOVE_IN_Y; // Se va a mover desde (-positionInitRectY) hasta maxHeight

        this.renderer.appendChild(newDefs, this.createClipPath(idClip, widhtPart, heightPart, positionRectX, positionRectY));

        if (x == 0 && x == y) {
          this.renderer.appendChild(this.entorno.nativeElement, this.createG(this.propertiesImage.urlImage, this.propertiesImage.height, this.propertiesImage.width, 0.2));
        }

        this.renderer.appendChild(this.entorno.nativeElement, this.createG(
          this.propertiesImage.urlImage,
          this.propertiesImage.height,
          this.propertiesImage.width,
          null,
          positionImageX,
          positionImageY,
          idClip
        ));

      }
    }
  }

  createImage(
    href: string,
    height: number,
    width: number,
    opacity: number = null,
    x: number = 0,
    y: number = 0,
    idClipPath: string = null,
    preserveAspectRatio: string = "none",
  ) {
    let newImage = this.renderer.createElement("image", "http://www.w3.org/2000/svg");

    this.renderer.setAttribute(newImage, "href", `${href}`, "xlink");
    this.renderer.setAttribute(newImage, "height", `${height}`);
    this.renderer.setAttribute(newImage, "width", `${width}`);
    opacity == null ? null : this.renderer.setStyle(newImage, "opacity", `${opacity}`);
    this.renderer.setAttribute(newImage, "x", `${x}`);
    this.renderer.setAttribute(newImage, "y", `${y}`);
    idClipPath == null ? null : this.renderer.setAttribute(newImage, "clip-path", `url(#${idClipPath})`);
    this.renderer.setAttribute(newImage, "preserveAspectRatio", `${preserveAspectRatio}`);

    return newImage;
  }

  createRect(width: number, height: number, x: number, y: number) {
    let newRect = this.renderer.createElement("rect", "http://www.w3.org/2000/svg");

    this.renderer.setAttribute(newRect, "width", `${width}`);
    this.renderer.setAttribute(newRect, "height", `${height}`);
    this.renderer.setAttribute(newRect, "x", `${x}`);
    this.renderer.setAttribute(newRect, "y", `${y}`);

    return newRect;
  }

  createClipPath(idClipPath: string, width: number, height: number, x: number, y: number) {
    let newClipPath = this.renderer.createElement("clipPath", "http://www.w3.org/2000/svg");
    this.renderer.setProperty(newClipPath, "id", idClipPath);
    this.renderer.appendChild(newClipPath, this.createRect(width, height, x, y));
    return newClipPath;
  }

  createG(
    href: string,
    height: number,
    width: number,
    opacity: number = null,
    x: number = 0,
    y: number = 0,
    idClipPath: string = null,
    preserveAspectRatio: string = "none",
  ) {
    let newG = this.renderer.createElement("g", "http://www.w3.org/2000/svg");
    this.renderer.appendChild(newG, this.createImage(href, height, width, opacity, x, y, idClipPath, preserveAspectRatio));
    return newG;
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

  getRectToImage() {
    let nodeValue = this.getAttribute(this.imageSelected, "clip-path");

    let idClipPath = nodeValue.substring(5, nodeValue.length - 1);

    return this.entorno.nativeElement.firstChild.children.namedItem(idClipPath).firstChild;
  }
  /*
    @HostListener('window:resize', ['$event'])
    getScreenSize(event?) {
      this.screenHeight = window.innerHeight;
      this.screenWidth = window.innerWidth;
    }*/

  /**
   * Captura la posición del mouse y de la pieza seleccionada y asigna a esta última la propiedad onmousemove
   * @param event evento capturado
   */
  selectElement(event: MouseEvent) {
    if (this.starGame) {
      this.imageSelected = this.reordenar(event);
      this.rectSelected = this.getRectToImage();

      this.currentX = event.clientX;
      this.currentY = event.clientY;

      this.currenPositionImageX = parseFloat(this.getAttribute(this.imageSelected, "x"));
      this.currenPositionImageY = parseFloat(this.getAttribute(this.imageSelected, "y"));
      this.currenPositionRectX = parseFloat(this.getAttribute(this.rectSelected, "x"));
      this.currenPositionRectY = parseFloat(this.getAttribute(this.rectSelected, "y"));
    }
  }

  moveElement(event: MouseEvent) {
    if (event.target == this.imageSelected && this.starGame) {
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

      this.iman();
    }
  }

  deSelectElement(event: MouseEvent) {
    if (event.target == this.imageSelected && this.starGame) {
      this.verifyWin();
      if (this.imageSelected != 0) {
        this.imageSelected = 0;
      }
    }
  }

  verifyWin() {
    let bien_ubicada: number = 0;
    this.entorno.nativeElement.childNodes.forEach((element, key) => {
      if (key > 1) {
        let posx = parseFloat(this.getAttribute(element.firstChild, "x"));
        let posy = parseFloat(this.getAttribute(element.firstChild, "y"));
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
  reordenar(event: MouseEvent) {
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
