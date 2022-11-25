import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router, TitleStrategy } from '@angular/router';
import { Observable, Subject, map } from 'rxjs';
import { Posts } from '../interfaces/Posts';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private posts: Posts[] = [];
  private postsUpdated = new Subject<{ posts: Posts[], postCount: number }>();

  constructor(private http: HttpClient, private router: Router) { }
  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`
    this.http.get<{ message: string, posts: any, maxPosts: number }>("http://localhost:3000/api/posts" + queryParams)
      .pipe(map(postData => {
        return {
          posts: postData.posts.map((post: any) => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              userId: post.creator
            }
          }), maxPosts: postData.maxPosts
        }
      }))
      .subscribe((transformedPostData) => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostData.maxPosts
        });
      });
  }
  getUpdatedPostsListner() {
    return this.postsUpdated.asObservable();
  }

  addPost(post: Posts, image: File) {
    const postData = new FormData();
    postData.append("title", post.title as string);
    postData.append("content", post.content as string);
    postData.append("image", image, post.title)
    this.http.post<{ message: string, poster: Posts }>("http://localhost:3000/api/posts", postData)
      .subscribe((data) => {

        this.router.navigate(["/"]);
      })
  }
  getPost(id: string) {
    return this.http.get<Posts>("http://localhost:3000/api/posts/" + id);
  }

  deletePost(postId?: string) {
    return this.http.delete("http://localhost:3000/api/posts/" + postId)

  }
  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Posts | FormData;
    if (typeof (image) === 'object') {
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
    } else {
      postData = { id: id, title: title, content: content, imagePath: image, userId: "" }
    }
    this.http.put("http://localhost:3000/api/posts/" + id, postData)
      .subscribe(response => {
        this.router.navigate(["/"]);
      });
      this.router.navigate(["/"]);
  }

}
