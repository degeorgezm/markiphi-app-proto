import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/_models/user';
import { Order, OrderItem, OrderStatus } from 'src/app/_models/shop';
import { Product } from 'src/app/_models/product';
import { AppAuthenticationService } from 'src/app/_services/app-authentication.service';
import { AppShoppingService } from 'src/app/_services/app-shopping.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { blobToBase64, dateToString, timeToString } from 'src/app/_models/macros';

@Component({
    selector: 'app-returns',
    templateUrl: './returns.component.html',
    styleUrls: ['./returns.component.scss']
})
export class ReturnsComponent implements OnInit {

    public user: User;
    public orderId: string;
    public loaded: boolean = false;

    public order: Order;
    public orderCreatedDate: string;
    public orderCreatedTime: string;
    public orderStatus: OrderStatus;
    public orderStatusDate: string;
    public orderStatusTime: string;

    public static ProcessReturnSubject = new Subject();

    constructor(private appAuthService: AppAuthenticationService, private appShoppingService: AppShoppingService, private http: HttpClient, private toastr: ToastrService, private router: Router, private route: ActivatedRoute,
    ) { }

    ngOnInit(): void {

        this.appAuthService.tokenAuthenticate();

        this.user = this.appAuthService.getAuthUser();

        this.orderId = this.route.snapshot.paramMap.get('orderId')

        this.route.queryParams.subscribe(params => {
            let url = environment.API_URL + "/shopping/" + this.user._id + "/order/" + this.orderId;

            this.http.get(url, {
                headers: this.appAuthService.getAuthHeader(),
                observe: 'response'
            }).subscribe(
                success => {
                    let body = success.body;

                    this.order = Order.fromJSON(body);
                    this.orderStatus = this.order.getStatus();
                    this.orderCreatedDate = dateToString(this.order._creationDate);
                    this.orderCreatedTime = timeToString(this.order._creationDate);
                    this.orderStatusDate = dateToString(this.orderStatus._creationDate);
                    this.orderStatusTime = timeToString(this.orderStatus._creationDate);

                    this.loaded = true;

                    console.log(this.order.items);

                    this.order.items.forEach(item => {
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
                }
            );
        })
    }
}
