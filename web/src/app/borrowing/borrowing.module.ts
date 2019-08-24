import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {BorrowingRoutingModule} from './borrowing-routing.module';
import {BorrowingComponent} from './borrowing.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';


@NgModule({
    declarations: [BorrowingComponent],
    imports: [
        CommonModule,
        BorrowingRoutingModule,
        FontAwesomeModule
    ]
})
export class BorrowingModule {
}
