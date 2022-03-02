import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from "../../shared/classes/product";
import { Wishlist, Stock } from 'src/app/_models/shop';
import { AppShoppingService } from 'src/app/_services/app-shopping.service';
import { AppAuthenticationService } from 'src/app/_services/app-authentication.service';
import { ToastrService } from 'ngx-toastr';
import { QuickEditComponent } from 'src/app/shop/_components/quick-edit/quick-edit.component';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { timingSafeEqual } from 'crypto';
import { ThisReceiver } from '@angular/compiler';
import * as e from 'express';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {

  public products: Product[] = [];
  public wishlist: Wishlist;
  public loaded: boolean = false;
  public loggedIn: boolean = false;

  public screenWidth: any;
  public screenHeight: any;

  @ViewChild("quickEdit") QuickEdit: QuickEditComponent;

  constructor(private router: Router,
    private appShoppingService: AppShoppingService, private appAuthService: AppAuthenticationService, private toastr: ToastrService, private http: HttpClient) {
  }

  ngOnInit(): void {

    this.loggedIn = this.appAuthService.loggedIn();

    AppShoppingService.wishlistSubject.subscribe(value => {
      if (value == true) {
        this.wishlist = AppShoppingService.wishlist;
      } else {
        this.wishlist = new Wishlist();
      }
    });

    if (this.loggedIn == true) {
      this.loadWishlist();
    } else {
      this.wishlist = new Wishlist();
      this.toastr.info("You must log in to use this feature.", "Info");
      this.loaded = true;
    }
  }

  async loadWishlist() {
    this.appShoppingService.fetchWishlist(true, result => {
      if (result == true) {
        this.wishlist = AppShoppingService.wishlist;
        console.log(this.wishlist);
      } else {
        this.wishlist = new Wishlist();
      }
      this.loaded = true;
    });

  }

  moveItem(item: Stock) {
    this.appShoppingService.fromWishlistToBag(item, false, result => {
      if (result == true) {
        this.appShoppingService.fetchWishlist(true, result => { });
      }
    });
  }

  padTitle(title: string, size: number): string {

    return title;

    let titleLength = title.length;

    if (titleLength >= size) {
      return title;
    } else {
      let fillLength = size - titleLength;
      let paddLength = Math.floor(fillLength / 2);

      let blankString = "";
      for (let i = 0; i < paddLength; i++) {
        blankString = blankString + ' ';
      }

      let string = blankString + title + blankString;

      return string;
    }
  }

  getQuantity(item: Stock) {
    if (item.quantity != undefined) {
      return item.quantity;
    } else {
      return 1;
    }
  }



  getPadSize(): number {
    let value = 0;
    if (this.screenWidth > 975) {
      value = 80;
    } else {
      value = 0;
    }

    return value;
  }

  getTitle(stock: Stock): string {
    let string = stock.product.title;

    if (stock.variant != undefined) {
      if (stock.product.variants.length > 1) {
        for (let i = 0; i < stock.product.variants.length; i++) {
          if (stock.variant._id == stock.product.variants[i]._id) {
            string += ", Variant: " + stock.variant.name;
            break;
          }
        }
      }
    } else {
      string += "";
    }


    if (stock.product.sizes.length > 1) {
      if (stock.size != undefined) {
        for (let i = 0; i < stock.product.sizes.length; i++) {
          if (stock.size._id == stock.product.sizes[i]._id) {
            string += ", Size: " + stock.size.name;
            break;
          }
        }
      } else {
        string += "";
      }

    }

    return string;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
  }

  async removeItem(item: Stock) {
    this.appShoppingService.removeFromWishlist(item._id, false, result => {
      if (result == true) {
        AppShoppingService.wishlist.items = AppShoppingService.wishlist.items.filter(element => element._id != item._id);
        //location.reload();
      }
    });
  }

  editItem(item: Stock) {
    this.QuickEdit.stock = item;
    this.QuickEdit.mode = 2;
    this.QuickEdit.openModal();
  }
}
