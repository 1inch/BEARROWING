import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BorrowingComponent} from './borrowing.component';


const routes: Routes = [
    {
        path: '',
        component: BorrowingComponent
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BorrowingRoutingModule {
}
