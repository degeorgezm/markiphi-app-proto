import { AfterContentChecked, AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductDetailsMainSlider } from '../../../../shared/data/slider';
import { SizeModalComponent } from "../../../../shared/components/modal/size-modal/size-modal.component";
import { HttpClient } from '@angular/common/http';
import { Product } from 'src/app/_models/product';
import { environment } from 'src/environments/environment';
import { Size, Variant } from 'src/app/_models/sku';
import { AppShoppingService } from 'src/app/_services/app-shopping.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Stock } from 'src/app/_models/shop';
import { AppAuthenticationService } from 'src/app/_services/app-authentication.service';
import { Review } from 'src/app/_models/reviews';
import { blobToBase64 } from 'src/app/_models/macros';

const months = {
  0: 'Jan',
  1: 'Feb',
  2: 'Mar',
  3: 'Apr',
  4: 'May',
  5: 'Jun',
  6: 'Jul',
  7: 'Aug',
  8: 'Sep',
  9: 'Oct',
  10: 'Nov',
  11: 'Dec'
}

@Component({
  selector: 'app-product-left-sidebar',
  templateUrl: './product-left-sidebar.component.html',
  styleUrls: ['./product-left-sidebar.component.scss']
})
export class ProductLeftSidebarComponent implements OnInit, AfterViewInit, AfterContentChecked {

  public product: Product;
  public productId: string;
  public loaded: boolean = false;
  public counter: number = 1;
  public activeSlide: any = 0;
  public selectedSize: string;
  public selectedVariant: string;
  public variant: Variant;
  public size: Size;
  public selectedVariantName: string;
  public mobileSidebar: boolean = false;
  public isInWatchlist: boolean = false;
  public countdownDateString: string = "";
  public reviews: Review[] = [];

  @ViewChild("sizeChart") SizeChart: SizeModalComponent;

  public ProductDetailsMainSliderConfig: any = ProductDetailsMainSlider;
  public ProductDetailsThumbConfig: any;

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient, private appShoppingService: AppShoppingService, private appAuthService: AppAuthenticationService) { }

  ngOnInit(): void {

    let ProductDetailsThumbSlider: any = {
      items: 2,
      loop: false,
      margin: 5,
      dots: true
    }

    this.ProductDetailsThumbConfig = ProductDetailsThumbSlider;

    AppShoppingService.wishlistSubject.subscribe(value => {
      if (value == true) {
        this.updateIsInWishlist();
      }
    });

    this.route.params.subscribe(parameter => {
      this.productId = parameter.productId;

      let url = environment.API_URL + "/product/" + this.productId;
      this.http.get(url, { observe: 'response' }).subscribe(
        async success => {
          let body = success.body;
          this.product = Product.fromJSON(body);
          this.selectedSize = this.product.sizes[0]._id;
          this.selectedVariant = this.product.variants[0]._id;
          this.variant = this.product.variants[0];
          this.size = this.product.sizes[0];
          this.selectedVariantName = this.product.variants[0].name;

          if (this.product.sale) {
            let year = this.product.price_end.getFullYear();
            let month = this.product.price_end.getMonth();
            let day = this.product.price_end.getDate();

            this.countdownDateString = months[month] + " " + day + " " + year;
            console.log(this.countdownDateString);
          }

          console.log("Successfully fetched product");
          console.log(this.product);

          this.appShoppingService.fetchWishlist(true, result => { });

          this.loaded = true;

          this.http.get(environment.API_URL + "/product/" + this.product._id + "/photo/download", { observe: 'response', responseType: 'blob' })
            .subscribe(
              success => {
                blobToBase64(success.body, result => {
                  this.product.image.src = result;
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

          let review_url = environment.API_URL + "/reviews/product/" + this.product._id;

          this.http.get(review_url, {
            observe: 'response'
          }).subscribe(
            success => {
              let body: any = success.body;

              body.forEach(element => {
                let review = Review.fromJSON(element);

                this.reviews.push(review);
              });

              this.loadReviews();

            }
          )
        },
        error => {
          console.log("Error fetching product");

          this.router.navigateByUrl(environment.HOME_URL);
        });
    });
  }

  ngAfterViewInit(): void {


  }

  ngAfterContentChecked(): void {
    this.loadReviews();
  }

  async updateIsInWishlist() {
    this.isInWatchlist = await this.appShoppingService.isInWishlist(this.productId);
  }

  selectSize(size: Size) {
    this.selectedSize = size._id;
    this.size = size;
  }

  selectVariant(variant: Variant) {
    this.selectedVariant = variant._id;
    this.selectedVariantName = variant.name;
    this.variant = variant;

    console.log(this.selectVariant);
  }

  // Increament
  increment() {
    this.counter++;
  }

  // Decrement
  decrement() {
    if (this.counter > 1) this.counter--;
  }

  // Add to cart
  async addToCart() {

    let variant = this.product.variants.filter(element =>
      element._id == this.selectedVariant
    )[0];

    let size = this.product.sizes.filter(element =>
      element._id = this.selectedSize
    )[0];

    let quantity = this.counter;

    let stock = new Stock();
    stock.product = this.product;
    stock.variant = variant;
    stock.size = size;
    stock.quantity = quantity;

    this.appShoppingService.addToBag(stock, false, result => {
      if (result == true) {
        this.router.navigateByUrl("/shop/bag");
      }
    });

  }

  // Add to Wishlist
  addToWishlist() {
    let stock = new Stock();
    stock.product = this.product;
    stock.user = this.appAuthService.getAuthUser();
    stock.variant = this.variant;
    stock.size = this.size;
    stock.quantity = this.counter;
    this.appShoppingService.addToWishlist(stock, false, result => { });
  }

  async removeFromWishlist() {
    let matches = AppShoppingService.wishlist.items.filter(element => element.product._id == this.product._id);

    if (matches.length > 0) {
      for (let i = 0; i < matches.length; i++) {
        this.appShoppingService.removeFromWishlist(matches[i]._id, false, result => {
          if (i == matches.length - 1) {
            this.appShoppingService.fetchWishlist(true, result => { });
          }
        });
      }
    }
  }

  // Toggle Mobile Sidebar
  toggleMobileSidebar() {
    this.mobileSidebar = !this.mobileSidebar;
  }

  loadReviews() {
    for (let i = 0; i < this.reviews.length; i++) {
      let id = i.toFixed(0) + "-star-" + this.reviews[i].rating.toFixed(0);

      $("#" + id).prop('checked', true);
    }
  }

}
