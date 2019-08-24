import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {faTimesCircle} from '@fortawesome/free-regular-svg-icons';
import {faMinusCircle, faPlusCircle} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-borrowing',
    templateUrl: './borrowing.component.html',
    styleUrls: ['./borrowing.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class BorrowingComponent implements OnInit {

    filter = [];
    timesCircleIcon = faTimesCircle;
    plusCircleIcon = faPlusCircle;
    minusCircleIcon = faMinusCircle;



    constructor() {
    }

    ngOnInit() {
    }

    setFilter(value) {

        this.filter.push(value);
    }

    clearFilter() {

        this.filter = [];
    }

    inFilter(value) {

        return this.filter.indexOf(value) !== -1;
    }
}
