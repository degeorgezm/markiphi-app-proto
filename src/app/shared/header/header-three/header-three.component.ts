import { Component, OnInit, Input, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AppAuthenticationService } from 'src/app/_services/app-authentication.service';
import { AppShoppingService } from 'src/app/_services/app-shopping.service';
import { ToastrService } from 'ngx-toastr';
import { Wishlist } from 'src/app/_models/shop';
@Component({
  selector: 'app-header-three',
  templateUrl: './header-three.component.html',
  styleUrls: ['./header-three.component.scss']
})
export class HeaderThreeComponent implements OnInit {

  @Input() class: string = 'header-2';
  @Input() themeLogo: string = 'assets/images/icon/logo.png'; // Default Logo
  @Input() topbar: boolean = true; // Default True
  @Input() sticky: boolean = false; // Default false

  public stick: boolean = false;
  public wishlist: Wishlist;
  public loggedIn: boolean = false;

  constructor(private appShoppingService: AppShoppingService, private appAuthService: AppAuthenticationService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  // @HostListener Decorator
  @HostListener("window:scroll", [])
  onWindowScroll() {
    let number = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (number >= 150 && window.innerWidth > 400) {
      this.stick = true;
    } else {
      this.stick = false;
    }
  }

  goToWishlist(): void {

    console.log("1");
    console.log("Foo");
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

}
