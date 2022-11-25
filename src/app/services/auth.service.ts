import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthData } from '../interfaces/authData';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private userId! : string;
  private isAuth = false;
  private token!: string;
  private tokenTimer!: any;
  private authStatus = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router) { }

  getToken() {
    return this.token;
  }
  getAuthListener() {
    return this.authStatus.asObservable();
  }
  getAuthStatus(){
    return this.isAuth;
  }

  createUser(email: string, password: string) {
    const authData: AuthData = {
      email: email,
      password: password
    }
    this.http.post("http://localhost:3000/api/user/signup", authData).subscribe(()=>{
      this.router.navigate(['/']);
    }, error => {
      this.authStatus.next(false)
    });
      
  }

  loginUser(email: string, password: string) {
    const authData: AuthData = {
      email: email,
      password: password
    }
    this.http.post<{ token: string, expiresIn: number, userId: string }>("http://localhost:3000/api/user/login", authData)
      .subscribe(data => {
        const token = data.token;
        this.token = token;
        this.userId = data.userId;
        if (token) {
          const expire = data.expiresIn;
          this.setAuthTimer(expire);
          console.log(expire);
          this.tokenTimer = setTimeout(() => {
            this.logOut();
          }, expire*1000)
          this.isAuth = true;
          this.authStatus.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expire*1000);
          this.saveAuthData(token, expirationDate, this.userId);
          this.router.navigate(['/']);
        }

      }, error => {
        this.authStatus.next(false);
      })
    }

  getUserId(){
    return this.userId;
  }

  private setAuthTimer(duration: number){
    this.tokenTimer = setTimeout(() => {
      this.logOut();
    }, duration * 1000)
  }

  autoAuthUser(){
    const info = this.getAuthData();
    if(!info){
      return;
    }
    const now = new Date();
    const expire = info?.expiry?.getTime()! - now.getTime();
    if(expire>0){
      this.token = info?.token!;
      this.isAuth = true;
      this.userId = info.userId!;
      this.setAuthTimer(expire/1000);
      this.authStatus.next(true);
    }
  }


  private getAuthData(){
    const token = localStorage.getItem('token');
    const exp = localStorage.getItem('expirationDate');
    const id = localStorage.getItem('UserId');
    if(!token || !exp){
      return;
    }
    return {
      token: token,
      expiry: new Date(exp),
      userId: id
    }
  }

  logOut(){
    clearTimeout(this.tokenTimer);
    this.token = "";
    this.isAuth = false;
    this.authStatus.next(false);
    this.userId = "";
    this.removeAuthData();
    this.router.navigate(['/']);
  }


  private saveAuthData(token: string, expirationDate: Date, userId: string){
    localStorage.setItem('token', token);
    localStorage.setItem('expirationDate', expirationDate.toISOString());
    localStorage.setItem("UserId",userId);
  }

  private removeAuthData(){
    localStorage.removeItem('token');
    localStorage.removeItem('expirationDate');
    localStorage.removeItem('UserId');
  }

}
