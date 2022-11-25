import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { Posts } from 'src/app/interfaces/Posts';
import { AuthService } from 'src/app/services/auth.service';
import { PostService } from 'src/app/services/post.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {

  sentPosts: Posts[] = [];
  private PostsSub !: Subscription;
  private authSub! : Subscription;
  totalLength = 0;
  userId! : string;
  postSize = 2;
  currentPage = 1;
  pageOption = [1, 2, 5, 10];
  isAuth = false;

  // posts = [
  //   {title: "First Post", content: "This is the first coded content"},
  //   {title: "Second post", content: "This is the second coded content"},
  //   {title: "Third Post", content: "This is the third coded content"}
  // ];

  constructor(private post: PostService, private auth: AuthService) { }

  ngOnInit(): void {
    this.post.getPosts(this.postSize, this.currentPage);
    this.userId = this.auth.getUserId();
    this.PostsSub = this.post.getUpdatedPostsListner().subscribe((data: {posts: Posts[], postCount: number}) => {
      this.sentPosts = data.posts;
      console.log(this.sentPosts[0])
      this.totalLength = data.postCount;
    });
    this.isAuth = this.auth.getAuthStatus();
    this.authSub = this.auth.getAuthListener().subscribe(result => {
      this.userId = this.auth.getUserId();
      this.isAuth = result;
    });
  }

  ngOnDestroy() {
    this.PostsSub.unsubscribe();
    this.authSub.unsubscribe();
  }
  onDelete(id?: string){
    this.post.deletePost(id).subscribe(() => {
      this.post.getPosts(this.postSize, this.currentPage)
    });
  }
  onChangePage(event: PageEvent){
    this.currentPage = event.pageIndex + 1;
    this.postSize = event.pageSize;
    this.post.getPosts(this.postSize, this.currentPage);
  }
}
