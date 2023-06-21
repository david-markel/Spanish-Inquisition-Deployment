import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';

  public holyPeeps: string = "../assets/DALL-E/holyPeeps.png";
  public ciudad: string = "../assets/DALL-E/ciudad.png";
  public convo: string = "../assets/DALL-E/convo.png";
  public dosKnights: string = "../assets/DALL-E/dosKnights.png";
  // public dusk : string = "../assets/DALL-E/dusk.png";
  public tresDudes: string = "../assets/DALL-E/tresDudes.png";
  public yarg: string = "../assets/DALL-E/yarg.png";
  public chosenImage: string = this.holyPeeps;
  public imageArray = [
    this.holyPeeps,
    this.ciudad,
    this.convo,
    this.dosKnights,
    this.tresDudes,
    this.yarg,
  ];

  constructor(private router: Router) {
    let random = Math.floor(Math.random() * this.imageArray.length);
    this.chosenImage = this.imageArray[random];
  }
}
