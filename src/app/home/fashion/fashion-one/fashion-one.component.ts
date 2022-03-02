import { Component, OnInit } from '@angular/core';
import { ProductSlider } from '../../../shared/data/slider';
import { Product } from 'src/app/_models/product';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AppShoppingService } from 'src/app/_services/app-shopping.service';
import { AppAuthenticationService } from 'src/app/_services/app-authentication.service';

@Component({
  selector: 'app-fashion-one',
  templateUrl: './fashion-one.component.html',
  styleUrls: ['./fashion-one.component.scss']
})
export class FashionOneComponent implements OnInit {

  public featuredProducts: Product[] = [];
  public hotProducts: Product[] = [];

  constructor(private http: HttpClient, private router: Router, private appShoppingService: AppShoppingService, private appAuthService: AppAuthenticationService) { }

  public ProductSliderConfig: any = ProductSlider;

  public sliders = [{
    title: 'welcome to designica',
    subTitle: 'necklaces',
    image: 'assets/images/slider/1.jpg'
  }, {
    title: 'welcome to designica',
    subTitle: 'rings',
    image: 'assets/images/slider/2.jpg'
  }, {
    title: 'welcome to designica',
    subTitle: 'diamonds',
    image: 'assets/images/slider/3.jpg'
  }]

  // Collection banner
  public collections = [{
    image: 'assets/images/collection/fashion/mensjewelry.jpg',
    save: 'save 20%',
    title: 'men'
  }, {
    image: 'assets/images/collection/fashion/womensjewelry.jpg',
    save: 'save 20%',
    title: 'women'
  }];

  // Blog
  public blog = [{
    image: 'assets/images/blog/blog-1.jpg',
    date: '25 January 2020',
    title: 'Lorem ipsum dolor sit consectetur adipiscing elit,',
    by: 'John Dio'
  }, {
    image: 'assets/images/blog/blog-2.jpg',
    date: '26 January 2021',
    title: 'Lorem ipsum dolor sit consectetur adipiscing elit,',
    by: 'John Dio'
  }, {
    image: 'assets/images/blog/blog-3.jpg',
    date: '27 January 2021',
    title: 'Lorem ipsum dolor sit consectetur adipiscing elit,',
    by: 'John Dio'
  }, {
    image: 'assets/images/blog/blog-4.jpg',
    date: '28 February 2021',
    title: 'Lorem ipsum dolor sit consectetur adipiscing elit,',
    by: 'John Dio'
  }];

  // Logo
  public logo = [{
    image: 'assets/images/logos/1.png',
  }, {
    image: 'assets/images/logos/2.png',
  }, {
    image: 'assets/images/logos/3.png',
  }, {
    image: 'assets/images/logos/4.png',
  }, {
    image: 'assets/images/logos/5.png',
  }, {
    image: 'assets/images/logos/6.png',
  }, {
    image: 'assets/images/logos/7.png',
  }, {
    image: 'assets/images/logos/8.png',
  }];

  ngOnInit(): void {

    this.appAuthService.checkServerStatus();

    this.appShoppingService.fetchBag(true, result => { });
    this.appShoppingService.fetchWishlist(false, result => { });
    this.sendGETRequestWithParameters1();
    this.sendGETRequestWithParameters2();

  }

  public sendGETRequestWithParameters1(): void {

    let url = environment.API_URL + "/product?groups=" + environment.LANDING_PAGE_LIST_1;
    this.http.get(url, { observe: 'response' }).subscribe(
      success => {
        let body: any = success.body;

        body.forEach(element => {
          let product = Product.fromJSON(element);
          this.featuredProducts.push(product);
        });
      });
  }

  public sendGETRequestWithParameters2(): void {

    let url = environment.API_URL + "/product?groups=" + environment.LANDING_PAGE_LIST_2;
    this.http.get(url, { observe: 'response' }).subscribe(
      success => {
        let body: any = success.body;

        body.forEach(element => {
          let product = Product.fromJSON(element);
          this.hotProducts.push(product);
        });
      });
  }
}
