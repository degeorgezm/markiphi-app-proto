import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPayPalModule } from 'ngx-paypal';
import { Ng5SliderModule } from 'ng5-slider';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SharedModule } from '../shared/shared.module';
import { ShopRoutingModule } from './shop-routing.module';
import { FormsModule } from '@angular/forms';
import { ModalBackdropComponent } from 'ngx-bootstrap/modal';

// Product Details Components
import { ProductLeftSidebarComponent } from './product/sidebar/product-left-sidebar/product-left-sidebar.component';
import { ProductRightSidebarComponent } from './product/sidebar/product-right-sidebar/product-right-sidebar.component';
import { ProductNoSidebarComponent } from './product/sidebar/product-no-sidebar/product-no-sidebar.component';
import { FourImageComponent } from './product/four-image/four-image.component';
import { ThreeColumnComponent } from './product/three-column/three-column.component';
import { BundleProductComponent } from './product/bundle-product/bundle-product.component';
import { ImageOutsideComponent } from './product/image-outside/image-outside.component';

// Product Details Widgest Components
import { ServicesComponent } from './product/widgets/services/services.component';
import { CountdownComponent } from './product/widgets/countdown/countdown.component';
import { SocialComponent } from './product/widgets/social/social.component';
import { StockInventoryComponent } from './product/widgets/stock-inventory/stock-inventory.component';
import { RelatedProductComponent } from './product/widgets/related-product/related-product.component';

// Collection Components
import { CollectionLeftSidebarComponent } from './collection/collection-left-sidebar/collection-left-sidebar.component';
import { CollectionRightSidebarComponent } from './collection/collection-right-sidebar/collection-right-sidebar.component';
import { CollectionInfinitescrollComponent } from './collection/collection-infinitescroll/collection-infinitescroll.component';

// Collection Widgets
import { GridComponent } from './collection/widgets/grid/grid.component';
import { PaginationComponent } from './collection/widgets/pagination/pagination.component';
import { BrandsComponent } from './collection/widgets/brands/brands.component';
import { VariantsComponent } from './collection/widgets/variants/variants.component';
import { SizeComponent } from './collection/widgets/size/size.component';
import { PriceComponent } from './collection/widgets/price/price.component';
import { DepartmentsComponent } from './collection/widgets/departments/departments.components';

import { BagComponent } from './bag/bag.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { CompareComponent } from './compare/compare.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { SuccessComponent } from './checkout/success/success.component';
import { WriteReviewComponent } from './product/write-review/write-review.component';

import { QuickEditComponent } from './_components/quick-edit/quick-edit.component';
import { QuickAddAddressComponent } from './checkout/checkout.component';
import { ReviewOrderComponent } from './checkout/checkout.component';


@NgModule({
  declarations: [
    ProductLeftSidebarComponent,
    ProductRightSidebarComponent,
    ProductNoSidebarComponent,
    ThreeColumnComponent,
    FourImageComponent,
    BundleProductComponent,
    ImageOutsideComponent,
    ServicesComponent,
    CountdownComponent,
    SocialComponent,
    StockInventoryComponent,
    RelatedProductComponent,
    CollectionLeftSidebarComponent,
    CollectionRightSidebarComponent,
    CollectionInfinitescrollComponent,
    GridComponent,
    PaginationComponent,
    BrandsComponent,
    VariantsComponent,
    SizeComponent,
    PriceComponent,
    BagComponent,
    WishlistComponent,
    CompareComponent,
    CheckoutComponent,
    SuccessComponent,
    QuickEditComponent,
    QuickAddAddressComponent,
    ReviewOrderComponent,
    DepartmentsComponent,
    WriteReviewComponent
  ],
  imports: [
    CommonModule,
    NgxPayPalModule,
    Ng5SliderModule,
    InfiniteScrollModule,
    SharedModule,
    ShopRoutingModule,
    FormsModule
  ],
  entryComponents: [
    ModalBackdropComponent
  ]
})
export class ShopModule { }
