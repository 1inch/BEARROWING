import {ApplicationRef, Component, Inject, OnInit} from '@angular/core';
import {ThemeService} from './theme.service';
import {SwUpdate} from '@angular/service-worker';
import {DeviceDetectorService} from 'ngx-device-detector';
import {DOCUMENT} from '@angular/common';
import {environment} from '../environments/environment';
import {first} from 'rxjs/operators';
import {concat, interval} from 'rxjs';
import {Web3Service} from './web3.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    constructor(
        web3Service: Web3Service,
        themeService: ThemeService,
        swUpdate: SwUpdate,
        appRef: ApplicationRef,
        private deviceDetectorService: DeviceDetectorService,
        @Inject(DOCUMENT) private document: Document
    ) {

        if ('serviceWorker' in navigator && environment.production) {

            swUpdate.available.subscribe(event => {

                console.log('current version is', event.current);
                console.log('available version is', event.available);

                swUpdate.activateUpdate().then(() => document.location.reload());
            });

            swUpdate.activated.subscribe(event => {
                console.log('old version was', event.previous);
                console.log('new version is', event.current);
            });

            const appIsStable$ = appRef.isStable.pipe(first(isStable => isStable === true));
            const everySixHours$ = interval(6 * 60 * 60 * 1000);
            const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

            everySixHoursOnceAppIsStable$.subscribe(() => swUpdate.checkForUpdate());

            swUpdate.checkForUpdate();
        }

        if (this.deviceDetectorService.isDesktop()) {
            this.document.body.classList.add('twitter-scroll');
        }
    }

    ngOnInit() {


    }
}
