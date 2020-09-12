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

  entorno1: ElementRef;

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  firtStepCompleted = false;

  propertiesImage = {
    urlImage: null,
    partHorizontal: 1,
    partVertical: 1,
    width: 600,
    height: 600
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

  process() {

    this.entorno.nativeElement.childNodes.forEach(element => {
      this.renderer.removeChild(this.entorno.nativeElement, element)
    });

    this.renderer.setAttribute(this.entorno.nativeElement, "height", `${this.propertiesImage.height}`);
    this.renderer.setAttribute(this.entorno.nativeElement, "width", `${this.propertiesImage.width}`);
    this.renderer.setAttribute(this.entorno.nativeElement, "viewBox", `0 0 ${this.propertiesImage.width} ${this.propertiesImage.height}`);

    let newDefs = this.renderer.createElement("defs", "http://www.w3.org/2000/svg");

    this.renderer.appendChild(this.entorno.nativeElement, newDefs);

    for (let y = 0; y < this.propertiesImage.partVertical; y++) {
      for (let x = 0; x < this.propertiesImage.partHorizontal; x++) {
        let idClip = `clip${x}${y}`;

        let newClipPath = this.renderer.createElement("clipPath", "http://www.w3.org/2000/svg");
        let newRect = this.renderer.createElement("rect", "http://www.w3.org/2000/svg");
        let newG = this.renderer.createElement("g", "http://www.w3.org/2000/svg");
        let newImage = this.renderer.createElement("image", "http://www.w3.org/2000/svg");

        this.renderer.appendChild(newClipPath, newRect);
        this.renderer.appendChild(newDefs, newClipPath);
        this.renderer.appendChild(newG, newImage);
        this.renderer.appendChild(this.entorno.nativeElement, newG);

        this.renderer.setProperty(newClipPath, "id", idClip);

        this.renderer.setAttribute(newRect, "x", `${x * this.propertiesImage.width / this.propertiesImage.partHorizontal}`);
        this.renderer.setAttribute(newRect, "y", `${y * this.propertiesImage.height / this.propertiesImage.partVertical}`);
        this.renderer.setAttribute(newRect, "width", `${this.propertiesImage.width / this.propertiesImage.partHorizontal}`);
        this.renderer.setAttribute(newRect, "height", `${this.propertiesImage.height / this.propertiesImage.partVertical}`);

        this.renderer.addClass(newG, "padre");
        this.renderer.setProperty(newG, "id", "padre0");

        this.renderer.setAttribute(newImage, "preserveAspectRatio", "none");
        this.renderer.addClass(newImage, "movil");
        this.renderer.setAttribute(newImage, "href", `${this.propertiesImage.urlImage}`, "xlink");
        this.renderer.setAttribute(newImage, "height", `${this.propertiesImage.height}`);
        this.renderer.setAttribute(newImage, "width", `${this.propertiesImage.width}`);
        this.renderer.setAttribute(newImage, "clip-path", `url(#${idClip})`);

      }
    }
  }

}
