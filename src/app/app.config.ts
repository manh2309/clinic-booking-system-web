import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Router với tất cả routes và hỗ trợ bind route params vào component input
    provideRouter(routes, withComponentInputBinding()),

    // HttpClient với JWT interceptor
    provideHttpClient(withInterceptors([jwtInterceptor])),

    // Angular Material animations
    provideAnimations(),
  ],
};
