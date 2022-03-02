import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-password-request-success',
    templateUrl: './password-request-success.component.html',
    styleUrls: ['./password-request-success.component.scss']
})
export class PasswordRequestSuccessComponent implements OnInit {

    public email: string;

    constructor(private router: Router, private route: ActivatedRoute) {
        this.route.queryParams.subscribe(params => {
            this.email = params.email;
        })
    }

    ngOnInit(): void {
    }

    onSubmit() {

    }

}