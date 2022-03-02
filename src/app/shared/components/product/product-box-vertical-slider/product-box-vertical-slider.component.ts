import { Component, OnInit, Input } from '@angular/core';
import { NewProductSlider } from '../../../data/slider';
import { Product } from 'src/app/_models/product';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { blobToBase64 } from 'src/app/_models/macros';

@Component({
  selector: 'app-product-box-vertical-slider',
  templateUrl: './product-box-vertical-slider.component.html',
  styleUrls: ['./product-box-vertical-slider.component.scss']
})
export class ProductBoxVerticalSliderComponent implements OnInit {

  @Input() title: string = 'New Product'; // Default
  @Input() type: string = '608fd45ea6bd651ce725329e'; // Default New Item's

  public products: Product[] = [];

  public NewProductSliderConfig: any = NewProductSlider;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {

    let url = environment.API_URL + "/fetch/group/" + this.type;

    this.http.get(url, { observe: 'response' }).subscribe(
      success => {
        let body: any = success.body;

        body.forEach(element => {
          let product = Product.fromJSON(element);
          this.products.push(product);
        });

        for (let i = 0; i < this.products.length; i++) {
          this.http.get(environment.API_URL + "/product/" + this.products[i]._id + "/photo/download", { observe: 'response', responseType: 'blob' })
            .subscribe(
              success => {

                blobToBase64(success.body, result => {
                  this.products[i].image.src = result;
                })
              },
              error => {
                console.log("Error fetching image");
              });
        }
      },
      error => {
        console.log("Error loading group");
      });
  }
}
