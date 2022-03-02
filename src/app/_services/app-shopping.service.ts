import { User } from 'src/app/_models/user';
import { Inject, Injectable } from '@angular/core';
import { Product } from 'src/app/_models/product';
import { Size, Variant } from 'src/app/_models/sku';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Wishlist, Stock, Bag } from 'src/app/_models/shop';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AppAuthenticationService } from 'src/app/_services/app-authentication.service';
import { ToastrService } from 'ngx-toastr';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { blobToBase64 } from 'src/app/_models/macros';

// key that is used to access the data in local storage
const WISHLIST_PRODUCT_QUEUED = 'local_wishlist_product_queued';
const WISHLIST_PRODUCT_JSON = 'local_wishlist_product_json';
const WISHLIST_SIZE_JSON = 'local_wishlist_size_json';
const WISHLIST_VARIANT_JSON = 'local_wishlist_variant_json';
const WISHLIST_QUANTITY_JSON = 'local_wishlist_variant_json';

const BAG_STOCK_QUEUED = 'local_bag_stock_queued';
const BAG_PRODUCT_JSON = 'local_bag_product_json';
const BAG_SIZE_JSON = 'local_bag_size_json';
const BAG_VARIANT_JSON = 'local_bag_variant_json';
const BAG_QUANTITY_JSON = 'local_bag_quantity_json';


@Injectable({
    // declares that this service should be created
    // by the root application injector.
    providedIn: 'root',
})
export class AppShoppingService {

    public user: User;
    public userId: string;
    public loggedIn: boolean = false;

    public static wishlistSubject = new Subject();
    public static bagSubject = new Subject();
    public static wishlist: Wishlist;
    public static bag: Bag;

    constructor(private http: HttpClient, private router: Router, private appAuthService: AppAuthenticationService, private toastr: ToastrService, @Inject(LOCAL_STORAGE) private storage: StorageService) {
        this.user = appAuthService.getAuthUser();
        this.userId = this.user._id != undefined ? this.user._id : undefined;

        if (this.userId != undefined) {
            this.loggedIn = true;
        } else {
            this.loggedIn = false;
        }

        AppAuthenticationService.authSubject.subscribe(value => {
            if (value == true) {
                this.user = this.appAuthService.getAuthUser();
                this.userId = this.user._id;
                this.loggedIn = true;
            } else {
                this.user = undefined;
                this.userId = undefined;
                this.loggedIn = false;
            }
        })
    }

    public fetchWishlist(photos: boolean, callback) {

        if (this.loggedIn) {
            let url = environment.API_URL + "/shopping/wishlist/" + this.user._id;

            this.http.get(url, { headers: this.appAuthService.getAuthHeader(), observe: 'response' }).subscribe(
                success => {
                    let body: any = success.body;

                    AppShoppingService.wishlist = Wishlist.fromJSON(body);

                    if (!AppShoppingService.wishlist || AppShoppingService.wishlist.items.length == 0) {
                        AppShoppingService.wishlistSubject.next(true);
                        callback(true);
                        return;
                    } else {
                        if (photos == true) {
                            for (let i = 0; i < AppShoppingService.wishlist.items.length; i++) {
                                console.log(AppShoppingService.wishlist);
                                this.http.get(environment.API_URL + "/product/" + AppShoppingService.wishlist.items[i].product._id + "/photo/download", { observe: 'response', responseType: 'blob' })
                                    .subscribe(
                                        success => {
                                            blobToBase64(success.body, result => {
                                                AppShoppingService.wishlist.items[i].product.image.src = result;

                                                if (i == AppShoppingService.wishlist.items.length - 1) {
                                                    AppShoppingService.wishlistSubject.next(true);
                                                    callback(true);
                                                    return;
                                                }
                                            })
                                        },
                                        error => {
                                            console.log("Error fetching image");
                                            if (i == AppShoppingService.wishlist.items.length - 1) {
                                                AppShoppingService.wishlistSubject.next(true);
                                                callback(true);
                                                return;
                                            }
                                        });
                            }
                        } else {
                            AppShoppingService.wishlistSubject.next(true);
                            callback(true);
                            return;
                        }
                    }
                },
                error => {
                    console.log("Error fetching wishlist");
                    AppShoppingService.wishlist = new Wishlist();
                    AppShoppingService.wishlistSubject.next(false);
                    callback(false);
                    return;
                });
        } else {
            AppShoppingService.wishlist = new Wishlist();
            AppShoppingService.wishlistSubject.next(false);
            callback(false);
            return;
        }
    }


    public fetchBag(photos: boolean, callback) {

        if (this.loggedIn) {
            let url = environment.API_URL + "/shopping/bag/" + this.user._id;

            this.http.get(url, { headers: this.appAuthService.getAuthHeader(), observe: 'response' }).subscribe(
                success => {

                    let body: any = success.body;

                    AppShoppingService.bag = Bag.fromJSON(body);
                    if (AppShoppingService.bag == undefined) {
                        AppShoppingService.bag = new Bag();
                        AppShoppingService.bag.user = this.user;
                        callback(true);
                        return;
                    }

                    if (!AppShoppingService.bag || AppShoppingService.bag.items.length == 0) {
                        AppShoppingService.bag = new Bag();
                        AppShoppingService.bag.user = this.user;
                        AppShoppingService.bagSubject.next(true);
                        callback(true);
                        return;
                    } else {
                        if (photos == true) {
                            for (let i = 0; i < AppShoppingService.bag.items.length; i++) {

                                this.http.get(environment.API_URL + "/product/" + AppShoppingService.bag.items[i].product._id + "/photo/download", { observe: 'response', responseType: 'blob' })
                                    .subscribe(
                                        success => {
                                            blobToBase64(success.body, result => {
                                                AppShoppingService.bag.items[i].product.image.src = result;

                                                if (i == AppShoppingService.bag.items.length - 1) {
                                                    AppShoppingService.bagSubject.next(true);
                                                    callback(true);
                                                    return;
                                                }
                                            })
                                        },
                                        error => {
                                            console.log("Error fetching image");
                                            if (i == AppShoppingService.bag.items.length - 1) {
                                                AppShoppingService.bagSubject.next(true);
                                                callback(true);
                                                return;
                                            }
                                        });
                            }
                        } else {
                            AppShoppingService.bagSubject.next(true);
                            callback(true);
                            return;
                        }
                    }
                },
                error => {
                    console.log("Error fetching bag");
                    AppShoppingService.bag = new Bag();
                    AppShoppingService.bag.user = this.user;
                    AppShoppingService.bagSubject.next(false);
                    callback(false);
                    return;
                });
        } else {
            AppShoppingService.bag = new Bag();
            AppShoppingService.bag.user = this.user;
            AppShoppingService.bagSubject.next(false);
            callback(false);
            return;
        }

    }

    public updateWishlistItem(item: Stock, silent: boolean, callback) {
        if (this.loggedIn) {
            let sku: string = undefined;

            for (let i = 0; i < item.product.stock.length; i++) {
                if (item.variant._id == item.product.stock[i].variant._id) {
                    for (let j = 0; j < item.product.sizes.length; j++) {
                        if ((item.product.stock[i].variant._id == item.variant._id) && (item.product.sizes[j]._id == item.size._id)) {
                            sku = item.product.stock[i].skus[j];
                            break;
                        }
                    }
                }
            }

            if (sku == undefined) {
                if (!silent) { this.toastr.error("Error updating item in wishlist", "Error!"); }
                callback(false);
                return;
            } else {
                let matchesBag = AppShoppingService.bag ? AppShoppingService.bag.items.filter(element => element.sku == sku) : [];

                if (matchesBag.length > 0) {
                    if (!silent) { this.toastr.error("Error updating item in wishlist. Item already exists in bag.", "Error!"); }
                    callback(false);
                    return;
                }

                let params = {
                    product: item.product._id,
                    variant: item.variant._id,
                    size: item.size._id,
                    sku: sku,
                    quantity: item.quantity,
                    stockId: item._id,
                    user: this.userId
                }

                let url = environment.API_URL + "/shopping/wishlist/" + this.userId;

                this.http.put(url, params, { headers: this.appAuthService.getAuthHeader() }).subscribe(
                    success => {
                        if (!silent) { this.toastr.info("Item updated in wishlist", "Wishlist"); }

                        callback(true);

                        this.fetchWishlist(true, result => { });
                    },
                    error => {
                        if (!silent) { this.toastr.error("Error updating item in wishlist", "Error!"); }
                        callback(false);
                        return;
                    });
            }
        } else {
            if (!silent) { this.toastr.error("Error updating item in wishlist. Not logged in.", "Error!"); }
            callback(false);
            return;
        }
    }


    public updateBagItem(item: Stock, silent: boolean, callback) {
        if (this.loggedIn) {

            let sku: string = undefined;

            let url = environment.API_URL + "/shopping/bag/" + this.userId;

            for (let i = 0; i < item.product.stock.length; i++) {
                if (item.variant._id == item.product.stock[i].variant._id) {
                    for (let j = 0; j < item.product.sizes.length; j++) {
                        if ((item.product.stock[i].variant._id == item.variant._id) && (item.product.sizes[j]._id == item.size._id)) {
                            sku = item.product.stock[i].skus[j];
                            break;
                        }
                    }
                }
            }

            if (sku == undefined) {
                if (!silent) { this.toastr.error("Error updating item in bag", "Error!"); }
                callback(false);
                return;
            } else {
                let matchesWishlist = AppShoppingService.wishlist ? AppShoppingService.wishlist.items.filter(element => element.sku == sku) : [];

                let params = {
                    product: item.product._id,
                    variant: item.variant._id,
                    size: item.size._id,
                    sku: sku,
                    quantity: item.quantity,
                    stockId: item._id,
                    user: this.userId
                }


                this.http.put(url, params, { headers: this.appAuthService.getAuthHeader() }).subscribe(
                    async success => {
                        if (!silent) { this.toastr.info("Item successfully updated in bag", "Bag"); }

                        callback(true);

                        matchesWishlist.forEach(element => {
                            this.removeFromWishlist(element._id, true, result => { });
                        });

                        this.fetchBag(true, result => { });
                    },
                    error => {
                        if (!silent) { this.toastr.error("Error updating item in bag", "Error!"); }
                        callback(false);
                        return;
                    });

            }
        } else {
            if (!silent) { this.toastr.error("Error updating item in bag. Not logged in.", "Error!"); }
            callback(false);
            return;
        }
    }

    public addToWishlist(stock: Stock, silent: boolean, callback) {

        if (this.loggedIn) {
            let sku: string = undefined;

            for (let i = 0; i < stock.product.stock.length; i++) {
                if (stock.variant._id == stock.product.stock[i].variant._id) {
                    for (let j = 0; j < stock.product.sizes.length; j++) {
                        if ((stock.product.stock[i].variant._id == stock.variant._id) && (stock.product.sizes[j]._id == stock.size._id)) {
                            sku = stock.product.stock[i].skus[j];
                            break;
                        }
                    }
                }
            }

            if (sku == undefined) {
                callback(false);
                return;
            } else {

                let params = {
                    product: stock.product._id,
                    user: this.userId,
                    size: stock.size._id,
                    variant: stock.variant._id,
                    quantity: stock.quantity,
                    sku: sku
                }

                let matchesWishlist = AppShoppingService.wishlist ? AppShoppingService.wishlist.items.filter(element => element.sku == sku) : [];
                let matchesBag = AppShoppingService.bag ? AppShoppingService.bag.items.filter(element => element.sku == sku) : [];

                if ((matchesWishlist.length == 0) && matchesBag.length == 0) {

                    let url = environment.API_URL + "/shopping/wishlist/" + this.userId;

                    this.http.post(url, params, { headers: this.appAuthService.getAuthHeader() }).subscribe(
                        success => {
                            if (!silent) { this.toastr.info("Item added to wishlist", "Wishlist"); }
                            this.fetchWishlist(true, result => { });
                            callback(true);
                            return;
                        },
                        error => {
                            if (!silent) { this.toastr.error("Error adding item to wishlist", "Error!"); }
                            callback(false);
                            return;
                        });
                } else if (matchesWishlist.length > 0) {

                    let stockId = matchesWishlist[0]._id;
                    params["stockId"] = stockId;

                    let url = environment.API_URL + "/shopping/wishlist/" + this.userId;

                    this.http.put(url, params, { headers: this.appAuthService.getAuthHeader() }).subscribe(
                        success => {
                            if (!silent) { this.toastr.info("Item updated in wishlist", "Wishlist"); }
                            this.fetchWishlist(true, result => { });
                            callback(true);
                            return;
                        },
                        error => {
                            if (!silent) { this.toastr.error("Error updating item in wishlist", "Error!"); }
                            callback(false);
                        });
                } else if (matchesBag.length > 0) {
                    if (!silent) { this.toastr.info("Item already in bag. Wishlist not updated.", "Wishlist"); }
                    callback(true);
                    return;
                }
            }

        } else {
            this.storage.set(WISHLIST_PRODUCT_QUEUED, Boolean(true).toString());
            this.storage.set(WISHLIST_PRODUCT_JSON, stock.product.toJSON());
            this.storage.set(WISHLIST_VARIANT_JSON, stock.variant.toJSON());
            this.storage.set(WISHLIST_SIZE_JSON, stock.size.toJSON());
            this.storage.set(WISHLIST_QUANTITY_JSON, stock.quantity.toString());

            this.toastr.info("Please login to add items to your wishlist", "Attention!");

            this.router.navigateByUrl("/pages/login");
            callback(false);
            return;
        }
    }

    public addToBag(stock: Stock, silent: boolean, callback) {
        if (this.loggedIn) {

            let sku: string = undefined;

            let url = environment.API_URL + "/shopping/bag/" + this.userId;

            for (let i = 0; i < stock.product.stock.length; i++) {
                if (stock.variant._id == stock.product.stock[i].variant._id) {
                    for (let j = 0; j < stock.product.sizes.length; j++) {
                        if ((stock.product.stock[i].variant._id == stock.variant._id) && (stock.product.sizes[j]._id == stock.size._id)) {
                            sku = stock.product.stock[i].skus[j];
                            break;
                        }
                    }
                }
            }

            if (sku == undefined) {
                callback(false);
                return;
            } else {

                let previous = AppShoppingService.bag ? AppShoppingService.bag.items.filter(element => element.sku == sku) : [];

                if (previous.length == 0) {
                    let params = {
                        user: this.userId,
                        product: stock.product._id,
                        variant: stock.variant._id,
                        size: stock.size._id,
                        sku: sku,
                        quantity: stock.quantity
                    }

                    this.http.post(url, params, { headers: this.appAuthService.getAuthHeader() }).subscribe(
                        async success => {
                            if (!silent) { this.toastr.info("Item added to bag", "Bag"); }

                            this.fetchWishlist(true, async result => {
                                if (AppShoppingService.wishlist != undefined) {
                                    let matches = AppShoppingService.wishlist.items.filter(element => element.sku == sku);

                                    if (matches.length > 0) {
                                        for (let i = 0; i < matches.length; i++) {
                                            this.removeFromWishlist(matches[i]._id, true, result => { });
                                            if (i == matches.length - 1) {
                                                this.fetchBag(true, result => { });
                                                callback(true);
                                                return;
                                            }
                                        }
                                    } else {
                                        this.fetchBag(true, result => { });
                                        callback(true);
                                        return;
                                    }
                                } else {
                                    this.fetchBag(true, result => { });
                                    callback(true);
                                    return;
                                }
                            });

                        },
                        error => {
                            if (!silent) { this.toastr.error("Error adding item to bag", "Error!"); }
                            callback(false);
                            return;
                        });
                } else {
                    let item = previous[0];

                    item.quantity += stock.quantity;

                    this.updateBagItem(item, silent, result => {
                        callback(result);
                        return;
                    });
                }
            }
        } else {
            this.storage.set(BAG_STOCK_QUEUED, Boolean(true).toString());
            this.storage.set(BAG_SIZE_JSON, stock.size.toJSON());
            this.storage.set(BAG_VARIANT_JSON, stock.variant.toJSON());
            this.storage.set(BAG_QUANTITY_JSON, stock.quantity.toString());
            this.storage.set(BAG_PRODUCT_JSON, stock.product.toJSON());

            this.toastr.info("Login to add items to your bag", "Attention!");

            this.router.navigateByUrl("/pages/login");
            callback(false);
            return;
        }
    }


    public removeFromWishlist(stockId: string, silent: boolean, callback) {

        if (this.loggedIn) {

            let url = environment.API_URL + "/shopping/wishlist/" + this.userId + "/" + stockId;

            this.http.delete(url, { headers: this.appAuthService.getAuthHeader() }).subscribe(
                success => {
                    if (!silent) { this.toastr.info("Item removed from wishlist", "Wishlist"); }
                    callback(true);
                    return;
                },
                error => {
                    if (!silent) { this.toastr.error("Error removing product from wishlist", "Error!"); }
                    callback(false);
                    return;
                }
            )
        } else {
            console.log("Remove from wishlist called when not logged in. This shouldn't happen...");
            callback(false);
            return;
        }
    }

    public removeFromBag(stockId: string, callback) {

        if (this.loggedIn) {

            let url = environment.API_URL + "/shopping/bag/" + this.userId + "/" + stockId;

            this.http.delete(url, { headers: this.appAuthService.getAuthHeader() }).subscribe(
                async success => {
                    this.toastr.info("Item removed item from bag", "Bag");
                    this.fetchBag(true, result => { });
                    callback(true);
                },
                error => {
                    this.toastr.error("Error removing item from bag", "Error!");
                    callback(false);
                }
            )
        } else {
            console.log("Remove from wishlist called when not logged in. This shouldn't happen...");
            callback(false);
        }
    }

    public fromBagToWishlist(item: Stock, silent: boolean, callback) {

        if (this.loggedIn) {
            let url = environment.API_URL + "/shopping/bag/" + this.userId + "/" + item._id + "/wishlist";

            let params = {
                product: item.product._id,
                variant: item.variant._id,
                size: item.size._id,
                sku: item.sku,
                quantity: item.quantity
            }

            this.http.post(url, params, { headers: this.appAuthService.getAuthHeader() }).subscribe(
                success => {
                    if (!silent) { this.toastr.success("Successfully moved item from bag to wishlist.", "Success!"); }
                    this.fetchBag(true, result => {
                        this.fetchWishlist(true, result => {
                            callback(true);
                            return;
                        });
                    });
                },
                error => {
                    if (!silent) { this.toastr.error("Error moving item from bag to wishlist.", "Error!"); }
                    callback(false);
                    return;
                }
            );
        } else {
            this.toastr.error("Error moving item from bag to wishlist. Not logged in.", "Error!");
            callback(false);
            return;
        }
    }

    public fromWishlistToBag(item: Stock, silent: boolean, callback) {

        if (this.loggedIn) {
            let url = environment.API_URL + "/shopping/wishlist/" + this.userId + "/" + item._id + "/bag";

            let params = {
                product: item.product._id,
                variant: item.variant._id,
                size: item.size._id,
                sku: item.sku,
                quantity: item.quantity
            }

            this.http.post(url, params, { headers: this.appAuthService.getAuthHeader() }).subscribe(
                success => {
                    if (!silent) { this.toastr.success("Successfully moved item from wishlist to bag.", "Success!"); }
                    this.fetchBag(true, result => {
                        this.fetchWishlist(true, result => {
                            callback(true);
                            return;
                        });
                    });
                },
                error => {
                    if (!silent) { this.toastr.error("Error moving item from wishlist to bag.", "Error!"); }
                    callback(false);
                    return;
                }
            );
        } else {
            this.toastr.error("Error moving item from wishlist to bag. Not logged in.", "Error!");
            callback(false);
            return;
        }
    }

    public fetchProducts(params: string, callback) {
        let url = environment.API_URL + "/product" + params;

        let products: Product[] = [];
        this.http.get(url, {
            observe: 'response'
        }).subscribe(
            success => {
                console.log("Successfully fetched items");

                let body: any = success.body;

                body.forEach(element => {
                    let product = Product.fromJSON(element);
                    products.push(product);
                });

                callback(products);
            },
            error => {
                console.log("Error retrieving items");
                callback(products);
            }
        );
    }

    public setQueuedWishlistIfExists(): Promise<boolean> {
        if (this.storage.has(WISHLIST_PRODUCT_QUEUED)) {
            if (Boolean(this.storage.get(WISHLIST_PRODUCT_QUEUED)) == true) {

                let stock = new Stock();
                stock.product = Product.fromJSON(JSON.parse(this.storage.get(WISHLIST_PRODUCT_JSON)));
                stock.size = Size.fromJSON(JSON.parse(this.storage.get(WISHLIST_SIZE_JSON)));
                stock.variant = Variant.fromJSON(JSON.parse(this.storage.get(WISHLIST_VARIANT_JSON)));
                stock.quantity = Number(this.storage.get(WISHLIST_QUANTITY_JSON));

                this.addToWishlist(stock, false, result => {
                    if (result == true) {
                        this.deleteAllStorage();
                        return new Promise(resolve => { resolve(true) });
                    } else {
                        return new Promise(resolve => { resolve(true) });
                    }
                });
            } else {
                return new Promise(resolve => { resolve(true) });
            }
        } else {
            return new Promise(resolve => { resolve(true) });
        }
    }

    public setQueuedBagIfExists(): Promise<boolean> {
        if (this.storage.has(BAG_STOCK_QUEUED)) {
            if (Boolean(this.storage.get(BAG_STOCK_QUEUED)) == true) {
                let stock = new Stock();
                stock.product = Product.fromJSON(JSON.parse(this.storage.get(BAG_PRODUCT_JSON)));
                stock.size = Size.fromJSON(JSON.parse(this.storage.get(BAG_SIZE_JSON)));
                stock.variant = Variant.fromJSON(JSON.parse(this.storage.get(BAG_VARIANT_JSON)));
                stock.quantity = Number(this.storage.get(BAG_QUANTITY_JSON));

                this.addToBag(stock, false, result => {
                    if (result == true) {
                        this.deleteAllStorage();
                        return new Promise(resolve => { resolve(true) });
                    } else {
                        return new Promise(resolve => { resolve(true) });
                    }
                });
            } else {
                return new Promise(resolve => { resolve(true) });
            }
        } else {
            return new Promise(resolve => { resolve(true) });
        }

    }

    public async isInWishlist(productId: string): Promise<boolean> {

        if (AppShoppingService.wishlist) {
            for (let i = 0; i < AppShoppingService.wishlist.items.length; i++) {
                if (productId == AppShoppingService.wishlist.items[i].product._id) {
                    return new Promise(resolve => { resolve(true) });
                }
            }
            return new Promise(resolve => { resolve(false) });
        } else {
            return new Promise(resolve => { resolve(false) });
        }
    }

    public static clear() {
        AppShoppingService.wishlist = new Wishlist();
        AppShoppingService.bag = new Bag();
        AppShoppingService.bagSubject.next(false);
        AppShoppingService.wishlistSubject.next(false);
    }

    public deleteAllStorage(): void {
        this.storage.remove(WISHLIST_PRODUCT_QUEUED);
        this.storage.remove(WISHLIST_PRODUCT_JSON);
        this.storage.remove(WISHLIST_SIZE_JSON);
        this.storage.remove(WISHLIST_VARIANT_JSON);
        this.storage.remove(WISHLIST_QUANTITY_JSON);

        this.storage.remove(BAG_STOCK_QUEUED);
        this.storage.remove(BAG_PRODUCT_JSON);
        this.storage.remove(BAG_SIZE_JSON);
        this.storage.remove(BAG_VARIANT_JSON);
        this.storage.remove(BAG_QUANTITY_JSON);
    }
}