import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Product } from 'src/app/_models/product';
import { Variant } from 'src/app/_models/sku';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-variants',
  templateUrl: './variants.component.html',
  styleUrls: ['./variants.component.scss']
})
export class VariantsComponent implements OnInit {

  @Input() products: Product[] = [];
  @Input() variants: any[] = [];
  _variants: Variant[] = [];

  @Output() variantsFilter: EventEmitter<any> = new EventEmitter<any>();

  public collapse: boolean = true;
  public loaded: boolean = false;

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    let url = environment.API_URL + "/variants";

    this.http.get(url, {
      observe: 'response'
    }).subscribe(
      success => {
        let body: any = success.body;

        body.forEach(element => {
          let variant = Variant.fromJSON(element);

          this._variants.push(variant);
        });

        this.loaded = true;
      }
    )
  }

  get filterbyvariant() {
    const uniqueVariants = []
    this.products.filter((product) => {
      product.variants.filter((variant) => {
        if (variant.name) {
          const index = uniqueVariants.indexOf(variant.name)
          if (index === -1) uniqueVariants.push(variant.name)
        }
      })
    })
    return uniqueVariants
  }

  filterIdByName(name): string {
    if (this.loaded == true) {
      let filtered = this._variants.filter(element => element.name == name);
      return filtered[0]._id;
    } else {
      return "";
    }
  }

  appliedFilter(event) {
    let index = this.variants.indexOf(event.target.value);  // checked and unchecked value
    if (event.target.checked)
      this.variants.push(event.target.value); // push in array cheked value
    else
      this.variants.splice(index, 1);  // removed in array unchecked value

    let variants = this.variants.length ? { variant: this.variants.join(",") } : { variant: null };
    console.log(variants);
    this.variantsFilter.emit(variants);
  }

  // check if the item are selected
  checked(item) {
    if (this.variants.indexOf(item) != -1) {
      return true;
    }
  }

}
