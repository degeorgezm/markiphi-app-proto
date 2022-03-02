import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener, Inject, Renderer2 } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';
import { environment } from 'src/environments/environment';
import { Bag, Stock } from 'src/app/_models/shop';
import { AppShoppingService } from 'src/app/_services/app-shopping.service';
import { AppAuthenticationService } from 'src/app/_services/app-authentication.service';
import { Router, RouterModule } from '@angular/router';
import { User } from 'src/app/_models/user';
import { Address } from 'src/app/_models/address';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { DeviceDetectorService } from 'ngx-device-detector';
import { DOCUMENT } from '@angular/common';
import * as $ from 'jquery'
import { Subject } from 'rxjs';
import { SalesTax } from 'src/app/_models/tax';

var applicationId = 'sandbox-sq0idb-BQmMDTXPh2whttkU1FggxA';
var locationId = 'LC46VMNT3H9RB';
var paymentForm: any;
var verificationDetails: any;
declare var SqPaymentForm: any; //magic to allow us to access the SquarePaymentForm lib

function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy, AfterViewInit {
  bsModalRef: BsModalRef;

  public checkoutForm: FormGroup;
  public bag: Bag;
  public loaded: boolean = false;
  public error: boolean = false;
  public payPalConfig?: IPayPalConfig;
  public payment: string = 'Stripe';
  public amount: any;
  public previousUrl: string;
  public currentUrl: string;
  public user: User;
  public defaultShippingAddress: Address;
  public otherShippingAddresses: Address[];
  public shownShippingAddresses: Address[];
  public selectedShippingAddress: string = undefined;
  public defaultBillingAddress: Address;
  public otherBillingAddresses: Address[];
  public shownBillingAddresses: Address[];
  public selectedBillingAddress: string = undefined;
  public mobile: boolean = false;
  public screenWidth: number;
  public maxBillingAddresses: number;
  public maxShippingAddresses: number;
  public numShownBillingAddresses: number;
  public numShownShippingAddresses: number;
  public billingAddressLines: number = 1;
  public shippingAddressLines: number = 1;
  public remainingBillingAddresses: number;
  public remainingShippingAddresses: number;
  public sales_tax: string = "0.00";
  public tax_rate: string = "0.00";

  constructor(private fb: FormBuilder,
    private appShoppingService: AppShoppingService,
    private router: Router,
    private appAuthService: AppAuthenticationService,
    private modalService: BsModalService,
    private deviceService: DeviceDetectorService,
    private toastr: ToastrService) {
  }

  // Windows width
  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    this.screenWidth = window.innerWidth;
  }

  ngOnInit(): void {

    this.appAuthService.tokenAuthenticate();
    this.user = this.appAuthService.getAuthUser();

    this.updateAddresses(true);

    AppAuthenticationService.shippingAddressSelected.subscribe(value => {
      this.selectedShippingAddress = value.toString();
    })

    AppAuthenticationService.billingAddressSelected.subscribe(value => {
      this.selectedBillingAddress = value.toString();
    })

    AppAuthenticationService.userSubject.subscribe(value => {
      if (value == true) {
        console.log("Grabbing new user");
        this.user = this.appAuthService.getAuthUser();
        this.updateAddresses(false);
        this.updateTaxInfo();
      }
    })

    AppShoppingService.bagSubject.subscribe(value => {
      if (value == true) {
        console.log("Grabbing new bag");
        this.bag = AppShoppingService.bag;
      };
    })

    this.loadBag();

    this.mobile = this.deviceService.isMobile();
    console.log(this.deviceService.getDeviceInfo());
  }







  ngAfterViewInit(): void {

  }

  loadBag() {
    this.appShoppingService.fetchBag(true, result => {
      if (result == true) {
        this.bag = AppShoppingService.bag;
        this.updateTaxInfo();
        this.error = false;
      } else {
        this.bag = new Bag();
        this.error = true;
      }
      this.loaded = true;
    });
  }

  ngOnDestroy(): void {

  }

  public get getTotal(): string {
    if (this.bag != undefined) {
      return this.bag.getSubTotal().toFixed(2);
    } else {
      return (0.00).toFixed(2);
    }
  }

  public get getFinalTotal(): string {
    if (this.bag != undefined) {
      let subtotal = parseFloat(this.bag.getSubTotal().toFixed(2)) + 6.95 + parseFloat(this.sales_tax);
      return subtotal.toFixed(2);
    } else {
      return "0.00";
    }
  }

  updateAddresses(resetDefault: boolean) {

    this.maxBillingAddresses = this.user.addresses.length;
    this.maxShippingAddresses = this.user.addresses.length;

    let shippingAddresses = this.user.addresses.filter(element => this.user.shippingAddress == element._id);
    if (shippingAddresses.length > 0) {
      this.numShownShippingAddresses = 1;
      this.defaultShippingAddress = shippingAddresses[0];
      if (resetDefault == true) {
        this.selectedShippingAddress = this.defaultShippingAddress._id;
        this.updateTaxInfo();
      }
    } else {
      this.numShownShippingAddresses = 0;
    }

    this.otherShippingAddresses = this.user.addresses.filter(element => this.user.shippingAddress != element._id);
    this.otherShippingAddresses.sort((a, b) => b._updatedDate.getTime() - a._updatedDate.getTime());
    let shippingIndex = 1 + (2 * (this.shippingAddressLines - 1));
    console.log("Shipping Count: " + shippingIndex);
    this.shownShippingAddresses = this.otherShippingAddresses.slice(0, shippingIndex);

    console.log("Shown Shipping Addresses Length: " + this.shownShippingAddresses.length)
    this.numShownShippingAddresses += this.shownShippingAddresses.length;
    this.remainingShippingAddresses = this.otherShippingAddresses.length - this.shownShippingAddresses.length;

    let billingAddresses = this.user.addresses.filter(element => this.user.billingAddress == element._id);
    if (billingAddresses.length > 0) {
      this.numShownBillingAddresses = 1;
      this.defaultBillingAddress = billingAddresses[0];
      if (resetDefault == true) {
        this.selectedBillingAddress = this.defaultBillingAddress._id;
      }
    } else {
      this.numShownBillingAddresses = 0;
    }

    this.otherBillingAddresses = this.user.addresses.filter(element => this.user.billingAddress != element._id);
    this.otherBillingAddresses.sort((a, b) => b._updatedDate.getTime() - a._updatedDate.getTime());
    let billingIndex = 1 + (2 * (this.billingAddressLines - 1));
    this.shownBillingAddresses = this.otherBillingAddresses.slice(0, billingIndex);
    this.numShownBillingAddresses += this.shownBillingAddresses.length;
    this.remainingBillingAddresses = this.otherBillingAddresses.length - this.shownBillingAddresses.length;
  }

  updateTaxInfo() {

    if (this.selectShippingAddress != undefined && this.bag != undefined) {
      let address = this.user.getAddress(this.selectedShippingAddress);

      let sub_total = this.bag.getSubTotal();
      let sales_tax = SalesTax.CalculateSalesTax(sub_total, address.state);

      let _tax_rate = SalesTax.SalesTable[address.state];
      this.tax_rate = _tax_rate ? _tax_rate.toString() : "0.00";
      this.sales_tax = sales_tax.toFixed(2);
    } else {
      this.sales_tax = "0.00";
      this.tax_rate = "0.00";
    }
  }

  addBillingLines() {
    this.billingAddressLines += 1;
    this.updateAddresses(false);
  }

  addShippingLines() {
    this.shippingAddressLines += 1;
    this.updateAddresses(false);
  }

  resetBillingLines() {
    this.billingAddressLines = 1;
    this.updateAddresses(false);
  }

  resetShippingLines() {
    this.shippingAddressLines = 1;
    this.updateAddresses(false);
  }

  selectShippingAddress(id: string) {
    this.selectedShippingAddress = id;
    this.updateTaxInfo();
  }

  selectBillingAddress(id: string) {
    this.selectedBillingAddress = id;
  }

  addShippingAddress() {
    QuickAddAddressComponent.MODE = 1;
    this.bsModalRef = this.modalService.show(QuickAddAddressComponent);
    this.bsModalRef.content.clear();
    this.bsModalRef.content.init();
  }

  addBillingAddress() {
    QuickAddAddressComponent.MODE = 2;
    this.bsModalRef = this.modalService.show(QuickAddAddressComponent);
    this.bsModalRef.content.clear();
    this.bsModalRef.content.init();
  }

  reviewOrder() {

    if (this.selectedShippingAddress == undefined || this.selectedBillingAddress == undefined) {
      this.toastr.error("Please select both shipping and billing address to continue", "Error!");
      return;
    }

    const initialState = {
      list: [
        this.user.toJSON(),
        this.bag.toJSON(),
        this.user.getAddress(this.selectedShippingAddress).toJSON(),
        this.user.getAddress(this.selectedBillingAddress).toJSON()
      ]
    }

    this.bsModalRef = this.modalService.show(ReviewOrderComponent, { initialState });
  }
}

@Component({
  selector: 'app-quick-add-address',
  template: `
  <div class="modal-content quick-view-modal">
    <div class="modal-body">
        <button type="button" class="close" (click)="bsModalRef.hide()">
            <span aria-hidden="true">&times;</span>
        </button>
        <div class="row">
            <div class="col-lg-12">
                <div #mainlabel>
                <h3>Add New Address</h3>
                </div>
                <div class="theme-card">
                            <div class="col-md-12">
                        <div class="form-row">
                                <label for="name">Name</label>
                                <input type="text" class="form-control" id="name" placeholder="Name" required=""
                                    name="name" #nameInput>
                            </div>
                        </div>
                            <div class="col-lg-12">
                        <div class="form-row">
                                <label for="address1">Address Line 1</label>
                                <input type="text" class="form-control" id="address1" placeholder="Address Line 1"
                                    required="" name="address1" #address1Input>
                            </div>
                        </div>
                            <div class="col-lg-12">
                        <div class="form-row">
                                <label for="address2">Address Line 2 (Optional)</label>
                                <input type="text" class="form-control" id="address2"
                                    placeholder="Address Line 2 (Optional)" name="address2" #address2Input>
                            </div>
                        </div>
                            <div class="col-lg-12">
                        <div class="form-row">
                                <label for="city">City</label>
                                <input type="text" class="form-control" id="city" placeholder="City" name="city"
                                    #cityInput>
                            </div>
                        </div>
                            <div class="col-lg-12">
                        <div class="form-row">
                                <label for="state" style="padding-bottom: 10px;">State</label>
                                <select class="form-control" id="state" name="state" required=""
                                     #stateInput>
                                    <option value="" select>State</option>
                                    <option value="AL">Alabama</option>
                                    <option value="AK">Alaska</option>
                                    <option value="AZ">Arizona</option>
                                    <option value="AR">Arkansas</option>
                                    <option value="CA">California</option>
                                    <option value="CO">Colorado</option>
                                    <option value="CT">Connecticut</option>
                                    <option value="DE">Delaware</option>
                                    <option value="DC">District Of Columbia</option>
                                    <option value="FL">Florida</option>
                                    <option value="GA">Georgia</option>
                                    <option value="HI">Hawaii</option>
                                    <option value="ID">Idaho</option>
                                    <option value="IL">Illinois</option>
                                    <option value="IN">Indiana</option>
                                    <option value="IA">Iowa</option>
                                    <option value="KS">Kansas</option>
                                    <option value="KY">Kentucky</option>
                                    <option value="LA">Louisiana</option>
                                    <option value="ME">Maine</option>
                                    <option value="MD">Maryland</option>
                                    <option value="MA">Massachusetts</option>
                                    <option value="MI">Michigan</option>
                                    <option value="MN">Minnesota</option>
                                    <option value="MS">Mississippi</option>
                                    <option value="MO">Missouri</option>
                                    <option value="MT">Montana</option>
                                    <option value="NE">Nebraska</option>
                                    <option value="NV">Nevada</option>
                                    <option value="NH">New Hampshire</option>
                                    <option value="NJ">New Jersey</option>
                                    <option value="NM">New Mexico</option>
                                    <option value="NY">New York</option>
                                    <option value="NC">North Carolina</option>
                                    <option value="ND">North Dakota</option>
                                    <option value="OH">Ohio</option>
                                    <option value="OK">Oklahoma</option>
                                    <option value="OR">Oregon</option>
                                    <option value="PA">Pennsylvania</option>
                                    <option value="RI">Rhode Island</option>
                                    <option value="SC">South Carolina</option>
                                    <option value="SD">South Dakota</option>
                                    <option value="TN">Tennessee</option>
                                    <option value="TX">Texas</option>
                                    <option value="UT">Utah</option>
                                    <option value="VT">Vermont</option>
                                    <option value="VA">Virginia</option>
                                    <option value="WA">Washington</option>
                                    <option value="WV">West Virginia</option>
                                    <option value="WI">Wisconsin</option>
                                    <option value="WY">Wyoming</option>
                                </select>
                            </div>
                        </div>
                            <div class="col-lg-12">
                        <div class="form-row">
                                <label for="city">Zip</label>
                                <input type="text" class="form-control" id="zip" required="" placeholder="Zip"
                                    name="zip" maxlength="5" minlength="5" #zipInput>
                            </div>
                        </div>
                            <div class="col-lg-12">
                        <div class="form-row">
                                <label for="country" style="padding-bottom: 10px;">Country</label>
                                <select class="form-control" id="country" name="country" required=""
                                     #countryInput>
                                    <option value="" select>Country</option>
                                    <option value="United States">United States</option>
                                </select>
                            </div>
                        </div>
                            <div class="col-lg-12">
                        <div class="form-row">
                                <label for="phone">Phonenumber</label>
                                <input type="text" maxlength="14" minlength="14" class="form-control" id="phone"
                                    placeholder="Phonenumber" required="" name="phone"
                                    (keyup)="phoneOnChange()" #phonenumber>
                            </div>
                        </div>

                        <div class="col-lg-12">
                        <div class="form-row" style="margin-left: 0px; margin-top: 20px;">
                            <input type="checkbox" name="make_default" id="make_default" #default>
                            <label for="make_default"
                                style="color: black; font-size: 12px;" #checkboxlabel>Make default
                              </label>
                        </div>
                      </div>
                        <!-- <div class="form-row">
                                <div class="col-lg-12">
                                    <label for="instructions">Instructions (Optional)</label>
                                    <textarea class="form-control" rows="5" id="instructions" placeholder="Instructions (Optional)" ngModel name="instructions"></textarea>
                                </div>
                            </div> -->
                        <button class="btn btn-primary"
                            style="margin-top: 25px;" (click)="submitAddress()">Add Address</button>
                </div>
            </div>
        </div>
    </div>
</div>`,
  styleUrls: ['./checkout.component.scss']
})
export class QuickAddAddressComponent implements OnInit, OnDestroy {

  AddressModeEnum = {
    UNSET: 0,
    SHIPPING: 1,
    BILLING: 2
  }

  public static MODE: number = 0;

  @ViewChild('nameInput', { static: false }) addrName: ElementRef;
  @ViewChild('address1Input', { static: false }) address1: ElementRef;
  @ViewChild('address2Input', { static: false }) address2: ElementRef;
  @ViewChild('cityInput', { static: false }) city: ElementRef;
  @ViewChild('zipInput', { static: false }) zip: ElementRef;
  @ViewChild('countryInput', { static: false }) country: ElementRef;
  @ViewChild('stateInput', { static: false }) state: ElementRef;
  @ViewChild('phonenumber', { static: false }) phone: ElementRef;
  @ViewChild('checkboxlabel', { static: false }) checkboxLabel: ElementRef;
  @ViewChild('mainlabel', { static: false }) mainLabel: ElementRef;
  @ViewChild('default', { static: false }) default: ElementRef;

  public user: User;

  constructor(
    private appAuthService: AppAuthenticationService, private http: HttpClient, private toastr: ToastrService, public bsModalRef: BsModalRef, private renderer: Renderer2) {
  }

  ngOnInit(): void {
    this.user = this.appAuthService.getAuthUser();
  }

  clear() {
    this.addrName.nativeElement.value = "";
    this.address1.nativeElement.value = "";
    this.address2.nativeElement.value = "";
    this.city.nativeElement.value = "";
    this.zip.nativeElement.value = "";
    this.country.nativeElement.value = "";
    this.state.nativeElement.value = "";
    this.phone.nativeElement.value = "";
    this.default.nativeElement.value = "off";
  }

  init() {
    if (QuickAddAddressComponent.MODE == this.AddressModeEnum.SHIPPING) {
      this.renderer.setProperty(this.mainLabel.nativeElement, 'innerHTML', '<h3>Add New Shipping Address</h3>');
      this.renderer.setProperty(this.checkboxLabel.nativeElement, 'innerHTML', "Make Default Shipping Address");
    } else if (QuickAddAddressComponent.MODE == this.AddressModeEnum.BILLING) {
      this.renderer.setProperty(this.mainLabel.nativeElement, 'innerHTML', '<h3>Add New Billing Address</h3>');
      this.renderer.setProperty(this.checkboxLabel.nativeElement, 'innerHTML', "Make Default Billing Address");
    }
  }

  submitAddress() {

    if (this.phone.nativeElement.value == undefined ||
      this.addrName.nativeElement.value == undefined ||
      this.address1.nativeElement.value == undefined ||
      this.zip.nativeElement.value == undefined ||
      this.city.nativeElement.value == undefined ||
      this.state.nativeElement.value == undefined ||
      this.country.nativeElement.value == undefined) {
      this.toastr.error("Form not valid!", "Error");
      return;
    }

    let body = {};

    if (this.phone.nativeElement.value != undefined) {
      let twilio = "1" + this.phone.nativeElement.value.replace(/[^0-9]/g, '');
      body["twilio"] = twilio;
    }

    body["name"] = this.addrName.nativeElement.value;
    body["phone"] = this.phone.nativeElement.value;
    body["address1"] = this.address1.nativeElement.value;
    body["zip"] = this.zip.nativeElement.value;
    body["city"] = this.city.nativeElement.value;
    body["state"] = this.state.nativeElement.value;
    body["country"] = this.country.nativeElement.value;

    if (this.address2.nativeElement.value != undefined) {
      body["address2"] = this.address2.nativeElement.value;
    }

    this.http.post(this.user.getAddAddressURL(), body, {
      headers: this.appAuthService.getAuthHeader(),
      observe: 'response'
    }).subscribe(
      async success => {
        this.toastr.success("You have successfully added address to account", "Success!");

        let body: any = success.body;
        let addressId = body._id;

        if ($("#make_default").prop('checked')) {

          let url = environment.API_URL + "/user/" + this.user._id + "/address/" + addressId + "/";

          if (QuickAddAddressComponent.MODE == this.AddressModeEnum.SHIPPING) {
            url += "shipping";
          } else if (QuickAddAddressComponent.MODE == this.AddressModeEnum.BILLING) {
            url += "billing";
          }

          console.log(url);

          this.http.get(url, {
            headers: this.appAuthService.getAuthHeader(),
            observe: "response"
          }).subscribe(
            async success => {
              await this.appAuthService.refreshUser();
            },
            error => {
              console.log("Error setting default address");
            }
          );
        } else {
          await this.appAuthService.refreshUser();
        }

        if (QuickAddAddressComponent.MODE == this.AddressModeEnum.SHIPPING) {
          AppAuthenticationService.shippingAddressSelected.next(addressId);
        } else if (QuickAddAddressComponent.MODE == this.AddressModeEnum.BILLING) {
          AppAuthenticationService.billingAddressSelected.next(addressId);
        }

        this.bsModalRef.hide();
      },
      error => {
        this.toastr.error("There was an error trying to create the address", "Error!");
      });

  }

  phoneValid: boolean = false;
  phoneCompleted: boolean = false;

  phoneValidCheck(phn: string): boolean {
    let value: boolean = true;

    if (phn.length != 14) {
      value = false;
    }

    for (let i = 0; i < phn.length; i++) {
      switch (i) {
        case 0:
          if (phn.charAt(0) != "(") {
            value = false;
          }
          break
        case 4:
          if (phn.charAt(4) != ")") {
            value = false;
          }
          break;
        case 5:
          if (phn.charAt(5) != " ") {
            value = false;
          }
          break;
        case 9:
          if (phn.charAt(9) != "-") {
            value = false;
          }
          break;
        default:
          if ((phn.charCodeAt(i) < "0".charCodeAt(0)) || (phn.charCodeAt(i) > "9".charCodeAt(0))) {
            value = false;
          }
      }
    }
    return value;
  }

  previousCount = 0;
  phoneOnChange(): void {
    let phoneValue: string = this.phone.nativeElement.value;

    let digitCount = 0;
    for (let i = 0; i < phoneValue.length; i++) {
      if ((phoneValue.charCodeAt(i) > "0".charCodeAt(0)) && phoneValue.charCodeAt(i) < "9".charCodeAt(0)) {
        digitCount++;
      }
    }

    if ((phoneValue.length == 14) || (digitCount == 10)) {
      this.phoneCompleted = true;
      this.phoneValid = this.phoneValidCheck(phoneValue);
    } else {
      this.phoneCompleted = false;
    }

    if (this.previousCount < phoneValue.length) {
      if (phoneValue.length == 3) {
        if (phoneValue.charAt(0) != "(") {
          let text = "(" + phoneValue + ") ";
          this.phone.nativeElement.value = text;
        }
      } else if (phoneValue.length == 5) {
        if (phoneValue.charAt(4) != ")") {
          let substr = phoneValue.substr(4, 5);
          let text = phoneValue.substr(0, 4) + ") " + substr;
          this.phone.nativeElement.value = text;
        }

      } else if (phoneValue.length == 10) {
        if (phoneValue.charAt[9] != "-") {
          let substr = phoneValue.substr(9, 10);
          let text = phoneValue.substr(0, 9) + "-" + substr;
          this.phone.nativeElement.value = text;
        }
      } else if (phoneValue.length == 9) {
        let text = phoneValue + "-";
        this.phone.nativeElement.value = text;
      } else if (phoneValue.length == 15) {
        let substr = phoneValue.substr(0, 14);
        this.phone.nativeElement.value = substr;
        this.phoneCompleted = true;
      } else {
        // removed character
      }
    }

    let str: string = this.phone.nativeElement.value;
    this.previousCount = str.length;
  }

  ngOnDestroy() {

  }

}


@Component({
  selector: 'app-review-order',
  template: `
  <section class="section-b-space" style="padding-bottom: 20px; padding-top: 20px">
    <div class="container">
        <button type="button" class="close" (click)="bsModalRef.hide()">
            <span aria-hidden="true">&times;</span>
        </button>
        <h3 style="padding-bottom: 7px;"> Order Review </h3>
        <hr>
        <div class="row" style="margin-top: 3px;">
        <div class="col-lg-12 col-sm-12 col-xs-12">
                <div class="row order-success-sec">
                    <div class="col-sm-6">
                        <h4>Shipping Address</h4>
                        <ul class="displayAddressUL">
                          <li class="displayAddressLI displayAddressFullName">
                              {{shippingAddress.name}}
                          </li>
                          <li class="displayAddressLI">
                              {{shippingAddress.address1}}
                          </li>
                          <li class="displayAddressLI" *ngIf="shippingAddress.address2 != undefined">
                              {{shippingAddress.address2}}
                          </li>
                          <li class="displayAddressLI">
                              {{shippingAddress.city}}, {{shippingAddress.state}}
                              {{shippingAddress.zip}}
                          </li>
                          <li class="displayAddressLI">
                              {{shippingAddress.country}}
                          </li>
                          <li class="displayAddressLI">
                              Phone: {{shippingAddress.phone}}
                          </li>
                      </ul>     
                    </div>
                    <div class="col-sm-6">
                        <h4>Billing Address</h4>
                        <ul class="displayAddressUL">
                          <li class="displayAddressLI displayAddressFullName">
                              {{billingAddress.name}}
                          </li>
                          <li class="displayAddressLI">
                              {{billingAddress.address1}}
                          </li>
                          <li class="displayAddressLI" *ngIf="billingAddress.address2 != undefined">
                              {{billingAddress.address2}}
                          </li>
                          <li class="displayAddressLI">
                              {{billingAddress.city}}, {{billingAddress.state}}
                              {{billingAddress.zip}}
                          </li>
                          <li class="displayAddressLI">
                              {{billingAddress.country}}
                          </li>
                          <li class="displayAddressLI">
                              Phone: {{billingAddress.phone}}
                          </li>
                      </ul>   
                    </div>
                </div>
              </div>
            </div>
            <hr>
            <h4 style="margin-top: 10px; font-size: 18px; font-weight: 600; line-height: 22px; color: black"> Order Details </h4> 
            <div class="row">
              <div class="col-lg-12 col-sm-12 col-xs-12">   
                <div class="product-order" style="padding-bottom: 15px;">
                    <div class="row product-order-detail" *ngFor="let item of bag.items" style="margin-top: 20px;">
                          <div class="col-2">
                              <img [src]="item.product.image.src" alt="" height="65" width="65">
                          </div>
                          <div class="col-7 order_detail outer" style="padding-left: 15px;position: relative">
                              <div class="top">
                                  <h5 style="font-size: 13px;">{{ item.quantity }} × {{ item.getTitle }}</h5>
                                <a href="javascript:void(0)" (click)="moveItem(item)">Buy it later</a> | <a href="javascript:void(0)" (click)="removeItem(item)">Remove</a>
                              </div>
                              <!--<div class="below">
                                
                              </div> -->
                          </div>
                          <div class="col-3 order_detail">
                              <div>
                              <h5 *ngIf="item.product.sale; else regularprice">
                                    {{"$"+((item.product.price - item.product.discount)*(item.quantity)).toFixed(2)}}
                                    <del>{{"$"+(item.product.price * item.quantity).toFixed(2)}}</del>
                                </h5>
                                <ng-template #regularprice>
                                    <h5>{{"$"+(item.product.price * item.quantity).toFixed(2)}}</h5>
                                </ng-template>
                              </div>
                          </div>
                    </div>
                    <div class="total-sec">
                    <h4 style="font-size: 18px; font-weight: 600; line-height: 22px; color: black"> Order Summary </h4> 
                        <ul>
                            <li>subtotal <span>{{"$"+bag.getSubTotal().toFixed(2)}}</span></li>
                            <li>tax <span>{{"$"+tax}}</span></li>
                            <li>shipping <span>$6.95</span></li>
                            <li>savings <span>{{"$"+bag.getTotalDiscount().toFixed(2)}}</span></li>
                            <li><b>total</b> <span><b>{{"$"+getFinalTotal()}}</b></span></li>
                        </ul>
                    </div>
                </div>
            </div>
      </div> 
      <h3 style="margin-top: -15px; margin-bottom: 15px;"> Payment </h3>
      <form id="payment-form">
      <div id="card-container" style="margin-top: 20px;"></div>
      <button id="card-button" type="button" class="btn btn-primary" style="color: #ffffff; background-color: #006aff; border-radius: 5px; cursor: pointer; border-style: none; -webkit-user-select: none; -moz-user-select: none; user-select: none; outline: none; font-size: 16px; font-weight: 500; line-height: 24px; padding: 12px; width: 100%; margin-top: 0px;">Pay with Card</button>
    </form>
    <div id="payment-status-container" style="display:none"></div>
    </div>    
</section>`,
  styleUrls: ['./checkout.component.scss']
})
export class ReviewOrderComponent implements OnInit, OnDestroy {

  static ResultSubject = new Subject();
  static OrderId = undefined;

  list: any[] = [];

  public user: User;
  public bag: Bag;
  public shippingAddress: Address;
  public billingAddress: Address;
  public mobile: boolean;
  public success: boolean;
  public tax: string;

  constructor(public bsModalRef: BsModalRef, private appAuthService: AppAuthenticationService, private appShoppingService: AppShoppingService,
    private deviceService: DeviceDetectorService, @Inject(DOCUMENT) private document: Document, private toastr: ToastrService, private router: Router) {
  }

  ngOnInit(): void {
    //this.user = User.fromJSON(JSON.parse(this.list[0]));
    //this.bag = Bag.fromJSON(JSON.parse(this.list[1]));
    this.user = this.appAuthService.getAuthUser();
    this.bag = AppShoppingService.bag;

    this.shippingAddress = Address.fromJSON(JSON.parse(this.list[2]));
    this.billingAddress = Address.fromJSON(JSON.parse(this.list[3]));

    this.mobile = this.deviceService.isMobile();

    this.document.addEventListener("PaymentResult", this.paymentResult);

    ReviewOrderComponent.ResultSubject.subscribe(value => {
      console.log("Result subject triggered");

      if (value == true) {
        this.toastr.success("Your payment has successfully been processed!", "Success!");
        this.bsModalRef.hide();
        if (ReviewOrderComponent.OrderId != undefined) {
          this.appShoppingService.fetchBag(false, result => {
            this.router.navigateByUrl("/shop/checkout/success/" + ReviewOrderComponent.OrderId);
          });
        } else {
          this.router.navigateByUrl("**");
        }
      } else {
        this.toastr.error("There was an error completing your payment. Please try again.", "Error!");
        this.bsModalRef.hide();
      }
    })

    let event = new CustomEvent("InitializeSquare");
    this.document.dispatchEvent(event);

    this.generatePaymentContentEvent();

    AppShoppingService.bagSubject.subscribe(value => {
      if (value == true) {
        console.log("Grabbing new bag");
        this.bag = AppShoppingService.bag;

        if (this.bag.items.length == 0) {
          this.bsModalRef.hide();
        } else {
          this.generatePaymentContentEvent();
        }
      };
    })
  }

  generatePaymentContentEvent() {
    let user = this.user._id;
    let bag = this.bag._id;
    let sub_total = parseFloat(this.bag.getSubTotal().toFixed(2));
    let tax = parseFloat(SalesTax.CalculateSalesTax(sub_total, this.shippingAddress.state).toFixed(2));
    let discount = parseFloat(this.bag.getTotalDiscount().toFixed(2));
    let shipping = 6.95;
    let currency = "USD";
    let total = parseFloat((sub_total + tax + shipping).toFixed(2));
    let billing_address = JSON.parse(this.billingAddress.toJSON());
    let shipping_address = JSON.parse(this.shippingAddress.toJSON());

    this.tax = tax.toFixed(2);

    let content = {
      user: user,
      bag: bag,
      sub_total: sub_total,
      tax: tax,
      discount: discount,
      shipping: shipping,
      currency: currency,
      total: total,
      shipping_address: shipping_address,
      billing_address: billing_address

    }

    var event = new CustomEvent("PaymentInit", { detail: content });
    this.document.dispatchEvent(event);
  }

  paymentResult(event: any): void {
    event.preventDefault();

    console.log("Result event triggered");
    console.log(event.detail);
    let content: any = event.detail;

    if (content.result == true) {
      ReviewOrderComponent.OrderId = content.orderId;
      ReviewOrderComponent.ResultSubject.next(true);
    } else if (content.result == false) {
      ReviewOrderComponent.OrderId = undefined;
      ReviewOrderComponent.ResultSubject.next(false);
    }
  }

  ngOnDestroy(): void {
    this.document.removeEventListener("PaymentResult", this.paymentResult);
    ReviewOrderComponent.ResultSubject.unsubscribe();
    ReviewOrderComponent.ResultSubject = new Subject();
    console.log("ReviewOrderComponent Destroyed");
  }

  requestCardNonce(event) {

    // Don't submit the form until SqPaymentForm returns with a nonce
    event.preventDefault();

    // Request a nonce from the SqPaymentForm object
    paymentForm.requestCardNonce();

    this.bsModalRef.hide();
  }

  public get getTotal(): string {
    if (this.bag != undefined) {
      return this.bag.getSubTotal().toFixed(2);
    } else {
      return (0.00).toFixed(2);
    }
  }

  getFinalTotal(): string {
    let subtotal = this.bag.getSubTotal() + parseFloat(this.tax) + 6.95;
    return subtotal.toFixed(2);
  }

  moveItem(item: Stock) {
    this.appShoppingService.fromBagToWishlist(item, false, result => {
      if (result == true) {
        this.appShoppingService.fetchBag(true, result => { });
        //this.toastr.success("Item successfuly moved to wishlist.", "Success!");
      } else {
        //this.toastr.error("Error moving item to wishlist.", "Error!");
      }
    });
  }

  removeItem(item: Stock) {
    this.appShoppingService.removeFromBag(item._id, result => {
      if (result == true) {
        this.appShoppingService.fetchBag(true, result => { });
      }
    })
  }

}

