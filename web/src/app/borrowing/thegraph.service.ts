import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ethers} from 'ethers';

@Injectable({
    providedIn: 'root'
})
export class ThegraphService {

    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    constructor(
        private http: HttpClient
    ) {

    }

    async getCollateralisation() {

        try {

            const response = await this.http.post(
                'https://api.thegraph.com/subgraphs/name/graphprotocol/compound',
                {
                    query: '{ user(id: "0x047edaf87b0c40b007b7c17f32aca777c6e57f62") { id assets {supplyPrincipal supplyInterestLastChange totalSupplyInterest supplyInterestIndex borrowPrincipal borrowInterestLastChange totalBorrowInterest borrowInterestIndex} } }'
                },
                this.httpOptions
            )
                .toPromise();

            console.log('response', response);

            const totalSupplyInterest = ethers.utils.bigNumberify(0);
            const totalBorrowInterest = ethers.utils.bigNumberify(0);

            // @ts-ignore
            response.data.user.assets.map(asset => {

                if (asset.totalSupplyInterest !== null) {

                    totalSupplyInterest.add(asset.totalSupplyInterest);
                }

                if (asset.totalBorrowInterest !== null) {

                    totalBorrowInterest.add(asset.totalBorrowInterest);
                }
            });

            return totalSupplyInterest.mul(100).div(totalBorrowInterest);
        } catch (e) {

            console.error(e);
        }
    }
}
