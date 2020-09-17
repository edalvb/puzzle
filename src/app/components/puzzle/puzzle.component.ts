import { Component, Renderer2, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-puzzle',
  templateUrl: './puzzle.component.html',
  styleUrls: ['./puzzle.component.css',]
})
export class PuzzleComponent implements OnInit {
  @ViewChild("entorno") entorno: ElementRef;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  propertiesImage = {
    titleGame: "Puzzle",
    urlImage: "https://images8.alphacoders.com/969/thumb-1920-969049.png",
    partHorizontal: 3,
    partVertical: 3,
    width: 300,
    height: 300,
    covered: 85,
    points: 0,
    games: 0
  };

  propertiesImageTemp = {};

  starGame = false;

  themeDark = false;

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  currentX: number;
  currentY: number;
  currenPositionImageX: number;
  currenPositionImageY: number;
  currenPositionRectX: number;
  currenPositionRectY: number;

  imageSelected: any;
  rectSelected: any;

  jsonPuzzle: string;

  listenMouseDownImage: any;
  listenMouseMoveImage: any
  listenMouseOutImage: any;
  listenMouseUpImage: any;

  constructor(
    private _formBuilder: FormBuilder,
    private renderer: Renderer2,
    private breakpointObserver: BreakpointObserver) { }

  ngOnInit() {

    this.jsonPuzzle = this.getJsonFormated();

    this.firstFormGroup = this._formBuilder.group({
      part: ['', [Validators.required]],
      url: ['', [Validators.required/*, Validators.pattern(reg)*/]]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });

  }

  ngAfterViewInit() {
    this.start();
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
    this.renderer.setAttribute(this.entorno.nativeElement, "width", `${window.screen.width}`);
    this.renderer.setAttribute(this.entorno.nativeElement, "viewBox", `0 0 ${this.propertiesImage.width} ${this.propertiesImage.height}`);

    const DEFT = this.renderer.createElement("defs", "http://www.w3.org/2000/svg");

    this.renderer.appendChild(this.entorno.nativeElement, DEFT);

    const WIDTH_PART = this.propertiesImage.width / this.propertiesImage.partHorizontal;
    const HEIGHT_PART = this.propertiesImage.height / this.propertiesImage.partVertical;
    const MAX_HEIGHT = this.propertiesImage.height - HEIGHT_PART;

    let idClip: string;

    let positionInitRectX: number; // [0, 1, 2, 3, ...] * [ancho de la pieza]

    let positionInitRectY: number; // [0, 1, 2, 3, ...] * [alto de la pieza]

    let moveX: number;

    let moveY: number; // Contante aleatoria que va desde (MAX_HEIGHT -positionInitRectY) hasta  positionInitRectY

    let positionRectX: number;

    let positionRectY: number; // Se va a mover desde 0 hasta MAX_HEIGHT

    for (let y = 0; y < this.propertiesImage.partVertical; y++) {
      for (let x = 0; x < this.propertiesImage.partHorizontal; x++) {
        idClip = `clip${x}${y}`;

        positionInitRectX = x * WIDTH_PART;

        positionInitRectY = y * HEIGHT_PART;

        moveX = this.moveXAllScreen(WIDTH_PART, positionInitRectX);

        moveY = Math.floor(((MAX_HEIGHT - positionInitRectY) * Math.random()) + Math.random() * -positionInitRectY);

        positionRectX = positionInitRectX + moveX;

        positionRectY = positionInitRectY + moveY;

        this.renderer.appendChild(DEFT, this.createClipPath(idClip, WIDTH_PART, HEIGHT_PART, positionRectX, positionRectY));

        if (x == 0 && x == y) {
          this.renderer.appendChild(this.entorno.nativeElement, this.createG(this.propertiesImage.urlImage, this.propertiesImage.height, this.propertiesImage.width, 0.2));
        }

        this.renderer.appendChild(this.entorno.nativeElement, this.createG(
          this.propertiesImage.urlImage,
          this.propertiesImage.height,
          this.propertiesImage.width,
          null,
          moveX,
          moveY,
          idClip
        ));

      }
    }
  }

  moveXLeft(widthPart: number, positionInitRectX: number): number {
    return -(widthPart + positionInitRectX + Math.floor(Math.random() * widthPart));
  }

  moveXAllScreen(widthPart: number, positionInitRectX: number): number {
    let positionScreen = (window.screen.width - this.propertiesImage.width) / 2;
    return Math.floor(
      Math.random() * (window.screen.width - (positionInitRectX + widthPart + positionScreen)) -
      Math.random() * (positionInitRectX + positionScreen)
      );
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
    this.renderer.setAttribute(newImage, "preserveAspectRatio", `${preserveAspectRatio}`);

    if (idClipPath != null) {
      this.renderer.setAttribute(newImage, "clip-path", `url(#${idClipPath})`);

      this.listenMouseDownImage = this.renderer.listen(newImage, "mousedown", (event: MouseEvent) => { this.selectElement(event); });
    }

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
    this.listenMouseDownImage();
    this.start();
  }

  getRectToImage(el: ElementRef) {
    let nodeValue = this.getAttribute(el, "clip-path");

    let idClipPath = nodeValue.substring(5, nodeValue.length - 1);

    return this.entorno.nativeElement.firstChild.children.namedItem(idClipPath).firstChild;
  }

  /**
   * Captura la posición del mouse y de la pieza seleccionada y asigna a esta última la propiedad onmousemove
   * @param event evento capturado
   */
  selectElement(event: MouseEvent) {

    if (this.imageSelected != event.target) {
      this.imageSelected = this.reordenar(event);
      this.rectSelected = this.getRectToImage(this.imageSelected);
    }

    this.currentX = event.clientX;
    this.currentY = event.clientY;

    this.currenPositionImageX = parseFloat(this.getAttribute(this.imageSelected, "x"));
    this.currenPositionImageY = parseFloat(this.getAttribute(this.imageSelected, "y"));
    this.currenPositionRectX = parseFloat(this.getAttribute(this.rectSelected, "x"));
    this.currenPositionRectY = parseFloat(this.getAttribute(this.rectSelected, "y"));

    this.listenMouseMoveImage = this.renderer.listen(this.imageSelected, "mousemove", (event: MouseEvent) => { this.moveElement(event); });
  }

  moveElement(event: MouseEvent) {
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

    this.listenMouseOutImage = this.renderer.listen(this.imageSelected, "mouseout", () => { this.deSelectElement(); });

    this.listenMouseUpImage = this.renderer.listen(this.imageSelected, "mouseup", () => { this.deSelectElement(); });

    this.iman();
  }

  deSelectElement() {
    this.verifyWin();
    if (this.imageSelected != 0) {
      // elimina el listen "mousemove" de Image
      //removeEventListener(this.imageSelected, "mousemove");
      this.listenMouseMoveImage();
      // elimina el listen "mouseout" de Image
      this.listenMouseOutImage();
      // elimina el listen "mouseup" de Image
      this.listenMouseUpImage();

      this.listenMouseDownImage = this.renderer.listen(this.imageSelected, "mousedown", (event: MouseEvent) => { this.selectElement(event); });

      this.imageSelected = 0;
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
