import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Product } from 'src/app/_models/product';
import { Size } from 'src/app/_models/sku';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-size',
  templateUrl: './size.component.html',
  styleUrls: ['./size.component.scss']
})
export class SizeComponent implements OnInit {

  @Input() products: Product[] = [];
  @Input() size: any[] = [];
  public sizes: Size[] = [];

  @Output() sizeFilter: EventEmitter<any> = new EventEmitter<any>();

  public collapse: boolean = true;
  public loaded: boolean = false;

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    let url = environment.API_URL + "/sizes";

    this.http.get(url, {
      observe: 'response'
    }).subscribe(
      success => {
        let body: any = success.body;

        body.forEach(element => {
          let size = Size.fromJSON(element);

          this.sizes.push(size);
        });

        this.loaded = true;
      }
    );
  }

  get filterbysize() {
    const uniqueSize = []
    this.products.filter((product) => {
      product.sizes.filter((size) => {
        if (size.name) {
          const index = uniqueSize.indexOf(size.name)
          if (index === -1) uniqueSize.push(size.name)
        }
      })
    })
    return uniqueSize
  }

  filterIdByName(name): string {
    if (this.loaded) {
      let filtered = this.sizes.filter(element => element.name == name);
      return filtered[0]._id;
    } else {
      return "";
    }
  }

  appliedFilter(event) {
    let index = this.size.indexOf(event.target.value);  // checked and unchecked value
    if (event.target.checked)
      this.size.push(event.target.value); // push in array cheked value
    else
      this.size.splice(index, 1);  // removed in array unchecked value  

    let size = this.size.length ? { size: this.size.join(",") } : { size: null };
    this.sizeFilter.emit(size);
  }

  // check if the item are selected
  checked(item) {
    if (this.size.indexOf(item) != -1) {
      return true;
    }
  }

}
