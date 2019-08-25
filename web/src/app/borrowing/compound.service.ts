import {Injectable} from '@angular/core';
import {Web3Service} from '../web3.service';
import {TokenService} from '../token.service';
import {ethers} from 'ethers';
import {BigNumber} from 'ethers/utils';
import {ConfigurationService} from '../configuration.service';

const CERC20ABI = require('../abi/CERC20.json');

@Injectable({
    providedIn: 'root'
})
export class CompoundService {

    tokens = {
        cBAT: {
            symbol: 'cBAT',
            name: 'Compound Basic Attention Token (cBAT)',
            icon: '',
            decimals: 8,
            address: '0x6c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e'
        },
        cDAI: {
            symbol: 'cDAI',
            name: 'Compound Dai (cDAI)',
            icon: '',
            decimals: 8,
            address: '0xf5dce57282a584d2746faf1593d3121fcac444dc'
        },
        cETH: {
            symbol: 'cETH',
            name: 'Compound ETH (cETH)',
            icon: '',
            decimals: 8,
            address: '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5'
        },
        cUSDC: {
            symbol: 'cUSDC',
            name: 'Compound USD Coin (cUSDC)',
            icon: '',
            decimals: 8,
            address: '0x39AA39c021dfbaE8faC545936693aC917d5E7563'
        },
        cREP: {
            symbol: 'cREP',
            name: 'Compound Augur (cREP)',
            icon: '',
            decimals: 8,
            address: '0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1'
        },
        cWBTC: {
            symbol: 'cWBTC',
            name: 'Compound Wrapped BTC',
            icon: '',
            decimals: 8,
            address: '0xc11b1268c1a384e55c48c2391d8d480264a3a7f4'
        },
        cZRX: {
            symbol: 'cZRX',
            name: 'Compound 0x (cZRX)',
            icon: '',
            decimals: 8,
            address: '0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407'
        },
    };

    constructor(
        protected web3Service: Web3Service,
        protected tokenService: TokenService,
        protected configurationService: ConfigurationService
    ) {

    }

    async getBalances(walletAddress) {

        const allTokens = Object.values(this.tokens);

        const promises = allTokens
            .map(token => {

                const contract = new this.web3Service.provider.eth.Contract(
                    CERC20ABI,
                    token.address
                );

                return contract.methods.balanceOfUnderlying(walletAddress).call();
            });

        return (await Promise.all(promises))
            .map((balance, i) => {

                const balanceBN = ethers.utils.bigNumberify(balance);

                const token = Object.assign({}, this.tokenService.tokens[allTokens[i].symbol.substr(1)]);

                if (balanceBN.gt(0)) {

                    token['balance'] = this.tokenService.toFixed(
                        this.tokenService.formatAsset(
                            token.symbol,
                            // @ts-ignore
                            balanceBN
                        ),
                        5
                    );
                } else {

                    token['balance'] = '0';
                }

                token['rawBalance'] = balance;

                return token;
            });
    }

    async getBorrowedBalances(walletAddress) {

        const allTokens = Object.values(this.tokens);

        const promises = allTokens
            .map(token => {

                const contract = new this.web3Service.provider.eth.Contract(
                    CERC20ABI,
                    token.address
                );

                return contract.methods.borrowBalanceCurrent(walletAddress).call();
            });

        return (await Promise.all(promises))
            .map((balance, i) => {

                const balanceBN = ethers.utils.bigNumberify(balance);

                const token = Object.assign({}, this.tokenService.tokens[allTokens[i].symbol.substr(1)]);

                if (balanceBN.gt(0)) {

                    token['balance'] = this.tokenService.toFixed(
                        this.tokenService.formatAsset(
                            token.symbol,
                            // @ts-ignore
                            balanceBN
                        ),
                        2);
                } else {

                    token['balance'] = 0;
                }

                token['rawBalance'] = balance;

                return token;
            });
    }

    async lend(tokenSymbol: string, amount: BigNumber) {

        tokenSymbol = 'c' + tokenSymbol;

        const contract = new this.web3Service.txProvider.eth.Contract(
            CERC20ABI,
            this.tokenService.tokens[tokenSymbol].address
        );

        if (tokenSymbol !== 'cETH') {

            if (
                (await contract.methods.allowance(
                    this.web3Service.walletAddress,
                    this.tokenService.tokens[tokenSymbol].address
                ).call()).eq(0)
            ) {

                await contract.methods.approve(
                    this.tokenService.tokens[tokenSymbol].address,
                    ethers.utils.bigNumberify(2).pow(255)
                ).send({
                    from: this.web3Service.walletAddress,
                    gasPrice: this.configurationService.fastGasPrice
                });
            }

            return contract.methods.mint(
                amount
            )
                .send({
                    from: this.web3Service.walletAddress,
                    gasPrice: this.configurationService.fastGasPrice
                });
        } else {

            console.log('contract.methods', contract.methods);
            return contract.methods.mint()
                .send({
                    value: amount,
                    from: this.web3Service.walletAddress,
                    gasPrice: this.configurationService.fastGasPrice
                });
        }
    }
}
