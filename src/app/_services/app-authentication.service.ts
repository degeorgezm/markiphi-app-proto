import { User } from 'src/app/_models/user';
import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';

// key that is used to access the data in local storage
const USER_STORAGE_KEY = 'local_user';
const AUTH_STORAGE_KEY = 'local_auth';
const AUTH_REMEMBER_KEY = 'local_remember';

@Injectable({
    // declares that this service should be created
    // by the root application injector.
    providedIn: 'root',
})
export class AppAuthenticationService {

    public static authSubject = new Subject();
    public static userSubject = new Subject();

    // For lack of having a better place to put these...
    public static billingAddressSelected = new Subject();
    public static shippingAddressSelected = new Subject();

    constructor(private http: HttpClient, private router: Router, @Inject(LOCAL_STORAGE) private storage: StorageService) { }

    public tokenAuthenticate(): void {

        if (!this.storage.has(AUTH_STORAGE_KEY)) {
            this.logout();
            return;
        }

        this.http.get(environment.API_URL + "/authenticate/verify", {
            headers: this.getAuthHeader(),
            observe: 'response'
        }).subscribe(
            success => {
                // continue to site
                let user = this.getAuthUser();
                let prevUpdatedDate = user._updatedDate.toString();
                let updatedDate = new Date(success.body['_updatedDate']).toString();

                if (prevUpdatedDate != updatedDate) {

                    console.log("User model updated. Fetching updated user...");

                    this.http.get(environment.API_URL + "/user/" + user._id, {
                        headers: this.getAuthHeader(),
                        observe: 'response'
                    }).subscribe(
                        success => {
                            console.log("Successfully fetched new user");

                            let user = User.fromJSON(success.body);
                            this.storeUser(user.toJSON());

                            AppAuthenticationService.authSubject.next(true);
                        },
                        error => {
                            // do something
                            console.log("Error fetching new user");
                            console.log(error);
                        });
                } else {
                    console.log("User model up to date")

                    AppAuthenticationService.authSubject.next(true);
                }
            },
            error => {
                this.logout();
            });
    }

    public checkServerStatus(): void {
        this.http.get(environment.API_URL + "/", {
            observe: 'response'
        }).subscribe(
            success => {
                let response: any = success.body;

                if (response.status != "OK") {
                    this.logout();
                } else {
                }
            },
            error => {
                this.logout();
            });
    }

    public refreshUser() {
        let user = this.getAuthUser();

        let promise = new Promise((resolve, reject) => {
            this.http.get(environment.API_URL + "/user/" + user._id, {
                headers: this.getAuthHeader(),
                observe: 'response'
            }).toPromise().then(
                success => {
                    console.log("Successfully fetched new user");

                    let user = User.fromJSON(success.body);
                    this.storeUser(user.toJSON());
                    resolve(true)
                },
                error => {
                    // do something
                    console.log("Error fetching new user");
                    console.log(error);
                    reject(false);
                });
        })

        return promise;

    }

    public deleteAllStorage(): void {
        this.storage.remove(AUTH_STORAGE_KEY);
        this.storage.remove(USER_STORAGE_KEY);
        this.storage.remove(AUTH_REMEMBER_KEY);
    }

    public logout(): void {
        this.deleteAllStorage();

        console.log("Logged Out");

        AppAuthenticationService.authSubject.next(false);
        this.router.navigateByUrl('**');
    }

    public loggedIn(): boolean {
        if (this.storage.has(AUTH_STORAGE_KEY)) {
            AppAuthenticationService.authSubject.next(true);
            return true;
        } else {
            AppAuthenticationService.authSubject.next(false);
            return false
        }
    }

    public getAuthUser(): User {

        if (!this.storage.has(USER_STORAGE_KEY)) {
            return new User();
        }

        return User.fromJSON(JSON.parse(this.storage.get(USER_STORAGE_KEY)));
    }

    public getAuthHeader(): HttpHeaders {
        let token = this.storage.get(AUTH_STORAGE_KEY);

        let authHeader = new HttpHeaders({ 'Authorization': token });

        return authHeader;
    }

    public storeLogin(auth: string, user: string, remember: boolean) {
        this.storage.set(AUTH_STORAGE_KEY, auth);
        this.storage.set(USER_STORAGE_KEY, user);
        this.storage.set(AUTH_REMEMBER_KEY, remember.toString());
    }

    public storeUser(user: string) {
        console.log(JSON.parse(user));
        this.storage.set(USER_STORAGE_KEY, user);
        AppAuthenticationService.userSubject.next(true);
    }

    public rememberLogin(): boolean {

        if (this.storage.has(AUTH_REMEMBER_KEY)) {
            let value: boolean = JSON.parse(this.storage.get(AUTH_REMEMBER_KEY));
            return value;
        } else {
            return false;
        }
    }


}