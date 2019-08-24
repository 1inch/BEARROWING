import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {faTimesCircle} from '@fortawesome/free-regular-svg-icons';
import {faMinusCircle, faPlusCircle} from '@fortawesome/free-solid-svg-icons';
import {CompoundService} from './compound.service';
import {Web3Service} from '../web3.service';
import {ethers} from 'ethers';
import {ConnectService} from '../connect.service';

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
    loading = true;
    notConnected = false;

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
    compoundBalances = [];
    compoundBorrowedBalances = [];

    constructor(
        protected web3Service: Web3Service,
        protected compoundService: CompoundService,
        protected connectService: ConnectService
    ) {

        this.web3Service.connectEvent.subscribe(async () => {

            this.notConnected = false;
            this.loading = true;

            console.log('this.web3Service.walletAddress', this.web3Service.walletAddress);

            const [compoundBalances, compoundBorrowedBalances] = await Promise.all([
                this.compoundService.getBalances(
                    this.web3Service.walletAddress
                ),
                this.compoundService.getBorrowedBalances(
                    this.web3Service.walletAddress
                )
            ]);

            this.compoundBalances = compoundBalances;
            this.compoundBorrowedBalances = compoundBorrowedBalances;

            this.loading = false;

            this.setResultPools();
        });

        setTimeout(() => {

            if (
                this.loading &&
                !this.web3Service.walletAddress
            ) {

                this.notConnected = true;
                this.loading = false;
            }

        }, 9000);
    }

    async ngOnInit() {

        this.setResultPools();
    }

    async connect() {

        this.connectService.startConnectEvent.next();
    }

    async setResultPools() {

        this.resultPools = this.pools
            .filter(pool => !this.filter.length || this.filter.filter(value => pool.id === value).length || false)
            .map(pool => {

                const tokensWithBalance = this.compoundBalances
                    .filter(token => ethers.utils.bigNumberify(token.rawBalance).gt(0));

                if (
                    pool.id === 'compound' &&
                    tokensWithBalance.length
                ) {

                    pool['tokensWithBalance'] = tokensWithBalance;
                } else {

                    pool['tokensWithBalance'] = null;
                }

                const tokensWithBorrowedBalance = this.compoundBorrowedBalances
                    .filter(token => ethers.utils.bigNumberify(token.rawBalance).gt(0));

                if (
                    pool.id === 'compound' &&
                    tokensWithBorrowedBalance.length
                ) {

                    pool['tokensWithBorrowedBalance'] = tokensWithBorrowedBalance;
                } else {

                    pool['tokensWithBorrowedBalance'] = null;
                }

                return pool;
            })
            .filter(pool => pool['tokensWithBalance'] !== null || pool['tokensWithBorrowedBalance'] !== null);

        console.log('this.resultPools', this.resultPools);
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

    async lend(pool) {

        console.log('pool', pool);
    }
}
