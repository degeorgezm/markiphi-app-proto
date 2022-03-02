import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { Product } from 'src/app/_models/product';
import { AppShoppingService } from 'src/app/_services/app-shopping.service';
import { Department, Size, Brand, Variant, Type } from 'src/app/_models/sku';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, from } from 'rxjs';

@Component({
  selector: 'app-collection-left-sidebar',
  templateUrl: './collection-left-sidebar.component.html',
  styleUrls: ['./collection-left-sidebar.component.scss']
})
export class CollectionLeftSidebarComponent implements OnInit {

  public grid: string = 'col-xl-3 col-md-6';
  public layoutView: string = 'grid-view';
  public products: Product[] = [];

  // ID Tags
  public variant: any[] = [];
  public department: any[] = [];
  public brand: any[] = [];
  public size: any[] = [];
  public type: any[] = [];

  // Name Tags
  public _department: any[] = [];
  public _variant: any[] = [];
  public _brand: any[] = [];
  public _size: any[] = [];
  public _type: any[] = [];

  public minPrice: number = 0;
  public maxPrice: number = 10000;
  public tags: any[] = [];
  public category: string;
  public _category: string;
  public pageNo: number = 1;
  public paginate: any = {}; // Pagination use only
  public sortBy: string; // Sorting Order
  public mobileSidebar: boolean = false;

  public departments: Department[] = [];
  public variants: Variant[] = [];
  public brands: Brand[] = [];
  public sizes: Size[] = [];
  public types: Type[] = [];

  public defualtImage = "assets/images/variant-color.jpg";
  public blankImage = "assets/images/blank-image.jpg";

  constructor(private route: ActivatedRoute, private router: Router,
    private viewScroller: ViewportScroller, private appShoppingService: AppShoppingService, private http: HttpClient) {

    // Get SKU Information
    let url = environment.API_URL + "/skus";

    this.http.get(url, {
      observe: 'response'
    }).subscribe(
      success => {

        console.log("Successfully fetched skus");

        let departments = success.body['departments'];
        let sizes = success.body['sizes'];
        let variants = success.body['variants'];
        let brands = success.body['brands'];
        let types = success.body['types'];

        departments.forEach(element => {
          let department = Department.fromJSON(element);
          this.departments.push(department);
        });

        sizes.forEach(element => {
          let size = Size.fromJSON(element);
          this.sizes.push(size);
        });

        variants.forEach(element => {
          let variant = Variant.fromJSON(element);

          if (variant.image == undefined) {
            variant.image = this.blankImage;
          }

          this.variants.push(variant);
        });

        brands.forEach(element => {
          let brand = Brand.fromJSON(element);
          this.brands.push(brand);
        });

        types.forEach(element => {
          let type = Type.fromJSON(element);
          this.types.push(type);
        })
      },
      error => {
        console.log("Error fetching SKUs");
      });

    // Subscribe to query Params
    this.route.queryParams.subscribe(params => {

      const httpParams = new HttpParams();

      this._variant = [];
      this._brand = [];
      this._department = [];
      this._size = [];
      this._type = [];

      this.variant = params.variant ? params.variant.split(",") : [];
      this.brand = params.brand ? params.brand.split(",") : [];
      this.department = params.department ? params.department.split(",") : [];
      this.size = params.size ? params.size.split(",") : [];
      this.type = params.category ? params.category.split(",") : [];

      this.variant.forEach(id => {
        let _ = this.variants.filter(element => element._id == id);
        this._variant.push(_[0].name);
      });

      this.department.forEach(id => {
        let _ = this.departments.filter(element => element._id == id);
        this._department.push(_[0].name);
      });

      this.brand.forEach(id => {
        let _ = this.brands.filter(element => element._id == id);
        this._brand.push(_[0].name);
      });

      this.size.forEach(id => {
        let _ = this.sizes.filter(element => element._id == id);
        this._size.push(_[0].name);
      });

      this.type.forEach(id => {
        let _ = this.types.filter(element => element._id == id);
        this._type.push(_[0].name);
      })

      this.tags = [...this._type, ...this._brand, ...this._variant, ...this._size, ...this._department]; // All Name Tags Array

      if (params.minPrice && params.maxPrice) {
        this.minPrice = params.minPrice;
        this.maxPrice = params.maxPrice;
      };

      let paramsUrl = "";
      let count = 0;
      if (params.variant || params.brand || params.department || params.size || params.category || params.minPrice || params.maxPrice) {
        paramsUrl += "?";

        if (params.variant) {
          paramsUrl += "variant=";
          paramsUrl += params.variant.split(",");
        }

        if (params.brand) {
          if (paramsUrl.charAt(paramsUrl.length - 1) != "?") paramsUrl += "&";
          paramsUrl += "brand=";
          paramsUrl += params.brand.split(",");
        }

        if (params.department) {
          if (paramsUrl.charAt(paramsUrl.length - 1) != "?") paramsUrl += "&";
          paramsUrl += "department=";
          paramsUrl += params.department.split(",");
        }

        if (params.size) {
          if (paramsUrl.charAt(paramsUrl.length - 1) != "?") paramsUrl += "&";
          paramsUrl += "size=";
          paramsUrl += params.size.split(",");
        }

        if (params.category) {
          if (paramsUrl.charAt(paramsUrl.length - 1) != "?") paramsUrl += "&";
          paramsUrl += "type=";
          paramsUrl += params.category.split(",");
        }

        if (params.minPrice) {
          if (paramsUrl.charAt(paramsUrl.length - 1) != "?") paramsUrl += "&";
          paramsUrl += "minPrice=";
          paramsUrl += params.minPrice;
        }

        if (params.maxPrice) {
          if (paramsUrl.charAt(paramsUrl.length - 1) != "?") paramsUrl += "&";
          paramsUrl += "maxPrice=";
          paramsUrl += params.maxPrice;
        }
      }

      this.sortBy = params.sortBy ? params.sortBy : 'ascending';
      this.pageNo = params.page ? params.page : this.pageNo;

      //this.filterProductsBy(this.brand, this.department, this.variant, this.size);
      console.log(paramsUrl);

      // Get All Products
      appShoppingService.fetchProducts(paramsUrl, results => {
        this.products = results;
        this.sortProductsBy();
      });

      /*
        // Paginate Products
        this.paginate = this.productService.getPager(this.products.length, +this.pageNo);     // get paginate object from service
        this.products = this.products.slice(this.paginate.startIndex, this.paginate.endIndex + 1); // get current page of items
      })
      */
    });
  }

  sortProductsBy() {
    switch (this.sortBy) {
      case 'ascending':
        this.products.sort((a, b) => {
          if (a._id < b._id) {
            return -1;
          } else if (a._id > b._id) {
            return 1;
          }
          return 0;
        });
        break;
      case 'a-z':
        this.products.sort((a, b) => {
          if (a.title < b.title) {
            return -1;
          } else if (a.title > b.title) {
            return 1;
          }
          return 0;
        });
        break;
      case 'z-a':
        this.products.sort((a, b) => {
          if (a.title > b.title) {
            return -1;
          } else if (a.title < b.title) {
            return 1;
          }
          return 0;
        })
        break
      case 'low':
        this.products.sort((a, b) => {
          if (a.price < b.price) {
            return -1;
          } else if (a.price > b.price) {
            return 1;
          }
          return 0;
        })
        break;
      case 'high':
        this.products.sort((a, b) => {
          if (a.price > b.price) {
            return -1;
          } else if (a.price < b.price) {
            return 1;
          }
          return 0;
        });
    }
  }

  ngOnInit(): void {
  }


  // Append filter value to Url
  updateFilter(tags: any) {
    tags.page = null; // Reset Pagination
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: tags,
      queryParamsHandling: 'merge', // preserve the existing query params in the route
      skipLocationChange: false  // do trigger navigation
    }).finally(() => {
      this.viewScroller.setOffset([120, 120]);
      this.viewScroller.scrollToAnchor('products'); // Anchore Link
    });
  }

  // SortBy Filter
  sortByFilter(value) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sortBy: value ? value : null },
      queryParamsHandling: 'merge', // preserve the existing query params in the route
      skipLocationChange: false  // do trigger navigation
    }).finally(() => {
      this.viewScroller.setOffset([120, 120]);
      this.viewScroller.scrollToAnchor('products'); // Anchore Link
    });
  }

  // Remove Tag
  removeTag(_tag) {
    console.log(_tag);

    this.brand = [];
    this.department = [];
    this.size = [];
    this.variant = [];
    this.type = [];

    // passed _ version of tag (Name Version)
    this._brand = this._brand.filter(val => val !== _tag);
    this._department = this._department.filter(val => val !== _tag);
    this._size = this._size.filter(val => val !== _tag);
    this._variant = this._variant.filter(val => val !== _tag);
    this._type = this._type.filter(val => val !== _tag);

    this._variant.forEach(name => {
      let _ = this.variants.filter(element => element.name == name);
      this.variant.push(_[0]._id);
    });

    this._department.forEach(name => {
      let _ = this.departments.filter(element => element.name == name);
      this.department.push(_[0]._id);
    });

    this._brand.forEach(name => {
      let _ = this.brands.filter(element => element.name == name);
      this.brand.push(_[0]._id);
    });

    this._size.forEach(name => {
      let _ = this.sizes.filter(element => element.name == name);
      this.size.push(_[0]._id);
    });

    this._type.forEach(name => {
      let _ = this.types.filter(element => element.name == name);
      this.type.push(_[0]._id);
    });

    let params = {
      brand: this.brand.length ? this.brand.join(",") : null,
      variant: this.variant.length ? this.variant.join(",") : null,
      size: this.size.length ? this.size.join(",") : null,
      department: this.department.length ? this.department.join(",") : null,
      category: this.type.length ? this.type.join(",") : null
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge', // preserve the existing query params in the route
      skipLocationChange: false  // do trigger navigation
    }).finally(() => {
      this.viewScroller.setOffset([120, 120]);
      this.viewScroller.scrollToAnchor('products'); // Anchore Link
    });
  }

  // Clear Tags
  removeAllTags() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      skipLocationChange: false  // do trigger navigation
    }).finally(() => {
      this.viewScroller.setOffset([120, 120]);
      this.viewScroller.scrollToAnchor('products'); // Anchore Link
    });
  }

  // product Pagination
  setPage(page: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page },
      queryParamsHandling: 'merge', // preserve the existing query params in the route
      skipLocationChange: false  // do trigger navigation
    }).finally(() => {
      this.viewScroller.setOffset([120, 120]);
      this.viewScroller.scrollToAnchor('products'); // Anchore Link
    });
  }

  // Change Grid Layout
  updateGridLayout(value: string) {
    this.grid = value;
  }

  // Change Layout View
  updateLayoutView(value: string) {
    this.layoutView = value;
    if (value == 'list-view')
      this.grid = 'col-lg-12';
    else
      this.grid = 'col-xl-3 col-md-6';
  }

  // Mobile sidebar
  toggleMobileSidebar() {
    this.mobileSidebar = !this.mobileSidebar;
  }

}
