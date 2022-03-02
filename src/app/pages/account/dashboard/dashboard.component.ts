import { Component, OnInit, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { User } from 'src/app/_models/user';
import { AppAuthenticationService } from 'src/app/_services/app-authentication.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Address } from 'src/app/_models/address';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  @ViewChild('messageRow') messageRow: ElementRef;
  @ViewChild('pageoverlay') overlay: ElementRef;

  mobile: boolean = false;

  user: User;
  defaultBillingAddress: Address;
  defaultShippingAddress: Address;
  redirected: boolean = false;

  selectBillingAddress: boolean = false;
  selectShippingAddress: boolean = false;

  public openDashboard: boolean = false;

  constructor(private renderer: Renderer2, private route: ActivatedRoute, private appAuthService: AppAuthenticationService, private router: Router, private http: HttpClient, private toastr: ToastrService, private deviceService: DeviceDetectorService) { }

  ngOnInit(): void {
    console.log("Dashboard Page Loaded");
    this.appAuthService.tokenAuthenticate();

    this.user = this.appAuthService.getAuthUser();
    this.defaultBillingAddress = this.user.getBillingAddress();
    this.defaultShippingAddress = this.user.getShippingAddress();

    this.route.queryParams.subscribe(params => {

      if (params['redirected'] != undefined) {
        this.redirected = params['redirected'] == "true" ? true : false;
      }
    })

    AppAuthenticationService.authSubject.subscribe(value => {
      if (value == true) {
        this.user = this.appAuthService.getAuthUser();
        this.defaultBillingAddress = this.user.getBillingAddress();
        this.defaultShippingAddress = this.user.getShippingAddress();
      }
    });

    AppAuthenticationService.userSubject.subscribe(value => {
      if (value == true) {
        this.user = this.appAuthService.getAuthUser();
      }
    })

    this.mobile = this.deviceService.isMobile();
    console.log(this.deviceService.getDeviceInfo());
    console.log("Mobile: " + this.mobile);
  }

  ngAfterViewInit(): void {

    if (this.redirected == false) {
      this.renderer.setStyle(this.messageRow.nativeElement, "display", "none");
    } else {
      this.renderer.removeStyle(this.messageRow.nativeElement, "display");
    }
  }

  ToggleDashboard() {
    this.openDashboard = !this.openDashboard;
  }

  closeMessageClicked(): void {
    this.redirected = false
    this.renderer.setStyle(this.messageRow.nativeElement, "display", "none");
  }

  addBillingAddressClicked(): void {
    this.selectBillingAddress = true;
    this.selectShippingAddress = false;
    this.renderer.setStyle(this.overlay.nativeElement, 'display', 'inherit');
  }

  addShippingAddressClicked(): void {
    this.selectShippingAddress = true;
    this.selectBillingAddress = false;
    this.renderer.setStyle(this.overlay.nativeElement, 'display', 'inherit');
  }

  closeBillingDialog(): void {
    this.selectBillingAddress = false;
    this.renderer.setStyle(this.overlay.nativeElement, 'display', 'none');
  }

  closeShippingDialog(): void {
    this.selectBillingAddress = false;
    this.renderer.setStyle(this.overlay.nativeElement, 'display', 'none');
  }

  closeDialog(): void {
    if (this.selectShippingAddress == true) {
      this.closeShippingDialog();
    }

    if (this.selectBillingAddress == true) {
      this.closeBillingDialog();
    }

    this.selectBillingAddress = false;
    this.selectShippingAddress = false;
  }

  addAddressClicked() {
    this.closeDialog();

    console.log("Add Address Clicked");

    this.router.navigateByUrl('pages/address');
  }

  addDefault(addressId: string): void {
    let url = environment.API_URL + "/user/" + this.user._id + "/address/" + addressId + "/";

    if (this.selectBillingAddress) {
      url += "billing";
    } else if (this.selectShippingAddress) {
      url += "shipping";
    } else {
      return;
    }

    this.http.get(url, {
      headers: this.appAuthService.getAuthHeader(),
      observe: "response"
    }).subscribe(
      async success => {
        await this.appAuthService.refreshUser();
        this.user = this.appAuthService.getAuthUser();
        this.defaultBillingAddress = this.user.getBillingAddress();
        this.defaultShippingAddress = this.user.getShippingAddress();
        this.closeDialog();
      },
      error => {
        this.toastr.error("There was an error setting your default address", "Error!");
        this.closeDialog();
      }
    );
  }

  deleteAddress(addressId: string): void {
    let url = environment.API_URL + "/user/" + this.user._id + "/address/" + addressId;

    this.http.delete(url, {
      headers: this.appAuthService.getAuthHeader(),
      observe: "response"
    }).subscribe(
      async success => {
        this.toastr.success("You have successfully deleted address from account", "Success!");
        await this.appAuthService.refreshUser();
      },
      error => {
        this.toastr.error("There was an error deleting your address. Please try again.", "Error!");
      }
    )
  }

  logout() {
    this.appAuthService.logout();
    this.router.navigateByUrl('**');
  }
}
