import { Component, OnInit, Input, HostListener } from '@angular/core';
import { AppAuthenticationService } from 'src/app/_services/app-authentication.service';
import { AppShoppingService } from 'src/app/_services/app-shopping.service';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/_models/user';
import { Router } from '@angular/router';
import *  as  data from 'src/assets/i18n/en.json';
import { Wishlist } from 'src/app/_models/shop';
import * as $ from 'jquery'

const SIGNIN_STRING = "My Account"

@Component({
  selector: 'app-header-one',
  templateUrl: './header-one.component.html',
  styleUrls: ['./header-one.component.scss']
})
export class HeaderOneComponent implements OnInit {

  @Input() class: string;
  @Input() themeLogo: string = 'assets/images/icon/logo.png'; // Default Logo
  @Input() topbar: boolean = true; // Default True
  @Input() sticky: boolean = false; // Default false

  topBarTitle: string = "Welcome to Designica";
  callUs: string = data["call-us"];
  phone: string = data["phone"];
  phoneString: string = data["phoneString"];

  myAccountString: string = SIGNIN_STRING;
  user: User;

  public stick: boolean = false;
  public wishlist: Wishlist;
  public loggedIn: boolean = false;
  public searchHidden: boolean = true;


  constructor(private appShoppingService: AppShoppingService, private appAuthService: AppAuthenticationService, private router: Router, private toastr: ToastrService) {
    AppShoppingService.wishlistSubject.subscribe(value => {
      if (value == true) {
        this.wishlist = AppShoppingService.wishlist;
      } else {

      }
    });
  }

  updateLogin(loggedIn: boolean): void {
    if (loggedIn) {
      this.user = this.appAuthService.getAuthUser();

      if ((this.user.firstName != undefined) && (this.user.lastName != undefined)) {
        this.myAccountString = this.user.firstName + " " + this.user.lastName;
        this.loggedIn = true;
      } else {
        this.myAccountString = SIGNIN_STRING;
        this.loggedIn = false;
      }
    } else {
      this.user = new User();
      this.myAccountString = SIGNIN_STRING;
      this.loggedIn = false;
    }
  }

  ngOnInit(): void {
    this.user = this.appAuthService.getAuthUser();

    if ((this.user.firstName != undefined) && (this.user.lastName != undefined)) {
      this.myAccountString = this.user.firstName + " " + this.user.lastName;
      this.loggedIn = true;
    } else {
      this.myAccountString = SIGNIN_STRING;
      this.loggedIn = false;
    }

    AppAuthenticationService.authSubject.subscribe(value => {
      this.updateLogin(Boolean(value));
    });
  }

  // @HostListener Decorator
  @HostListener("window:scroll", [])
  onWindowScroll() {
    this.stick = false;
    /*
    let number = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (number >= 51 && window.innerWidth > 400) { 
      this.stick = true;
    } else {
      this.stick = false;
    }
    */
  }

  login(): void {
    this.router.navigateByUrl('pages/login');
  }

  logout(): void {
    this.appAuthService.logout();
    AppShoppingService.clear();
    this.appShoppingService.deleteAllStorage();
    this.loggedIn = false;
    this.user = new User();
  }

  createAccount(): void {
    this.router.navigateByUrl('pages/register')
  }

  goToWishlist(): void {

    console.log(this.router.url);

    if (this.router.url !== "/shop/wishlist") {
      if (!this.loggedIn) {
        this.toastr.info("Please login or create account to use this feature!", "Attention!");
        this.router.navigateByUrl("/pages/login");
      } else {
        this.router.navigateByUrl("/shop/wishlist");
      }
    } else if (this.wishlist.items.length == 0) {
      this.toastr.info("Add items to you wishlist to view them here!", "Attention!");
    }
  }

  showSearch() {
    console.log("Show Search Clicked");
    if (this.searchHidden) {
      $("#mobile-search").removeClass("hidden");
    } else {
      $("#mobile-search").addClass("hidden");
    }

    this.searchHidden = !this.searchHidden;
  }

}
