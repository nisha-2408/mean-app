import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private authListens! : Subscription;
  userAuth = false;

  constructor(private auth: AuthService) { }

  ngOnInit(): void {
    this.userAuth = this.auth.getAuthStatus();
    this.authListens = this.auth.getAuthListener().subscribe(result => {
      this.userAuth = result
    });
  }
  ngOnDestroy(): void {
     this.authListens.unsubscribe(); 
  }
  onLogout(){
    this.auth.logOut();
  }

}
