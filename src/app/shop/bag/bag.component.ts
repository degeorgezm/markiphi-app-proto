import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { ifError } from 'assert';
import { Observable } from 'rxjs';
import { AppAuthenticationService } from 'src/app/_services/app-authentication.service';
import { AppShoppingService } from 'src/app/_services/app-shopping.service';
import { Product } from 'src/app/_models/product';
import { Bag, Stock } from 'src/app/_models/shop';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { QuickEditComponent } from "src/app/shop/_components/quick-edit/quick-edit.component";
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-bag',
  templateUrl: './bag.component.html',
  styleUrls: ['./bag.component.scss']
})
export class BagComponent implements OnInit {

  public bag: Bag;
  public error: boolean = false;
  public loaded: boolean = false;
  public loggedIn: boolean = false;
  public selectedStock: Stock;

  public screenWidth: any;
  public screenHeight: any;

  @ViewChild("quickEdit") QuickEdit: QuickEditComponent;

  constructor(private appShoppingService: AppShoppingService, private appAuthService: AppAuthenticationService, private http: HttpClient, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.loggedIn = this.appAuthService.loggedIn();

    AppShoppingService.bagSubject.subscribe(value => {
      if (value == true) {
        this.bag = AppShoppingService.bag;
      } else {
        this.bag = new Bag();
      }
    });

    if (this.loggedIn) {
      this.loadBag()
    } else {
      this.bag = new Bag();
      this.toastr.info("You must log in to use this feature.", "Info");
      this.loaded = true;
    }
  }

  async loadBag() {
    this.appShoppingService.fetchBag(true, result => {
      this.loaded = true;
    });

  }

  removeItem(item: Stock) {
    this.appShoppingService.removeFromBag(item._id, result => {
      if (result == true) {
        this.appShoppingService.fetchBag(true, result => { });
        //location.reload();
      }
    });
  }

  editItem(item: Stock) {
    this.QuickEdit.stock = item;
    this.QuickEdit.mode = 1;
    this.QuickEdit.openModal();
  }

  moveItem(item: Stock) {
    this.appShoppingService.fromBagToWishlist(item, false, result => {
      if (result == true) {
        // location.reload();
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

    if (stock.product.variants.length > 1) {
      string += ", " + stock.variant.name;
    }

    if (stock.product.sizes.length > 1) {
      string += ", Size: " + stock.size.name;
    }

    return string;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
  }
}
