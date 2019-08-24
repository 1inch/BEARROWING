import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {BorrowingRoutingModule} from './borrowing-routing.module';
import {BorrowingComponent} from './borrowing.component';


@NgModule({
    declarations: [BorrowingComponent],
    imports: [
        CommonModule,
        BorrowingRoutingModule
    ]
})
export class BorrowingModule {
}
