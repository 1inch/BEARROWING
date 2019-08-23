import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ethers} from 'ethers';

@Injectable({
    providedIn: 'root'
})
export class ConfigurationService {

    public AGGREGATED_TOKEN_SWAP_ENS = '1xProtocol.eth';
    public INFURA_KEY = '6705b777fb0b453ca5d6e33b2da3b6a9';

    public GAS_PRICE_URL = 'https://gasprice.poa.network';

    public fastGasPrice;
    public standardGasPrice;
    public instantGasPrice;

    constructor(
        private http: HttpClient
    ) {

        this.getGasPrices();
    }

    async getGasPrices() {

        const result = await this.http.get(this.GAS_PRICE_URL).toPromise();

        this.fastGasPrice = ethers.utils.bigNumberify(Math.trunc(result['fast'] * 100)).mul(1e7);
        this.standardGasPrice = ethers.utils.bigNumberify(Math.trunc(result['standard'] * 100)).mul(1e7);
        this.instantGasPrice = ethers.utils.bigNumberify(Math.trunc(result['instant'] * 100)).mul(1e7);
    }
}
