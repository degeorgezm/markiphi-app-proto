import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Type } from 'src/app/_models/sku';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

  public types: Type[] = [];
  public collapse: boolean = true;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    let url = environment.API_URL + "/types";

    this.http.get(url, { observe: 'response' }).subscribe(
      success => {
        console.log("Successfully loaded types");

        let body: any = success.body;

        body.forEach(element => {
          let type = Type.fromJSON(element);
          this.types.push(type);
        });
      },
      error => {
        console.log("Error loading types");
      }
    )
  }
}
