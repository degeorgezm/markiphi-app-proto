import { Component, OnInit, Injectable, PLATFORM_ID, Inject, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AppShoppingService } from 'src/app/_services/app-shopping.service';
import { Bag, Stock, Wishlist } from 'src/app/_models/shop';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  public search: boolean = false;
  public bag: Bag;
  public wishlist: Wishlist;

  public screenWidth: number;
  public screenHeight: number;

  public languages = [{
    name: 'English',
    code: 'en'
  }];

  public currencies = [{
    name: 'Dollar',
    currency: 'USD',
    price: 1 // price of usd
  }]

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private translate: TranslateService, private appShoppingService: AppShoppingService, private toastr: ToastrService) { }

  ngOnInit(): void {

    AppShoppingService.bagSubject.subscribe(value => {
      if (value == true) {
        this.bag = AppShoppingService.bag;
      } else {
        this.bag = new Bag();
      }
    });

    AppShoppingService.wishlistSubject.subscribe(value => {
      if (value == true) {
        this.wishlist = AppShoppingService.wishlist;
      } else {
        this.wishlist = new Wishlist();
      }
    });

    this.appShoppingService.fetchBag(true, result => { });
    this.appShoppingService.fetchWishlist(false, result => { });
  }

  searchToggle() {
    this.search = !this.search;
  }

  changeLanguage(code) {
    if (isPlatformBrowser(this.platformId)) {
      this.translate.use(code)
    }
  }

  getTotalItems(): number {
    if (this.bag != undefined) {
      return this.bag.getTotalItems();
    } else {
      return 0;
    }
  }

  getTotalWishlistItems(): number {
    if (this.wishlist != undefined) {
      return this.wishlist.getTotalItems();
    } else {
      return 0;
    }
  }

  removeItem(item: Stock) {
    this.appShoppingService.removeFromBag(item._id, result => {
      if (result == true) {
        //this.toastr.success("Item successfully removed", "Success!");
      } else {
        //this.toastr.error("Error removing item", "Error!");
      }
    });
  }

  changeCurrency(currency: any) {
    console.log("Change curreny clicked");
  }


  public flip: boolean = undefined;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;

    if (this.screenWidth <= 767) {
      if (this.flip != false) {
        this.flip = false;
        $("#search-form").addClass("small-width-search-container");
      }
    } else if (this.screenWidth >= 768) {
      if (this.flip != true) {
        this.flip = true;
        $("#search-form").removeClass("small-width-search-container");
      }
    }
  }

}
