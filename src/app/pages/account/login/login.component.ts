import { Component, OnInit, ViewChild, ElementRef, ViewChildren, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { NgForm } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { User } from 'src/app/_models/user';
import { AppAuthenticationService } from 'src/app/_services/app-authentication.service';
import { AppShoppingService } from 'src/app/_services/app-shopping.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

  @ViewChild('messageRow') messageRow: ElementRef;

  redirected: boolean = false; // i.e. If Email Alreay exists
  message: string = "";
  public loaded: number = 0;

  constructor(private router: Router, private route: ActivatedRoute, private renderer: Renderer2, private toastr: ToastrService, private http: HttpClient, private appAuthService: AppAuthenticationService, private appShoppingService: AppShoppingService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {

      console.log(params);

      if (params['redirected'] != undefined) {
        this.redirected = params['redirected'] == "true" ? true : false;
      }

      if (params['message'] != undefined) {
        this.message = params['message'];
      }
    })
  }

  ngAfterViewInit(): void {
    if (this.redirected == false) {
      this.renderer.setStyle(this.messageRow.nativeElement, "display", "none");
    } else {
      this.renderer.removeStyle(this.messageRow.nativeElement, "display");
    }
  }

  closeMessageClicked(): void {
    this.redirected = false;
    this.renderer.setStyle(this.messageRow.nativeElement, "display", "none");
  }

  forgotPassword(): void {
    this.router.navigateByUrl("pages/forget/password");
  }

  async onSubmit(values) {

    values["username"] = values["username"].toLowerCase();

    this.http.post(environment.API_URL + "/authenticate/user", values, { observe: 'response', responseType: 'json' })
      .subscribe(
        async success => {
          let user = User.fromJSON(success.body);
          let token = success.headers.get('Authorization');

          this.appAuthService.storeLogin(token, user.toJSON(), values["remember"]);

          AppAuthenticationService.authSubject.next(true);

          await this.appShoppingService.setQueuedWishlistIfExists();
          await this.appShoppingService.setQueuedBagIfExists();

          this.appShoppingService.fetchBag(true, result => { });
          this.appShoppingService.fetchWishlist(true, result => { });

          this.toastr.success('You have successfully logged into your account!', 'Success!');
          this.router.navigateByUrl('/pages/dashboard');
        },
        error => {
          this.appAuthService.deleteAllStorage();

          AppAuthenticationService.authSubject.next(false);

          this.toastr.error('Username or password is incorrect. Please try again.', 'Error!');
        });
  }

}
