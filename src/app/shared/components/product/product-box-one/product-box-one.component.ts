import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { QuickViewComponent } from "../../modal/quick-view/quick-view.component";
import { QuickViewWishlistComponent } from '../../modal/quick-view-wishlist/quick-view-wishlist.component';
import { CartModalComponent } from "../../modal/cart-modal/cart-modal.component";
import { Product } from "src/app/_models/product";
import { environment } from "src/environments/environment";
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AppShoppingService } from 'src/app/_services/app-shopping.service';
import { Stock } from 'src/app/_models/shop';
import { AppAuthenticationService } from 'src/app/_services/app-authentication.service';
import { blobToBase64 } from 'src/app/_models/macros';

@Component({
  selector: 'app-product-box-one',
  templateUrl: './product-box-one.component.html',
  styleUrls: ['./product-box-one.component.scss']
})
export class ProductBoxOneComponent implements OnInit {

  @Input() product: Product;
  @Input() thumbnail: boolean = true; // Default False 
  @Input() cartModal: boolean = false; // Default False
  @Input() onHowerChangeImage: boolean;

  @ViewChild("quickView") QuickView: QuickViewComponent;
  @ViewChild("quickViewWishlist") QuickViewWishlist: QuickViewWishlistComponent;
  @ViewChild("cartModal") CartModal: CartModalComponent;

  public loaded: boolean;
  public ImageSrc: string;
  constructor(private http: HttpClient, private router: Router, private appShoppingService: AppShoppingService, private appAuthService: AppAuthenticationService) { }

  ngOnInit(): void {


    this.http.get(environment.API_URL + "/product/" + this.product._id + "/photo/download", { observe: 'response', responseType: 'blob' })
      .subscribe(
        success => {
          blobToBase64(success.body, result => {
            this.product.image.src = result;
            this.ImageSrc = result;
          })
        },
        error => {
          console.log("Error fetching primary product image");
        });

    for (let i = 0; i < this.product.images.length; i++) {
      this.http.get(environment.API_URL + "/product/" + this.product._id + "/photos/" + this.product.images[i]._id, { observe: 'response', responseType: 'blob' })
        .subscribe(
          success => {
            blobToBase64(success.body, result => {
              this.product.images[i].src = result;
              if (i == this.product.images.length - 1) {
                this.loaded = true;
              }
            })
          },
          error => {
            console.log("Error fetching product image");
            if (i == this.product.images.length - 1) {
              this.loaded = true;
            }
          });
    }
  }

  // Get Product Color
  Color(variants) {
    const uniqColor = [];
    for (let i = 0; i < Object.keys(variants).length; i++) {
      if (uniqColor.indexOf(variants[i].color) === -1 && variants[i].color) {
        uniqColor.push(variants[i].color)
      }
    }
    return uniqColor
  }

  // Change Variants
  ChangeVariants(color, product) {
    product.variants.map((item) => {
      if (item.color === color) {
        product.images.map((img) => {
          if (img.image_id === item.image_id) {
            this.ImageSrc = img.src;
          }
        })
      }
    })
  }



  // Change Variants Image
  ChangeVariantsImage(src) {
    this.ImageSrc = src;
  }

  async addToWishlist() {
    //this.productService.addToWishlist(product);
    let stock = new Stock();
    stock.user = this.appAuthService.getAuthUser();
    stock.product = this.product;
    stock.variant = this.product.variants[0];
    stock.size = this.product.sizes[0];

    this.appShoppingService.addToWishlist(stock, false, async result => {
      if (result == true) {
        console.log("Product successfully added to wishlist");
        this.appShoppingService.fetchWishlist(true, result => { });
      }
    });
  }

  async removeFromWishlist() {

    let stock = AppShoppingService.wishlist.items.filter(element => element.product._id == this.product._id)[0];

    this.appShoppingService.removeFromWishlist(stock._id, false, result => {
      if (result == true) {
        this.appShoppingService.fetchWishlist(false, result => { });
      }
    });
  }

  goToWishlist() {
    this.router.navigateByUrl("/shop/wishlist");
  }

  addToCompare(product: any) {
    //this.productService.addToCompare(product);
  }

  viewProduct() {
    let url = "/shop/product/left/sidebar/" + this.product._id;

    this.router.navigateByUrl(url);
  }

}
