import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Product } from 'src/app/_models/product';
import { Brand } from 'src/app/_models/sku';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-brands',
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.scss']
})
export class BrandsComponent implements OnInit {

  @Input() products: Product[] = [];
  @Input() brands: any[] = [];

  public _brands: Brand[] = [];
  public loaded: boolean = false;

  @Output() brandsFilter: EventEmitter<any> = new EventEmitter<any>();

  public collapse: boolean = true;

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    let url = environment.API_URL + "/brands";

    this.http.get(url, {
      observe: 'response'
    }).subscribe(
      success => {
        let body: any = success.body;

        body.forEach(element => {
          let brand = Brand.fromJSON(element);
          console.log(brand);
          this._brands.push(brand);
        });

        this.loaded = true;
      }
    )
  }

  get filterbyBrand() {
    const uniqueBrands = [];
    this.products.filter((product) => {
      if (product.brand) {
        const index = uniqueBrands.indexOf(product.brand.name)
        if (index === -1) uniqueBrands.push(product.brand.name)
      }
    })
    return uniqueBrands
  }

  filterIdByName(name): string {
    if (this.loaded == true) {
      let filtered = this._brands.filter(element => element.name == name);
      return filtered[0]._id;
    } else {
      return "";
    }
  }

  appliedFilter(event) {
    console.log(event.target.value);
    let index = this.brands.indexOf(event.target.value);  // checked and unchecked value
    if (event.target.checked)
      this.brands.push(event.target.value); // push in array cheked value
    else
      this.brands.splice(index, 1);  // removed in array unchecked value  

    let brands = this.brands.length ? { brand: this.brands.join(",") } : { brand: null };
    console.log(brands);
    this.brandsFilter.emit(brands);
  }

  // check if the item are selected
  checked(item) {
    if (this.brands.indexOf(item) != -1) {
      return true;
    }
  }

}
