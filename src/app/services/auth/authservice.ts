import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: number;
  email: string;
  role: string;
  participantId: number | null;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface ApiError {
  message: string;
  status?: number;
  error?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private http: HttpClient, private router: Router) {
    const user = this.getUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<User | null>(user);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticated(): boolean {
    return !!this.currentUserValue && !!this.getToken();
  }

  public get isAdmin(): boolean {
    return this.currentUserValue?.role === 'admin';
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  private saveUserToStorage(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const url = `${this.apiUrl}/auth/login`;
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(url, { email, password })
    );
    
    this.saveToken(response.access_token);
    this.saveUserToStorage(response.user);
    return response;
  }

  async register(email: string, password: string): Promise<LoginResponse> {
    const url = `${this.apiUrl}/auth/register`;
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(url, { email, password })
    );
    
    this.saveToken(response.access_token);
    this.saveUserToStorage(response.user);
    return response;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth']);
  }

}
