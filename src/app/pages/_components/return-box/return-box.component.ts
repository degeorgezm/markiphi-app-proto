import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Order, StockStatusEnum, OrderItem, isReturnStarted, OrderStatus } from 'src/app/_models/shop';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { User } from 'src/app/_models/user';
import { AppAuthenticationService } from 'src/app/_services/app-authentication.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { dateToString, timeToString } from 'src/app/_models/macros';

@Component({
    selector: 'app-return-box',
    templateUrl: './return-box.component.html',
    styleUrls: ['./return-box.component.scss']
})
export class ReturnBoxComponent implements OnInit {
    bsModalRef: BsModalRef;

    @Input() item: OrderItem;
    @Input() order: Order;

    public returnStarted: boolean = false;

    @Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();

    public returnStatusString: StockStatusEnum;
    public user: User;
    public status: OrderStatus;
    public statusDate: string;
    public statusTime: string;

    constructor(private modalService: BsModalService, private appAuthService: AppAuthenticationService) { }

    ngOnInit(): void {

        this.user = this.appAuthService.getAuthUser();

        this.returnStatusString = this.item.status.status;
        this.statusDate = dateToString(this.item.status._creationDate);
        this.statusTime = timeToString(this.item.status._creationDate);

        this.returnStarted = isReturnStarted(this.item.status.status);
    }

    processItem() {

        const initialState = {
            list: {
                item: this.item,
                order: this.order,
                user: this.user
            }
        }

        this.bsModalRef = this.modalService.show(ReturnItemComponent, { initialState });

    }

    getTitle(stock: OrderItem): string {
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

    viewStatus() {

    }

    public get getSubtotal(): string {
        let subtotal: number = 0;

        subtotal = this.item.discount_price * this.item.quantity;

        return subtotal.toFixed(2);
    }

    public get getTotal(): string {
        let subtotal: number = 0;

        subtotal = this.item.discount_price * this.item.quantity;

        let tax = subtotal * parseFloat(this.order.tax_rate);

        let total = subtotal + tax;

        return total.toFixed(2);

    }

    public get getTax(): string {
        return this.item.tax.toFixed(2);
    }

    public get getQuantity(): string {
        return this.item.quantity.toFixed(0);
    }

    public get getPrice(): string {
        let price: number = 0;

        price = this.item.discount_price;

        return price.toFixed(2);
    }
}

@Component({
    selector: 'app-return-item-component',
    template: `
    <section class="section-b-space" style="padding-bottom: 10px; padding-top: 10px">
    
    <form (ngSubmit)="onSubmit(f.value)" #f="ngForm">  
    <div class="container">
          <button type="button" class="close" (click)="bsModalRef.hide()">
              <span aria-hidden="true">&times;</span>
          </button>
          <div class="modal-header">
            <h4>Item Return Request</h4>
            <hr>
          </div>
          <br>
            <div class="row form group">
            <div class="top-image">
                <img [src]="item.product.image.src" width="100px" height="100px">
            </div>
            <div class="top-title" id="id_100">
                <a href="javascript:void(0)">{{item.product.title}}</a>
                <p style="margin-top: 5px;">Variant: <b>{{item.variant.name}}</b> | Size: <b>{{item.size.name}}</b></p>
            </div>
            <select name="quantity" id="quantity" required="" ngModel>
                    <option value="" disabled select>Quantity</option>
                    <option *ngFor="let arr of array; let i=index" value="{{i + 1}}">Qty:   {{i + 1}}</option>
            </select>
            </div>
            <br>
            <div>
                    <h4>Why are you returning this?</h4>
                    <hr>
            </div>
            <div class="row form group radio row-padding">
                    <input class="form-check-input" type="radio" id="no_longer_needed"
                    name="reason" value="No Longer Needed" ngModel (change)="onRadioChange($event)" required="">
                    <label class="form-check-label" for="no_longer_needed">No Longer Needed</label>
            </div>
            <div class="row form group radio row-padding">
                    <input class="form-check-input" type="radio" id="inaccurate_website_description"
                    name="reason" value="Inaccurate Website Description" ngModel (change)="onRadioChange($event)">
                    <label class="form-check-label" for="inaccurate_website_description">Inaccurate Website Description</label>
            </div>
            <div class="row form group radio row-padding">
                    <input class="form-check-input" type="radio" id="item_defective_or_doesnt_work"
                     name="reason" value="Item Defective Or Doesn't Work" ngModel (change)="onRadioChange($event)">
                    <label class="form-check-label" for="item_defective_or_doesnt_work">Item Defective or Doesn't Work</label>
            </div>
            <div class="row form group radio row-padding">
                    <input class="form-check-input" type="radio" id="bought_by_mistake"
                     name="reason" value="Bought By Mistake" ngModel (change)="onRadioChange($event)"> 
                    <label class="form-check-label" for="bought_by_mistake">Bought By Mistake</label>
            </div>
            <div class="row form group radio row-padding">
                    <input class="form-check-input" type="radio" id="better_price_available"
                     name="reason" value="Better Price Available" ngModel (change)="onRadioChange($event)">
                    <label class="form-check-label" for="better_price_available">Better Price Available</label>
            </div>
            <div class="row form group radio row-padding">
                    <input class="form-check-input" type="radio" id="product_damaged"
                     name="reason" value="Product Damaged" ngModel (change)="onRadioChange($event)">
                    <label class="form-check-label" for="product_damaged">Product Damaged</label>
            </div>
            <div class="row form group radio row-padding">
                    <input class="form-check-input" type="radio" id="wrong_item_sent"
                     name="reason" value="Wrong Item Sent" ngModel (change)="onRadioChange($event)">
                    <label class="form-check-label" for="wrong_item_sent">Wrong Item Sent</label>
            </div>
            <div class="row form group radio row-padding">
                    <input class="form-check-input" type="radio" id="other"
                     name="reason" value="Other" ngModel (change)="onRadioChange($event)">
                    <label class="form-check-label" for="other">Other</label>
            </div>
            <div id="other-reason-input" class="row form group row-padding hidden-input">
            <label class="form-check-label" for="other_reason-reason">Please enter your other reason below:</label>
            <br>
            <textarea id="other_reason" name="other_reason" rows="4" cols="65" ngModel></textarea>
            </div>
            <div class="row for group row-padding" >
                <button class="btn btn-primary" style="border-radius:4px; width:100%;" [disabled]="!f.valid">Submit</button>
            </div>
        </div>
        </form>
        </section>`,
    styleUrls: ['./return-box.component.scss']
})
export class ReturnItemComponent implements OnInit {

    list: Object;

    public MIN_OTHER_REASON_LENGTH: number = 5;

    public item: OrderItem;
    public user: User;
    public order: Order;

    public array: string[] = [];

    constructor(public bsModalRef: BsModalRef, private http: HttpClient, private toastr: ToastrService, private modalService: BsModalService) { }

    ngOnInit(): void {

        this.item = this.list['item'];
        this.order = this.list['order'];
        this.user = this.list['user'];

        for (let i = 0; i < this.item.quantity; i++) this.array.push("foo");
    }

    onSubmit(values) {
        if (values["reason"] == "Other") {
            let other_reason: string = values["other_reason"];

            if (other_reason.length < this.MIN_OTHER_REASON_LENGTH) {
                this.toastr.error("Please enter a valid reason why you are returning the item to continue");
                return;
            }
        }

        const initialState = {
            list: {
                item: this.item,
                order: this.order,
                user: this.user,
                values: values
            }
        }

        this.bsModalRef.hide();
        this.bsModalRef = this.modalService.show(ReturnItem2Component, { initialState });
    }

    onRadioChange(e) {
        console.log(e.target.value);

        if (e.target.value == "Other") {
            $("#other-reason-input").removeClass("hidden-input");
        } else {
            $("#other-reason-input").addClass("hidden-input");
        }
    }
}



@Component({
    selector: 'app-return-item2-component',
    template: `
    <section class="section-b-space" style="padding-bottom: 10px; padding-top: 10px">
    
    <form (ngSubmit)="onSubmit(f.value)" #f="ngForm">  
    <div class="container">
          <button type="button" class="close" (click)="bsModalRef.hide()">
              <span aria-hidden="true">&times;</span>
          </button>
          <div class="modal-header">
            <h4>Item Return Request</h4>
            <hr>
          </div>
          <br>
            <div class="row form group">
            <div class="top-image">
                <img [src]="item.product.image.src" width="100px" height="100px">
            </div>
            <div class="top-title" id="id_100">
                <a href="javascript:void(0)">{{item.product.title}}</a>
                <p style="margin-top: 5px;">Variant: <b>{{item.variant.name}}</b> | Size: <b>{{item.size.name}}</b></p>
            </div>
            </div>
            <br>
            <div>
                    <h4>How would you like to return your item?</h4>
                    <hr>
            </div>
            <div class="row form group radio row-padding">
                    <input class="form-check-input" type="radio" id="ups"
                    name="return_method" value="UPS" ngModel required="">
                    <label class="form-check-label" for="ups">UPS</label>
            </div>
            <div class="row form group radio row-padding">
                    <input class="form-check-input" type="radio" id="usps"
                    name="return_method" value="USPS" ngModel>
                    <label class="form-check-label" for="usps">USPS</label>
            </div>
            <div class="row form group radio row-padding">
                    <input class="form-check-input" type="radio" id="fedex"
                     name="return_method" value="FedEx" ngModel>
                    <label class="form-check-label" for="fedex">FedEx</label>
            </div>
            <br>
            <div>
                    <h4>How would you like your money refunded</h4>
                    <hr>
            </div>
            <div class="row form group radio row-padding">
                    <input class="form-check-input" type="radio" id="store-credit"
                     name="refund_method" value="Store Credit" ngModel required=""> 
                    <label class="form-check-label" for="store-credit">Store Credit ({{"$"+getTotal}})</label>
            </div>
            <div class="row form group radio row-padding">
                    <input class="form-check-input" type="radio" id="refund-card"
                     name="refund_method" value="Refund Card" ngModel>
                    <label class="form-check-label" for="refund-card">Refund {{order.payments[0].cardDetails.card.cardBrand}} card ending in {{order.payments[0].cardDetails.card.last4}} ({{"$"+getTotal}})</label>
            </div>
            <div class="row for group row-padding" >
                <button class="btn btn-primary" style="border-radius:4px; width:100%;" [disabled]="!f.valid">Submit</button>
            </div>
        </div>
        </form>
        </section>`,
    styleUrls: ['./return-box.component.scss']
})
export class ReturnItem2Component implements OnInit {

    list: Object;

    public item: OrderItem;
    public user: User;
    public order: Order;
    public values: Object;

    constructor(public bsModalRef: BsModalRef, private http: HttpClient, private toastr: ToastrService, private modalService: BsModalService) { }

    ngOnInit(): void {

        this.item = this.list['item'];
        this.order = this.list['order'];
        this.user = this.list['user'];
        this.values = this.list['values'];
    }

    onSubmit(values) {

        const initialState = {
            list: {
                item: this.item,
                order: this.order,
                user: this.user,
                values: this.values,
                values2: values
            }
        }

        this.bsModalRef.hide();
        this.bsModalRef = this.modalService.show(ReturnItem3Component, { initialState });

    }

    public get getTotal(): string {
        let total: number = 0;

        let qty: number = this.values["quantity"];
        total = qty * this.item.discount_price;

        return total.toFixed(2);
    }

}


@Component({
    selector: 'app-return-item3-component',
    template: `
    <section class="section-b-space" style="padding-bottom: 10px; padding-top: 10px">
    
    <form (ngSubmit)="onSubmit(f.value)" #f="ngForm">  
    <div class="container">
          <button type="button" class="close" (click)="bsModalRef.hide()">
              <span aria-hidden="true">&times;</span>
          </button>
          <div class="modal-header">
            <h4>Item Return Request</h4>
            <hr>
          </div>
          <br>
            <div class="row form group">
            <div class="top-image">
                <img [src]="item.product.image.src" width="100px" height="100px">
            </div>
            <div class="top-title" id="id_100">
                <a href="javascript:void(0)">{{item.product.title}}</a>
                <p style="margin-top: 5px;">Variant: <b>{{item.variant.name}}</b> | Size: <b>{{item.size.name}}</b></p>
            </div>
            </div>
            <br>
            <div>
                    <h4>Please review your item return.</h4>
                    <hr>
            </div>
            <div class="row form group row-padding white-space">
                You have requested to return {{quantity}} items of {{item.product.title}} of variant {{item.variant.name}} and size {{item.size.name}}. The reason you have selected for your return is {{reason}}.
                
            </div> 
            <div class="row form group row-padding">
                You should recieve a response within the next two business
                days at the email address {{email}} with our decision to your request. If your request is approved you will receive a {{return_method}} shipping label in the message for you to print and use to return
                the product. 
            </div>
            <div class="row form group row-padding" *ngIf="refund_method === 'Refund Card'">
                You have selected for the refund of {{"$"+total}} to be returned to your {{cardBrand}} ending in {{last4}}. This refund will be processed once if your request is approved and once the items have been received and processed
                by Designica. 
            </div>
            <div class="row form group row-padding" *ngIf="refund_method === 'Store Credit'">
                You have selected for the refund of {{"$"+total}} to be given to you in Designica store credit. This refund will be processed if your request is approved and once the items have been received and processed
                by Designica. You will be able to access this credit from your Dashboard and use it on all items on the site. 
            </div>
            <div class="row form group row-padding">
                Please make sure all this information is correct and only submit if you wish to continue with the return.
            </div>
            <div class="row form group row-padding" >
                <button class="btn btn-primary" style="border-radius:4px; width:100%;">Submit</button>
            </div>
            <div class="row form group row-padding" >
                <button class="btn btn-danger" style="border-radius:4px; width:100%;">Cancel</button>
            </div>
        </div>
        </form>
        </section>`,
    styleUrls: ['./return-box.component.scss']
})
export class ReturnItem3Component implements OnInit {

    list: Object;

    public item: OrderItem;
    public user: User;
    public order: Order;
    public values: Object;
    public values2: Object;
    public quantity: number;
    public reason: string;
    public other_reason: string;
    public total: string;
    public cardBrand: string;
    public last4: string;
    public refund_method: string;
    public return_method: string;
    public email: string;
    public itemId: string;

    constructor(public bsModalRef: BsModalRef, private http: HttpClient, private toastr: ToastrService, private appAuthService: AppAuthenticationService, private router: Router, private viewScroller: ViewportScroller, private route: ActivatedRoute) { }

    ngOnInit(): void {

        this.item = this.list['item'];
        this.order = this.list['order'];
        this.user = this.list['user'];
        this.values = this.list['values'];
        this.values2 = this.list['values2'];

        this.quantity = this.values["quantity"];
        this.reason = this.values["reason"];
        this.other_reason = this.values["other_reason"];
        this.return_method = this.values2["return_method"];
        this.refund_method = this.values2["refund_method"];

        this.total = (this.quantity * this.item.discount_price).toFixed(2)
        this.last4 = this.order.payments[0].cardDetails.card.last4;
        this.cardBrand = this.order.payments[0].cardDetails.card.cardBrand;
        this.email = this.user.email;
        this.itemId = this.item._id;
    }

    onSubmit(values) {

        let params = {
            quantity: this.quantity,
            reason: this.reason,
            return_method: this.return_method,
            refund_method: this.refund_method
        }

        if (this.reason == "Other") {
            params["other_reason"] = this.other_reason;
        }

        let url = environment.API_URL + "/shopping/" + this.user._id + "/orders/" + this.order._id + "/item/" + this.itemId;

        this.http.post(url, params, {
            headers: this.appAuthService.getAuthHeader(),
            observe: 'response'
        }).subscribe(
            success => {
                location.reload();
            },
            error => {
                console.log("Error");
            }
        )


        this.bsModalRef.hide();
    }

}
