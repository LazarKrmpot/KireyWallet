import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, Role, RegisterPostData } from '../models/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #baseUrl = 'http://localhost:3000/users';
  #router = inject(Router);
  #http = inject(HttpClient);

  #userSubject = new BehaviorSubject<User | null>(this.#getUserFromStorage());
  public user$ = this.#userSubject.asObservable();

  checkEmailExists(email: string): Observable<boolean> {
    return this.#http.get<User[]>(`${this.#baseUrl}?email=${email}`).pipe(
      map((users) => {
        return users.length > 0;
      })
    );
  }

  #getUserFromStorage(): User | null {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }

  getUsers(): Observable<User[]> {
    return this.#http.get<User[]>(this.#baseUrl);
  }

  getUser(): User {
    const user = this.#userSubject.value;
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  login(email: string, password: string): Observable<User[]> {
    return this.#http
      .get<User[]>(`${this.#baseUrl}?email=${email}&password=${password}`)
      .pipe(
        tap((users) => {
          if (users.length > 0) {
            const user = users[0];
            localStorage.setItem('user', JSON.stringify(user));
            this.#userSubject.next(user);

            if (user.role === Role.ADMIN) {
              this.#router.navigateByUrl('/admin');
            } else {
              this.#router.navigateByUrl('/app');
            }
          }
        })
      );
  }

  registerUser(postData: RegisterPostData) {
    return this.#http.post(`${this.#baseUrl}`, postData);
  }

  logout(): void {
    localStorage.removeItem('user');
    this.#userSubject.next(null);
    this.#router.navigateByUrl('/auth/login');
  }

  updateAccountAmount(userId: string, newAmount: number): Observable<User> {
    const user = this.getUser();
    user.accountAmount = newAmount;

    return this.#http.put<User>(`${this.#baseUrl}/${userId}`, user).pipe(
      tap((updatedUser) => {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        this.#userSubject.next(updatedUser);
      })
    );
  }

  updateUser(userId: string, updatedUser: User): Observable<User> {
    return this.#http.put<User>(`${this.#baseUrl}/${userId}`, updatedUser).pipe(
      tap((user) => {
        if (this.#userSubject.value?.id === user.id) {
          localStorage.setItem('user', JSON.stringify(user));
          this.#userSubject.next(user);
        }
      })
    );
  }

  deleteUser(userId: string): Observable<void> {
    return this.#http.delete<void>(`${this.#baseUrl}/${userId}`).pipe(
      tap(() => {
        const currentUser = this.#userSubject.value;
        if (currentUser && currentUser.id === userId) {
          this.logout();
        }
      })
    );
  }
}
