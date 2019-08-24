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

    pools = [
        {
            id: 'aave',
            name: 'Aave DLP',
            icon: 'aave-logo-color.svg'
        },
        {
            id: 'compound',
            name: 'Compound',
            icon: 'compound-v2.svg'
        },
        {
            id: 'fulcrum',
            name: 'Fulcrum',
            icon: 'fulcrum.png'
        },
        {
            id: 'nuo',
            name: 'Nuo',
            icon: 'nuo.png'
        }
    ];

    resultPools = [];

    constructor() {

    }

    ngOnInit() {

        this.setResultPools();
    }

    async setResultPools() {

        this.resultPools = this.pools
            .filter(pool => !this.filter.length || this.filter.filter(value => pool.id === value).length || false);
    }

    toggleFilter(value) {

        if (this.filter.indexOf(value) === -1) {

            this.filter.push(value);
        } else {

            this.filter = this.filter.filter(v => v !== value);
        }

        this.setResultPools();
    }

    clearFilter() {

        this.filter = [];
        this.setResultPools();
    }

    inFilter(value) {

        return this.filter.indexOf(value) !== -1;
    }
}
