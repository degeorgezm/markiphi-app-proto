import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Order, OrderItem, OrderStatus, OrderStatusEnum, Stock } from 'src/app/_models/shop';
import { QuickViewComponent } from 'src/app/shared/components/modal/quick-view/quick-view.component';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/_models/user';
import { AppAuthenticationService } from 'src/app/_services/app-authentication.service';
import { HttpClient } from '@angular/common/http';
import { dateToString, timeToString } from 'src/app/_models/macros';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-order-box',
    templateUrl: './order-box.component.html',
    styleUrls: ['./order-box.component.scss']
})
export class OrderBoxComponent implements OnInit {
    bsModalRef: BsModalRef;

    @Input() order: Order;
    @Input() backend: boolean = false;

    @ViewChild("quickView") QuickView: QuickViewComponent;

    public orderDateString: string;
    public orderStatusString: string;
    public orderString: string;
    public user: User;

    constructor(private router: Router, private appAuthService: AppAuthenticationService, private http: HttpClient, private modalService: BsModalService) { }

    ngOnInit(): void {

        this.orderDateString = dateToString(this.order._creationDate);

        this.orderStatusString = this.order.status[this.order.status.length - 1].status;

        switch (this.orderStatusString) {
            case OrderStatusEnum.PURCHASED: {
                if (this.backend == true) {
                    this.orderString = "This order has been purchased and is waiting for processing.";
                } else {
                    this.orderString = "Your order has been purchased and is waiting for processing.";
                }
                break;
            }
            case OrderStatusEnum.PROCESSING: {
                if (this.backend == true) {
                    this.orderString = "This order has been purchased and is currently processing.";
                } else {
                    this.orderString = "Your order has been purchased and is currently processing.";
                }
                break;
            }
            case OrderStatusEnum.SHIPPED: {
                if (this.backend == true) {
                    this.orderString = "This order has been shipped. It should be delivered within the next few business days.";
                } else {
                    this.orderString = "Your order has been shipped. It should be delivered within the next few business days.";
                }
                break;
            }
            case OrderStatusEnum.DELIVERED: {
                if (this.backend == true) {
                    this.orderString = "This order has been delivered";
                } else {
                    this.orderString = "Your order has been delivered.";
                }
                break;
            }
        }

        this.user = this.appAuthService.getAuthUser();

        this.order.items.forEach(item => {
            let url = environment.API_URL + "/reviews/" + this.user._id + "/product/" + item.product._id;

            this.http.get(url, {
                headers: this.appAuthService.getAuthHeader(),
                observe: 'response'
            }).subscribe(
                success => {
                    item.review = undefined;
                },
                error => {
                    let body: any = error.error;

                    item.review = body._id;
                }
            )

        })
    }

    getTitle(stock: Stock): string {
        let string = stock.quantity + " × " + stock.product.title;

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

    buyAgain(item: OrderItem) {
        this.QuickView.product = item.product;
        this.QuickView.size_in = item.size;
        this.QuickView.variant_in = item.variant;
        this.QuickView.init();
        this.QuickView.openModal();
    }

    writeReview(item: OrderItem) {

        this.router.navigateByUrl("/shop/product/write-review/" + item.product._id);

    }

    viewOrderDetails(order: Order) {
        const initialState = {
            list: {
                order: order
            }
        }

        this.bsModalRef = this.modalService.show(ViewOrderDetailsSubcomponent, { initialState });
    }
}



@Component({
    selector: 'app-view-order-details-sub',
    template: `
    <section class="section-b-space" style="padding-bottom: 10px; padding-top: 10px"> 
    <div class="container">
          <button type="button" class="close" (click)="bsModalRef.hide()">
              <span aria-hidden="true">&times;</span>
          </button>
          <div style="margin-top:4px;">
            <h4>Order Details</h4>
          </div>
          <hr>
          <div class="row form group row-padding" >
            <h5>Order #: <b>{{order.orderId}}</b></h5>
          </div>
          <div class="row form group row-padding" >
            <h5>Order Date: <b>{{orderTime}} {{orderDate}}</b></h5>

          </div>
          <div class="row form group row-padding" >
            <h5>Order Status: <b>{{status.status}}</b></h5>

          </div>
          <div class="row form group row-padding" >
            <h5>Status Date: <b>{{statusTime}} {{statusDate}}</b></h5>
          </div>
          <div class="row form group row-padding" >
            <h5>Number of Products: <b>{{numProducts}}</b></h5>
          </div>
          <div class="row form group row-padding" >
            <h5>Number of Items: <b>{{numItems}}</b></h5>
          </div>
          <div class="row form group row-padding" >
            <h5>Subtotal: <b>{{"$"+subtotal.toFixed(2)}}</b></h5>
          </div>
          <div class="row form group row-padding" >
            <h5>Tax: <b>{{"$"+tax.toFixed(2)}}</b></h5>
          </div>
          <div class="row form group row-padding" >
            <h5>Shipping: <b>{{"$"+shipping.toFixed(2)}}</b></h5>
          </div>
          <div class="row form group row-padding" >
            <h5>Total: <b>{{"$"+total.toFixed(2)}}</b></h5>
          </div>  
          <div class="row form group row-padding" >
                <button class="btn btn-primary" style="border-radius:4px; width:100%;" (click)="close()">Close</button>
            </div>
        </div>
        </section>`,
    styleUrls: ['./order-box.component.scss']
})
export class ViewOrderDetailsSubcomponent implements OnInit {

    list: Object;

    public user: User;
    public order: Order;
    public status: OrderStatus;
    public statusDate: string;
    public statusTime: string;
    public orderDate: string;
    public orderTime: string;
    public numProducts: number;
    public numItems: number = 0;
    public subtotal: number;
    public tax: number;
    public shipping: number;
    public total: number;

    constructor(public bsModalRef: BsModalRef) { }

    ngOnInit(): void {

        this.order = this.list['order'];
        this.status = this.order.getStatus();
        this.statusTime = timeToString(this.status._creationDate);
        this.statusDate = dateToString(this.status._creationDate);
        this.orderTime = timeToString(this.order._creationDate);
        this.orderDate = dateToString(this.order._creationDate);

        this.numProducts = this.order.items.length;
        this.order.items.forEach(item => {
            this.numItems += item.quantity;
        });

        this.subtotal = this.order.sub_total;
        this.tax = this.order.tax;
        this.shipping = this.order.shipping;
        this.total = this.order.total;
    }

    close(): void {
        this.bsModalRef.hide();
    }

}

