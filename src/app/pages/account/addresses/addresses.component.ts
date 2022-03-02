import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/_models/user';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AppAuthenticationService } from 'src/app/_services/app-authentication.service';

@Component({
  selector: 'app-app-addresses',
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.scss']
})
export class AddressesComponent implements OnInit {

  user: User;
  public openDashboard: boolean = false;

  constructor(private appAuthService: AppAuthenticationService, private http: HttpClient, private toastr: ToastrService, private router: Router) { }

  ngOnInit() {
    this.appAuthService.tokenAuthenticate();

    this.user = this.appAuthService.getAuthUser();

    AppAuthenticationService.authSubject.subscribe(value => {
      if (value == true) {
        this.user = this.appAuthService.getAuthUser();
      }
    });

    AppAuthenticationService.userSubject.subscribe(value => {
      if (value == true) {
        this.user = this.appAuthService.getAuthUser();
      }
    })
  }

  addDefault(addressId: string, type: string): void {
    let url = environment.API_URL + "/user/" + this.user._id + "/address/" + addressId + "/";

    if (type == "billing") {
      url += "billing";
    } else if (type == "shipping") {
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
        if (type == "billing") {
          this.toastr.success("You have successfully added a default billing address", "Success!");
        } else if (type == "shipping") {
          this.toastr.success("You have successfully added a default shipping address", "Success!");
        }
      },
      error => {
        if (type == "billing") {
          this.toastr.error("There was an error adding your default billing address", "Error!");
        } else if (type == "shipping") {
          this.toastr.error("There was an error adding your default shipping address", "Error!");
        }
      }
    );
  }

  deleteAddress(addressId: string): void {
    let url = environment.API_URL + "/user/" + this.user._id + "/address/" + addressId;

    this.http.delete(url, {
      headers: this.appAuthService.getAuthHeader(),
      observe: "response"
    }).subscribe(
      success => {
        this.toastr.success("You have successfully deleted address from account", "Success!");
        this.appAuthService.tokenAuthenticate();
      },
      error => {
        this.toastr.error("There was an error deleting your address. Please try again.", "Error!");
      }
    )
  }

  ToggleDashboard() {
    this.openDashboard = !this.openDashboard;
  }

  editAddress(addressId: string): void {
    let url = "/pages/address?mode=edit&id=" + addressId;

    this.router.navigateByUrl(url);
  }
}