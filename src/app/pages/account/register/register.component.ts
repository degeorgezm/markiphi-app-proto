import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/_models/user';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AppAuthenticationService } from 'src/app/_services/app-authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  @ViewChild('password1') password1: ElementRef;
  @ViewChild('password2') password2: ElementRef;
  @ViewChild('phonenumber') phone: ElementRef;

  passwordTipMessage: string = "Tip: Use uppercase, lowercase, numbers, characters and more values for a stronger password";
  passwordTipHiddenMessage: string = "";

  constructor(private http: HttpClient, private toastr: ToastrService, private router: Router, private appAuthService: AppAuthenticationService) { }

  ngOnInit(): void {
    for (let i = 0; i < this.passwordTipMessage.length; i++) {
      this.passwordTipHiddenMessage.concat(" ");
    }
  }

  onSubmit(values): void {

    values["email"] = values["email"].toLowerCase();

    let twilio = "1" + values["phone"].replace(/[^0-9]/g, '');
    values["twilio"] = twilio;

    this.http.post(environment.API_URL + "/user", values, { observe: 'response', responseType: 'json' })
      .subscribe(
        success => {
          var date = new Date();
          date.setDate(date.getDate() + 7);

          let user = User.fromJSON(success.body);
          let token = success.headers.get('Authorization');

          this.appAuthService.storeLogin(token, user.toJSON(), true);

          AppAuthenticationService.authSubject.next(true);

          this.toastr.success('You have successfully created your account!', 'Success');
          this.router.navigateByUrl('/pages/dashboard?redirected=true');
        },
        error => {
          this.toastr.error(error.error.error, 'Error!');

          this.appAuthService.deleteAllStorage();

          AppAuthenticationService.authSubject.next(false);

          this.router.navigateByUrl('pages/login?redirected=true&message=' + error.error.error);
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

  passwordContainsNumber: boolean = false;
  passwordContainsLower: boolean = false;
  passwordContainsUppercase: boolean = false;
  passwordContainsCharacter: boolean = false;
  passwordIs8CharsLong: boolean = false;
  passwordsMatch: boolean = true;
  passwordEntryStarted: boolean = false;
  passwordEntry2Started: boolean = false;
  passwordIsValid: boolean = false;

  passwordValid(): void {
    if (this.passwordContainsNumber &&
      this.passwordContainsLower &&
      this.passwordContainsUppercase &&
      this.passwordContainsCharacter &&
      this.passwordIs8CharsLong &&
      this.passwordsMatch) {
      this.passwordIsValid = true;
    } else {
      this.passwordIsValid = false;
    }
  }

  password1OnChange(): void {
    this.passwordEntryStarted = true;
    this.passwordEntry2Started = false;

    this.passwordContainsUppercase = this.containsUpper(this.password1.nativeElement.value);
    this.passwordContainsLower = this.containsLower(this.password1.nativeElement.value);
    this.passwordContainsNumber = this.containsNumber(this.password1.nativeElement.value);
    this.passwordContainsCharacter = this.containsCharacter(this.password1.nativeElement.value);
    this.passwordIs8CharsLong = this.is8CharactersLong(this.password1.nativeElement.value);

    this.passwordValid();
  }

  password2OnChange(): void {
    this.passwordEntry2Started = true;
    this.passwordEntryStarted = false;

    this.passwordsMatch = this.password1.nativeElement.value == this.password2.nativeElement.value ? true : false;

    this.passwordValid();
  }

  containsUpper(str: string): boolean {
    for (let i = 0; i < str.length; i++) {
      let char = str.charCodeAt(i);
      if (char >= "A".charCodeAt(0) && char <= "Z".charCodeAt(0)) {
        return true;
      }
    }
    return false
  }

  containsLower(str: string): boolean {
    for (let i = 0; i < str.length; i++) {
      let char = str.charCodeAt(i);
      if (char >= "a".charCodeAt(0) && char <= "z".charCodeAt(0)) {
        return true;
      }
    }
    return false
  }

  containsNumber(str: string): boolean {
    for (let i = 0; i < str.length; i++) {
      let char = str.charCodeAt(i);
      if (char >= "0".charCodeAt(0) && char <= "9".charCodeAt(0)) {
        return true;
      }
    }
    return false
  }

  containsCharacter(str: string): boolean {
    for (let i = 0; i < str.length; i++) {
      let char = str.charCodeAt(i);
      if ((char >= "!".charCodeAt(0) && char <= "/".charCodeAt(0)) || (char >= "[".charCodeAt(0) && char <= "`".charCodeAt(0)) || (char >= "{".charCodeAt(0) && char <= "~".charCodeAt(0))) {
        return true;
      }
    }
    return false
  }

  is8CharactersLong(str: string): boolean {
    if (str.length >= 8) {
      return true;
    } else {
      return false;
    }
  }



}
