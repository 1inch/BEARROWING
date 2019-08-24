import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {BorrowingRoutingModule} from './borrowing-routing.module';
import {BorrowingComponent} from './borrowing.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {LoadingSpinnerModule} from '../loading-spinner/loading-spinner.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';


@NgModule({
    declarations: [BorrowingComponent],
    imports: [
        CommonModule,
        FormsModule,
        BorrowingRoutingModule,
        FontAwesomeModule,
        LoadingSpinnerModule,
        ReactiveFormsModule
    ]
})
export class BorrowingModule {
}
