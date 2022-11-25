import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {

  isLoading = false;
  private authStatusSub!: Subscription

  constructor(private auth: AuthService) { }

  ngOnInit(): void {
    this.authStatusSub = this.auth.getAuthListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    )
  }
  onSignUp(form: NgForm){
    if(form.invalid){
      return;
    }
    this.auth.createUser(form.value.email, form.value.password);
  }
  ngOnDestroy(): void {
      this.authStatusSub.unsubscribe();
  }

}
