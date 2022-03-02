import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit {

  constructor(private http: HttpClient, private toastr: ToastrService, private router: Router) { }

  ngOnInit(): void {
  }

  onSubmit(values) {

    let url = environment.API_URL + "/user/" + values.email.toLowerCase() + "/begin/reset/password";

    this.http.get(url, {
      observe: 'response'
    }).subscribe(
      success => {
        this.toastr.success("Your request has successfully been sent!", "Success!");
        this.router.navigateByUrl("/pages/password/request/success?email=" + values.email.toLowerCase());
      },
      error => {
        this.toastr.error("There was an error with your request!", "Error!");
      }
    );
  }

}
