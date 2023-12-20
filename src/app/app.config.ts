import {ApplicationConfig, importProvidersFrom} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {environment} from "../objects/enviroment";
// @ts-ignore
import firebase from "firebase/compat";
import initializeApp = firebase.initializeApp;

// export const appConfig: ApplicationConfig = {
  // providers: [provideRouter(routes),
  //   importProvidersFrom([
  //     provideFirebaseApp(() => initializeApp(environment.firebase)),
  //     provideFirestore(() => getFirestore()),
  //   ])]
// };
