import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/_models/user';
import { Order } from 'src/app/_models/shop';
import { Product } from 'src/app/_models/product';
import { AppAuthenticationService } from 'src/app/_services/app-authentication.service';
import { AppShoppingService } from 'src/app/_services/app-shopping.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { blobToBase64 } from 'src/app/_models/macros';

@Component({
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {

    public user: User;
    public orders: Order[] = [];
    public loaded: boolean = false;

    constructor(private appAuthService: AppAuthenticationService, private appShoppingService: AppShoppingService, private http: HttpClient, private toastr: ToastrService, private router: Router) { }

    ngOnInit(): void {
        this.appAuthService.tokenAuthenticate();

        this.user = this.appAuthService.getAuthUser();

        this.http.get(environment.API_URL + "/shopping/" + this.user._id + "/orders", {
            headers: this.appAuthService.getAuthHeader(),
            observe: 'response'
        }).subscribe(
            success => {
                let body: any = success.body;

                body.forEach(element => {
                    let order = Order.fromJSON(element);
                    this.orders.push(order);
                });

                this.loaded = true;

                this.orders.forEach(order => {
                    order.items.forEach(item => {
                        this.http.get(environment.API_URL + "/product/" + item.product._id + "/photo/download", { observe: 'response', responseType: 'blob' })
                            .subscribe(
                                success => {
                                    blobToBase64(success.body, result => {
                                        item.product.image.src = result;
                                    });
                                },
                                error => {
                                    console.log("Error fetching image");
                                });
                    });
                });
            },
            error => {
                this.toastr.error("There was an error fetching your orders.", "Error!");
                this.router.navigateByUrl('/pages/dashboard');
            }
        )
    }
}
