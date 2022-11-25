import { Component, OnInit, OnDestroy } from '@angular/core';
import { Form, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  isLoading = false;
  private authStatusSub!: Subscription
  constructor(private loginService: AuthService) { }

  ngOnInit(): void {
    this.authStatusSub = this.loginService.getAuthListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    )
  }
  onLogin(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.loginService.loginUser(form.value.email, form.value.password)
  }
  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }

}
