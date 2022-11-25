import { Component, OnInit } from '@angular/core';
import { Posts } from './interfaces/Posts';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'mean-app';
  posts: Posts[] = [];
  onAddedPost(post: Posts){
    this.posts.push(post);
    console.log(this.posts);
  }
  constructor(private auth: AuthService) {}
  ngOnInit(): void {
      this.auth.autoAuthUser();
  }
}
