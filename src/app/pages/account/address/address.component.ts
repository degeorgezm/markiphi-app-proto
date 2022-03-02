import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, NoPreloading, Router, RoutesRecognized } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/_models/user';
import { Address } from 'src/app/_models/address';
import { environment } from 'src/environments/environment';
import { AppAuthenticationService } from 'src/app/_services/app-authentication.service';
import { filter, pairwise } from 'rxjs/operators';
import { CarouselPreviewsComponent } from '@ks89/angular-modal-gallery/lib/components/carousel/carousel-previews/carousel-previews.component';

@Component({
    selector: 'app-app-address',
    templateUrl: './address.component.html',
    styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit {

    AddressModeEnum = {
        UNSET: 0,
        ADD: 1,
        EDIT: 2
    }

    @ViewChild('nameInput') addrName: ElementRef;
    @ViewChild('address1Input') address1: ElementRef;
    @ViewChild('address2Input') address2: ElementRef;
    @ViewChild('cityInput') city: ElementRef;
    @ViewChild('zipInput') zip: ElementRef;
    @ViewChild('countryInput') country: ElementRef;
    @ViewChild('stateInput') state: ElementRef;
    @ViewChild('phonenumber') phone: ElementRef;
    @ViewChild('f') form: NgForm;

    constructor(private route: ActivatedRoute, private router: Router, private appAuthService: AppAuthenticationService, private toastr: ToastrService, private http: HttpClient) { }

    mode = this.AddressModeEnum.UNSET;
    addressId: string = "";
    user: User;
    address: Address;
    previousUrl: string = "/page/addresses";

    ngOnInit() {
        this.appAuthService.tokenAuthenticate();

        this.user = this.appAuthService.getAuthUser();

        AppAuthenticationService.authSubject.subscribe(value => {
            if (value == true) {
                if (this.mode == this.AddressModeEnum.EDIT) {
                    this.user = this.appAuthService.getAuthUser();
                    this.address = this.user.getAddress(this.addressId);

                    this.initializeEditAddress();
                }
            }
        });



        this.router.events
            .pipe(filter((e: any) => e instanceof RoutesRecognized),
                pairwise()
            ).subscribe((e: any) => {
                console.log(e[0].urlAfterRedirects); // previous url
                this.previousUrl = e[0].urlAfterRedirects;
            })


        this.route.queryParams.subscribe(params => {
            switch (params['mode']) {
                case "edit":
                    this.mode = this.AddressModeEnum.EDIT;
                    this.addressId = params['id'];

                    this.user = this.appAuthService.getAuthUser();
                    this.address = this.user.getAddress(this.addressId);

                    if (this.address._id == undefined) {
                        this.router.navigateByUrl(this.previousUrl);
                        this.toastr.error('There was an error loading the page. Please try again.', 'Error!');
                    }

                    this.initializeEditAddress();
                    break;
                case "add":
                    this.mode = this.AddressModeEnum.ADD;
                    break;
                default:
                    this.mode = this.AddressModeEnum.ADD;
                    break;
            }
        })
    }

    initializeEditAddress() {
        this.addrName.nativeElement.value = this.address.name;
        this.address1.nativeElement.value = this.address.address1;
        this.address2.nativeElement.value = this.address.address2;
        this.city.nativeElement.value = this.address.city;
        this.state.nativeElement.value = this.address.state;
        this.zip.nativeElement.value = this.address.zip;
        this.country.nativeElement.value = this.address.country;
        this.phone.nativeElement.value = this.address.phone;
    }

    onSubmit() {
        if (this.form.value["phone"] != undefined) {
            let twilio = "1" + this.form.value["phone"].replace(/[^0-9]/g, '');
            this.form.value["twilio"] = twilio;
        }

        if (this.mode == this.AddressModeEnum.ADD) {
            this.http.post(this.user.getAddAddressURL(), this.form.value, {
                headers: this.appAuthService.getAuthHeader(),
                observe: 'response'
            }).subscribe(
                success => {
                    this.toastr.success("You have successfully added address to account", "Success!");
                    this.router.navigateByUrl("/pages/addresses");
                },
                error => {
                    this.toastr.error("There was an error trying to create the address", "Error!");
                    console.log(error.error);
                });
        } else if (this.mode == this.AddressModeEnum.EDIT) {
            let url = environment.API_URL + "/user/" + this.user._id + "/address/" + this.addressId;

            let object = this.form.value;
            let values = Object.values(object);
            let keys = Object.keys(object);
            let changes: Object = {};

            for (let i = 0; i < keys.length; i++) {
                if (values[i] != "") {
                    changes[keys[i]] = values[i];
                }
            }

            this.http.post(url, changes, {
                headers: this.appAuthService.getAuthHeader(),
                observe: 'response'
            }).subscribe(
                success => {
                    this.toastr.success("You have successfully updated the address", "Success!");
                    this.router.navigateByUrl("/pages/addresses");
                },
                error => {
                    this.toastr.error("There was an error trying to update the address", "Error!");
                });
        }
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
}