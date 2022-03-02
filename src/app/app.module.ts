import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { ToastrModule } from 'ngx-toastr';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppAuthenticationService } from 'src/app/_services/app-authentication.service';
import { AppShoppingService } from 'src/app/_services/app-shopping.service';
import { StorageServiceModule } from 'ngx-webstorage-service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ModalBackdropComponent, ModalContainerComponent } from 'ngx-bootstrap/modal';
import { QuickAddAddressComponent } from './shop/checkout/checkout.component';
import { ReviewOrderComponent } from './shop/checkout/checkout.component';
import { ReturnItemComponent } from './pages/_components/return-box/return-box.component';
import { ReturnItem2Component } from './pages/_components/return-box/return-box.component';
import { ReturnItem3Component } from './pages/_components/return-box/return-box.component';
import { ViewOrderDetailsSubcomponent } from './pages/_components/order-box/order-box.component';

import { AppComponent } from './app.component';
import { ShopComponent } from './shop/shop.component';
import { PagesComponent } from './pages/pages.component';
import { ElementsComponent } from './elements/elements.component';


// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  declarations: [
    AppComponent,
    ShopComponent,
    PagesComponent,
    ElementsComponent

  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserAnimationsModule,
    HttpClientModule,
    NgbModule,
    LoadingBarHttpClientModule,
    LoadingBarRouterModule,
    ToastrModule.forRoot({
      timeOut: 2000,
      progressBar: false,
      enableHtml: true,
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    SharedModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    StorageServiceModule
  ],
  providers: [
    AppAuthenticationService,
    AppShoppingService,
    BsModalService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ModalBackdropComponent,
    ModalContainerComponent,
    QuickAddAddressComponent,
    ReviewOrderComponent,
    ReturnItemComponent,
    ReturnItem2Component,
    ReturnItem3Component,
    ViewOrderDetailsSubcomponent
  ]
})
export class AppModule { }
