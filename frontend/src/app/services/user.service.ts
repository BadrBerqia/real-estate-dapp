import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id?: number;
  walletAddress: string;
  username?: string;
  email?: string;
  phone?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://136.114.46.221:30081/api/users';

  constructor(private http: HttpClient) {}

  getUser(walletAddress: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${walletAddress}`);
  }

  registerUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  updateUser(walletAddress: string, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${walletAddress}`, user);
  }
}