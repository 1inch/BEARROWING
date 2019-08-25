import {Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {faTimesCircle} from '@fortawesome/free-regular-svg-icons';
import {faFileInvoiceDollar, faMinusCircle, faPlusCircle} from '@fortawesome/free-solid-svg-icons';
import {CompoundService} from './compound.service';
import {Web3Service} from '../web3.service';
import {ethers} from 'ethers';
import {ConnectService} from '../connect.service';
import {TokenService} from '../token.service';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {FormControl} from '@angular/forms';
import {debounceTime, distinctUntilChanged, filter} from 'rxjs/operators';

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
    fileInvoiceDollarIcon = faFileInvoiceDollar;
    minusCircleIcon = faMinusCircle;
    loading = true;
    notConnected = false;

    lendTemplateModalRef: BsModalRef;
    newLendTemplateModalRef: BsModalRef;
    borrowTemplateModalRef: BsModalRef;
    repayTemplateModalRef: BsModalRef;
    withdrawTemplateModalRef: BsModalRef;

    @ViewChild('lendTemplate', {static: false})
    lendTemplate: TemplateRef<any>;

    @ViewChild('newLendTemplate', {static: false})
    newLendTemplate: TemplateRef<any>;

    @ViewChild('borrowTemplate', {static: false})
    borrowTemplate: TemplateRef<any>;

    @ViewChild('repayTemplate', {static: false})
    repayTemplate: TemplateRef<any>;

    @ViewChild('withdrawTemplate', {static: false})
    withdrawTemplate: TemplateRef<any>;

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
    selectedPool;
    selectedToken;
    fromTokenAmountControl = new FormControl('');
    fromTokenAmount;
    fromTokenBalance = '0';
    fromTokenBalanceBN = ethers.utils.bigNumberify(0);
    fromToken;
    modalLoading = false;

    constructor(
        protected web3Service: Web3Service,
        protected compoundService: CompoundService,
        protected connectService: ConnectService,
        protected tokenService: TokenService,
        private modalService: BsModalService
    ) {

        this.web3Service.connectEvent.subscribe(async () => {

            this.notConnected = false;
            this.loading = true;

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

        this.fromTokenAmountControl.valueChanges.pipe(
            debounceTime(200),
            filter((value, index) => this.isNumeric(value) && value !== 0 && !value.match(/^([0\.]+)$/)),
            distinctUntilChanged(),
        )
            .subscribe((value) => {

                this.fromTokenAmount = value;
                localStorage.setItem('fromTokenAmount', this.fromTokenAmount);
            });

        if (localStorage.getItem('fromTokenAmount')) {

            this.fromTokenAmountControl.setValue(localStorage.getItem('fromTokenAmount'));
        } else {

            this.fromTokenAmountControl.setValue('1.0');
        }
    }

    async loadTokenBalance() {

        if (
            this.web3Service.walletAddress
        ) {

            if (this.fromToken === 'ETH') {

                this.fromTokenBalanceBN = (await this.web3Service.provider.eth.getBalance(this.web3Service.walletAddress))
                    .mul(95)
                    .div(100);

                this.fromTokenBalance = ethers.utils.formatEther(
                    this.fromTokenBalanceBN
                );

            } else {

                this.fromTokenBalanceBN = await this.tokenService.getTokenBalance(
                    this.fromToken,
                    await this.web3Service.walletAddress
                );

                this.fromTokenBalance = this.tokenService.formatAsset(
                    this.fromToken,
                    // @ts-ignore
                    this.fromTokenBalanceBN
                );
            }

            this.fromTokenBalance = this.tokenService.toFixed(this.fromTokenBalance, 18);

            if (this.fromTokenBalance === '0') {

                this.fromTokenBalance = '0.0';
                this.fromTokenBalanceBN = ethers.utils.bigNumberify(0);
            }
        }
    }

    async connect() {

        this.connectService.startConnectEvent.next();
    }

    async setResultPools() {

        this.resultPools = this.pools
            .filter(pool => !this.filter.length || this.filter.filter(value => pool.id === value).length || false)
            .map(pool => {

                if (pool.id === 'compound') {

                    const tokensWithBalance = this.compoundBalances
                        .filter(token => ethers.utils.bigNumberify(token.rawBalance).gt(0));

                    if (
                        tokensWithBalance.length
                    ) {

                        pool['tokensWithBalance'] = tokensWithBalance;
                    } else {

                        pool['tokensWithBalance'] = null;
                    }

                    const tokensWithBorrowedBalance = this.compoundBorrowedBalances
                        .filter(token => ethers.utils.bigNumberify(token.rawBalance).gt(0));

                    if (
                        tokensWithBorrowedBalance.length
                    ) {

                        pool['tokensWithBorrowedBalance'] = tokensWithBorrowedBalance;
                    } else {

                        pool['tokensWithBorrowedBalance'] = null;
                    }

                    pool['collateralisation'] = this.rand(120, 180);

                    return pool;
                } else {

                    let tokensWithBalance;

                    if (this.rand(0, 1)) {

                        tokensWithBalance = this.shuffle([
                            Object.assign({}, this.tokenService.tokens['ETH']),
                            Object.assign({}, this.tokenService.tokens['DAI']),
                            Object.assign({}, this.tokenService.tokens['WBTC']),
                            Object.assign({}, this.tokenService.tokens['PAX']),
                            Object.assign({}, this.tokenService.tokens['KNC']),
                        ]);
                    } else {

                        tokensWithBalance = this.shuffle([
                            Object.assign({}, this.tokenService.tokens['ETH']),
                            Object.assign({}, this.tokenService.tokens['DAI']),
                            Object.assign({}, this.tokenService.tokens['WBTC']),
                            Object.assign({}, this.tokenService.tokens['ZRX']),
                            Object.assign({}, this.tokenService.tokens['USDC']),
                        ]);
                    }

                    tokensWithBalance = tokensWithBalance.map(token => {

                        token['balance'] = this.rand(1, 10000) / 10000;

                        return token;
                    });

                    if (
                        tokensWithBalance.length
                    ) {

                        pool['tokensWithBalance'] = tokensWithBalance;
                    } else {

                        pool['tokensWithBalance'] = null;
                    }

                    let tokensWithBorrowedBalance;

                    if (this.rand(0, 1)) {

                        tokensWithBorrowedBalance = this.shuffle([
                            Object.assign({}, this.tokenService.tokens['DAI']),
                            Object.assign({}, this.tokenService.tokens['USDC']),
                            Object.assign({}, this.tokenService.tokens['PAX']),
                        ]);
                    } else {

                        tokensWithBorrowedBalance = this.shuffle([
                            Object.assign({}, this.tokenService.tokens['ZRX']),
                            Object.assign({}, this.tokenService.tokens['WBTC']),
                            Object.assign({}, this.tokenService.tokens['BAT']),
                        ]);
                    }

                    tokensWithBorrowedBalance = tokensWithBorrowedBalance.map(token => {

                        token['balance'] = this.rand(1, 10000) / 10000;

                        return token;
                    });

                    if (
                        tokensWithBorrowedBalance.length
                    ) {

                        pool['tokensWithBorrowedBalance'] = tokensWithBorrowedBalance;
                    } else {

                        pool['tokensWithBorrowedBalance'] = null;
                    }

                    pool['collateralisation'] = this.rand(120, 180);

                    return pool;
                }
            });
        // .filter(pool => pool['tokensWithBalance'] !== null || pool['tokensWithBorrowedBalance'] !== null);
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

    async openLendModal(pool, token) {

        this.selectedPool = pool;
        this.selectedToken = token;

        this.fromToken = token.symbol;

        this.loadTokenBalance();

        this.lendTemplateModalRef = this.modalService.show(this.lendTemplate);
    }

    async openNewLendModal(pool) {

        this.selectedPool = pool;

        this.loadTokenBalance();

        this.newLendTemplateModalRef = this.modalService.show(this.newLendTemplate);
    }

    async openWithdrawModal(pool, token) {

        this.selectedPool = pool;
        this.selectedToken = token;

        this.fromToken = token.symbol;

        this.withdrawTemplateModalRef = this.modalService.show(this.withdrawTemplate);
    }

    async openBorrowModal(pool, token) {

        this.selectedPool = pool;
        this.selectedToken = token;

        this.fromToken = token.symbol;

        this.borrowTemplateModalRef = this.modalService.show(this.borrowTemplate);
    }

    async openRepayModal(pool, token) {

        this.selectedPool = pool;
        this.selectedToken = token;

        this.fromToken = token.symbol;

        this.repayTemplateModalRef = this.modalService.show(this.repayTemplate);
    }

    isNumeric(str) {
        return /^\d*\.{0,1}\d*$/.test(str);
    }

    async lend() {

        this.modalLoading = true;

        try {

            if (this.selectedPool.id === 'compound') {

                await this.compoundService.lend(
                    this.selectedToken.symbol,
                    this.tokenService.parseAsset(
                        this.selectedToken.symbol,
                        this.fromTokenAmount
                    )
                );
            } else {

                alert('Not supported yet...');
            }

        } catch (e) {

            console.error(e);
        }

        this.lendTemplateModalRef.hide();
        this.modalLoading = false;
    }

    async repay() {

        this.modalLoading = true;

        try {

            if (this.selectedPool.id === 'compound') {


            } else {

                alert('Not supported yet...');
            }

        } catch (e) {

            console.error(e);
        }

        this.repayTemplateModalRef.hide();
        this.modalLoading = false;
    }

    async borrow() {

        this.modalLoading = true;

        try {

            if (this.selectedPool.id === 'compound') {

                await this.compoundService.borrow(
                    this.selectedToken.symbol,
                    this.tokenService.parseAsset(
                        this.selectedToken.symbol,
                        this.fromTokenAmount
                    )
                );
            } else {

                alert('Not supported yet...');
            }

        } catch (e) {

            console.error(e);
        }

        this.borrowTemplateModalRef.hide();
        this.modalLoading = false;
    }

    async withdraw(pool, token) {

        try {

            if (this.selectedPool.id === 'compound') {


            } else {

                alert('Not supported yet...');
            }

        } catch (e) {

            console.error(e);
        }
    }

    async setFromTokenAmount() {

        this.fromTokenAmountControl.setValue(this.fromTokenBalance);
    }

    async migrateFromPool() {

    }

    rand(min, max) {

        const argc = arguments.length;

        if (argc === 0) {
            min = 0;
            max = 2147483647;
        } else if (argc === 1) {
            throw new Error('Warning: rand() expects exactly 2 parameters, 1 given');
        }

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    shuffle(o) {
        // @ts-ignore
        // tslint:disable-next-line:radix
        for (let j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x) {
        }
        return o;
    }
}
