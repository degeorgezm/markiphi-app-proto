import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

    @ViewChild('password1') password1: ElementRef;
    @ViewChild('password2') password2: ElementRef;

    public email: string;
    public token: string;

    constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private toastr: ToastrService) {
        this.route.queryParams.subscribe(params => {
            this.email = params.email;
            this.token = params.token;

            console.log(this.email);
            console.log(this.token);
        })
    }

    ngOnInit(): void {

    }

    onSubmit(values) {

        let body = {
            token: this.token,
            password: values.password1
        }

        console.log(body);

        this.http.post(environment.API_URL + "/user/" + this.email + "/reset/password", body, {
            observe: 'response'
        }).subscribe(
            success => {
                this.toastr.success("Password successfully updated!", "Success!");
                this.router.navigateByUrl('**');
            },
            error => {
                this.toastr.error("Error updating password. Check previous password and try again.", "Error");
            }
        );
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