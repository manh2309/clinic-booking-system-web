import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-layout">
      <div class="auth-layout__background">
        <div class="auth-layout__overlay"></div>
      </div>
      <div class="auth-layout__container">
        <div class="auth-layout__brand">
          <div class="brand-logo">
            <span class="brand-icon">🏥</span>
          </div>
          <h1 class="brand-name">Clinic Booking</h1>
          <p class="brand-tagline">Hệ thống đặt lịch khám bệnh trực tuyến</p>
        </div>
        <div class="auth-layout__card">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      background: linear-gradient(135deg, #1565c0 0%, #0d47a1 40%, #00838f 100%);
    }

    .auth-layout__background {
      position: fixed;
      inset: 0;
      background: linear-gradient(135deg, #1565c0 0%, #0d47a1 40%, #00838f 100%);
      z-index: 0;
    }

    .auth-layout__overlay {
      position: absolute;
      inset: 0;
      background-image:
        radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 40%);
    }

    .auth-layout__container {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 460px;
      padding: 24px 16px;
      gap: 24px;
    }

    .auth-layout__brand {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      text-align: center;
    }

    .brand-logo {
      width: 64px;
      height: 64px;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255,255,255,0.2);
    }

    .brand-icon {
      font-size: 32px;
    }

    .brand-name {
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.5px;
    }

    .brand-tagline {
      color: rgba(255, 255, 255, 0.75);
      font-size: 14px;
      margin: 0;
    }

    .auth-layout__card {
      width: 100%;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
      overflow: hidden;
    }
  `],
})
export class AuthLayoutComponent {}
