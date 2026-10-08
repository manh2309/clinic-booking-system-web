import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { STORAGE_KEYS } from '../constants/app.constants';

/**
 * StorageService — wrapper cho localStorage.
 * Tập trung logic đọc/ghi để dễ thay đổi nếu cần dùng sessionStorage.
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  getToken(): string | null {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token || token === 'undefined' || token === 'null') {
      return null;
    }
    return token;
  }

  setToken(token: string | null | undefined): void {
    if (!token || token === 'undefined' || token === 'null') {
      this.removeToken();
      return;
    }
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  removeToken(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  getUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  setUser(user: User | null | undefined): void {
    if (!user) {
      this.removeUser();
      return;
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  removeUser(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  /** Xóa toàn bộ thông tin đăng nhập */
  clearAll(): void {
    this.removeToken();
    this.removeUser();
  }
}
