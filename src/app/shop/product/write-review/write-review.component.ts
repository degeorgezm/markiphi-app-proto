import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductDetailsMainSlider } from '../../../shared/data/slider';
import { HttpClient } from '@angular/common/http';
import { Product } from 'src/app/_models/product';
import { environment } from 'src/environments/environment';
import { Size, Variant } from 'src/app/_models/sku';
import { AppShoppingService } from 'src/app/_services/app-shopping.service';
import { Stock } from 'src/app/_models/shop';
import { AppAuthenticationService } from 'src/app/_services/app-authentication.service';
import { User } from 'src/app/_models/user';
import { ToastrService } from 'ngx-toastr';
import { blobToBase64 } from 'src/app/_models/macros';

@Component({
    selector: 'app-write-review',
    templateUrl: './write-review.component.html',
    styleUrls: ['./write-review.component.scss']
})
export class WriteReviewComponent implements OnInit {

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

    public ProductDetailsMainSliderConfig: any = ProductDetailsMainSlider;
    public ProductDetailsThumbConfig: any;

    public user: User;
    public rating: number = 0;

    constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient, private appShoppingService: AppShoppingService, private appAuthService: AppAuthenticationService, private toastr: ToastrService) { }

    ngOnInit(): void {


        this.appAuthService.tokenAuthenticate();

        this.user = this.appAuthService.getAuthUser();

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

                    console.log("Successfully fetched product");

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
                },
                error => {
                    console.log("Error fetching product");

                    this.router.navigateByUrl(environment.HOME_URL);
                });
        });
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

    onSubmit(values) {

        values['rating'] = this.rating;

        console.log(values);

        let url = environment.API_URL + "/reviews/" + this.user._id + "/product/" + this.product._id;

        this.http.post(url, values, {
            headers: this.appAuthService.getAuthHeader(),
            observe: 'response'
        }).subscribe(
            success => {
                this.toastr.success("Your review was successfully posted!", "Success!");
                this.router.navigateByUrl("/shop/product/left/sidebar/" + this.product._id);
            },
            error => {
                this.toastr.error("There was an error posting your review.", "Error!");
            }
        )

    }

    onChange(id) {
        let value = $("#" + id).val();

        this.rating = parseInt(value.toString());
        console.log(value);
    }

}
