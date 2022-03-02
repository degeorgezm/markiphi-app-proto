import {
  Component, OnInit, OnDestroy, ViewChild, TemplateRef, Input,
  Injectable, PLATFORM_ID, Inject, AfterViewInit
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Product } from 'src/app/_models/product';
import { Size, Variant } from 'src/app/_models/sku';
import { AppShoppingService } from 'src/app/_services/app-shopping.service';
import { Stock } from 'src/app/_models/shop';
import { User } from 'src/app/_models/user';
import { AppAuthenticationService } from 'src/app/_services/app-authentication.service';
import { INITIAL_CONFIG } from '@angular/platform-server';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-quick-view',
  templateUrl: './quick-view.component.html',
  styleUrls: ['./quick-view.component.scss']
})
export class QuickViewComponent implements OnInit, OnDestroy {

  @Input() product: Product;
  @Input() size_in?: Size;
  @Input() variant_in?: Variant;
  @ViewChild("quickView", { static: false }) QuickView: TemplateRef<any>;

  public closeResult: string;
  public ImageSrc: string;
  public counter: number = 1;
  public modalOpen: boolean = false;

  public activeSlide: any = 0;
  public selectedSize: string;
  public selectedVariant: string;
  public selectedVariantName: string;
  public variant: Variant;
  public size: Size;
  public user: User;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private router: Router, private modalService: NgbModal, private appShoppingService: AppShoppingService, private appAuthService: AppAuthenticationService) {
  }

  ngOnInit(): void {
    this.init();
  }

  init() {

    if (this.product == undefined) return;

    this.selectedSize = this.size_in ? this.size_in._id : this.product.sizes[0] ? this.product.sizes[0]._id : "";
    this.selectedVariant = this.variant_in ? this.variant_in._id : this.product.variants[0] ? this.product.variants[0]._id : "";
    this.selectedVariantName = this.variant_in ? this.variant_in.name : this.product.variants[0].name ? this.product.variants[0].name : "";
    this.variant = this.variant_in ? this.variant_in : this.product.variants[0];
    this.size = this.size_in ? this.size_in : this.product.sizes[0];
    this.user = this.appAuthService.getAuthUser();
  }

  openModal() {
    this.modalOpen = true;
    this.counter = 1;
    if (isPlatformBrowser(this.platformId)) { // For SSR 
      this.modalService.open(this.QuickView, {
        ariaLabelledBy: 'modal-basic-title',
        centered: true,
        windowClass: 'Quickview'
      }).result.then((result) => {
        `Result ${result}`
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    }
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  selectSize(size: Size) {
    this.selectedSize = size._id;
    this.size = size;
  }

  selectVariant(variant: Variant) {
    this.selectedVariant = variant._id;
    this.selectedVariantName = variant.name;
    this.variant = variant;
  }

  // Increament
  increment() {
    this.counter++;
  }

  // Decrement
  decrement() {
    if (this.counter > 1) this.counter--;
  }

  save() {
    let stock = new Stock();
    stock.user = this.user;
    stock.variant = this.variant;
    stock.size = this.size;
    stock.quantity = this.counter;
    stock.product = this.product;

    this.appShoppingService.updateBagItem(stock, true, result => { });
  }

  // Add to cart
  addToBag() {
    console.log("Add to bag clicked");

    let stock = new Stock();
    stock.user = this.user;
    stock.variant = this.variant;
    stock.size = this.size;
    stock.quantity = this.counter;
    stock.product = this.product;

    this.appShoppingService.addToBag(stock, false, result => {
      if (result == true) {
        this.modalService.dismissAll();
        this.init();
      }
    });
  }

  ngOnDestroy() {
    if (this.modalOpen) {
      this.modalService.dismissAll();
    }
  }

}
