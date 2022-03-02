import {
  Component, OnInit, OnDestroy, ViewChild, TemplateRef, Input,
  Injectable, PLATFORM_ID, Inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Size, Variant } from 'src/app/_models/sku';
import { Stock } from 'src/app/_models/shop';
import { HttpClient } from '@angular/common/http';
import { AppShoppingService } from 'src/app/_services/app-shopping.service';
import { environment } from 'src/environments/environment';
import { timingSafeEqual } from 'crypto';

@Component({
  selector: 'app-quick-edit',
  templateUrl: './quick-edit.component.html',
  styleUrls: ['./quick-edit.component.scss']
})
export class QuickEditComponent implements OnInit, OnDestroy {

  public stock: Stock;
  public stockCopy: Stock;

  @ViewChild("quickEdit", { static: false }) QuickEdit: TemplateRef<any>;

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

  public mode: number;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private router: Router, private modalService: NgbModal, private http: HttpClient, private appShoppingService: AppShoppingService) {
  }

  ngOnInit(): void {


  }

  openModal() {

    this.init();

    this.modalOpen = true;
    if (isPlatformBrowser(this.platformId)) { // For SSR 
      this.modalService.open(this.QuickEdit, {
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

  public init() {
    this.stockCopy = Stock.fromJSON(JSON.parse(this.stock.toJSON()));

    if (this.stockCopy.size == undefined) {
      this.selectedSize = this.stockCopy.product.sizes[0]._id;
      this.size = this.stockCopy.product.sizes[0];
      this.stockCopy.size = this.size;
      this.stockCopy.size = this.stockCopy.product.sizes[0];
    } else {
      this.selectedSize = this.stockCopy.size._id;
      this.size = this.stockCopy.size;
    }

    if (this.stockCopy.variant == undefined) {
      this.selectedVariant = this.stockCopy.product.variants[0]._id;
      this.selectedVariantName = this.stockCopy.product.variants[0].name;
      this.variant = this.stockCopy.variant;
      this.stockCopy.variant = this.stockCopy.product.variants[0];
    } else {
      this.selectedVariant = this.stockCopy.variant._id;
      this.variant = this.stockCopy.variant;
      this.selectedVariantName = this.stockCopy.variant.name;
    }

    if (this.stockCopy.quantity == undefined) {
      this.counter = 1;
      this.stockCopy.quantity = 1;
    } else {
      this.counter = this.stockCopy.quantity;
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
    this.stockCopy.size = size;
  }

  selectVariant(variant: Variant) {
    this.selectedVariant = variant._id;
    this.selectedVariantName = variant.name;
    this.stockCopy.variant = variant;
  }

  // Increament
  increment() {
    this.counter++;
    this.stockCopy.quantity = this.counter;
  }

  // Decrement
  decrement() {
    if (this.counter > 1) this.counter--;
    this.stockCopy.quantity = this.counter;
  }

  updateWishlist(previousStockId: string) {
    this.stockCopy._id = previousStockId;
    this.appShoppingService.updateWishlistItem(this.stockCopy, false, result => {
      this.modalService.dismissAll();
      //window.location.reload();
    });
  }

  updateBag(previousStockId: string) {
    this.stockCopy._id = previousStockId;
    this.appShoppingService.updateBagItem(this.stockCopy, false, result => {
      this.modalService.dismissAll();
      //window.location.reload();
    });
  }

  saveToCart() {

    this.appShoppingService.addToBag(this.stockCopy, false, result => {
      this.modalService.dismissAll();
      this.init();
    })
  }

  close() {
    this.modalService.dismissAll();
    this.init();
  }

  ngOnDestroy() {
    if (this.modalOpen) {
      this.modalService.dismissAll();
    }
  }
}
