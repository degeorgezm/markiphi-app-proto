import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DefaultOrder } from '../../../shared/classes/order';
import { OrderService } from '../../../shared/services/order.service';
import { ProductService } from '../../../shared/services/product.service';
import { AppAuthenticationService } from 'src/app/_services/app-authentication.service';
import { AppShoppingService } from 'src/app/_services/app-shopping.service';
import { Order } from 'src/app/_models/shop';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/_models/user';
import { ActivatedRoute } from '@angular/router';
import { blobToBase64, dateToString, addDays } from 'src/app/_models/macros';

const months = {
  0: 'January',
  1: 'February',
  2: 'March',
  3: 'April',
  4: 'May',
  5: 'June',
  6: 'July',
  7: 'August',
  8: 'September',
  9: 'October',
  10: 'November',
  11: 'December'
}

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit, AfterViewInit {

  public orderDetails: DefaultOrder = {};
  public order: Order;
  public user: User;
  public orderId: string;
  public loaded: boolean = false;
  public orderDateString: string;
  public deliveryDate: Date = new Date();
  public deliveryDateString: string;

  constructor(public productService: ProductService, private orderService: OrderService, private appAuthService: AppAuthenticationService, private appShoppingService: AppShoppingService, private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit(): void {

    this.appAuthService.tokenAuthenticate();

    this.user = this.appAuthService.getAuthUser();

    this.orderService.checkoutItems.subscribe(response => this.orderDetails = response);

    this.route.params.subscribe(parameter => {
      this.orderId = parameter.orderId;

      console.log(parameter);

      this.http.get(environment.API_URL + "/shopping/order/" + this.orderId, {
        headers: this.appAuthService.getAuthHeader(),
        observe: 'response'
      }).subscribe(
        success => {
          let body = success.body;

          this.order = Order.fromJSON(body);

          this.orderDateString = dateToString(this.order._creationDate);

          let deliveryDate = addDays(this.order._creationDate, 7);

          this.deliveryDateString = dateToString(deliveryDate);

          for (let i = 0; i < this.order.items.length; i++) {

            this.http.get(environment.API_URL + "/product/" + this.order.items[i].product._id + "/photo/download", { observe: 'response', responseType: 'blob' })
              .subscribe(
                success => {
                  blobToBase64(success.body, result => {
                    this.order.items[i].product.image.src = result;

                    if (i == this.order.items.length - 1) {
                      this.loaded = true;
                    }
                  })
                },
                error => {
                  console.log("Error fetching image");
                  if (i == this.order.items.length - 1) {
                    this.loaded = true;
                  }
                });
          }
        },
        error => {
          console.log("There was an error fetching the order: " + error.error);
        }
      );
    });

  }

  ngAfterViewInit() {

  }

}
