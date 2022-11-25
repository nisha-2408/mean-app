import { formatCurrency } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Posts } from 'src/app/interfaces/Posts';
import { PostService } from 'src/app/services/post.service';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {

  form!: FormGroup
  imagePreview! : string;
  enteredContent = "";
  enteredTitle = "";
  isLoading = false;
  private mode = 'create';
  private postId!: string;
  postss: Posts = {
    id: "",
    title: "",
    content: ""
  };
  @Output() postCreated = new EventEmitter<Posts>();
  constructor(private post: PostService, public route: ActivatedRoute) { }

  ngOnInit(): void {

    this.form = new FormGroup({
      'title': new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      'content': new FormControl(null, {
        validators: [Validators.required]
      }),
      'image': new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      })
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.isLoading = true;
        this.postId = paramMap.get('postId')!;
        this.post.getPost(this.postId).subscribe(data => {
          this.isLoading = false;
          this.postss = data;
          this.form.setValue({
            'title': this.postss.title,
            'content': this.postss.content,
            'image': this.postss.imagePath
          });
        })
      } else {
        this.mode = 'create';
        this.postId = "";
        console.log(this.mode)
      }
    });
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      const post: Posts = { id: '', title: this.form.value.title, content: this.form.value.content, imagePath: null! }
      this.post.addPost(post, this.form.value.image);
    } else {
      this.post.updatePost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image)
    }
    this.form.reset();
  }
  onImagePicked(event: Event){
    const file = (event.target as HTMLInputElement).files![0];
    this.form.patchValue({
      'image': file
    });
    this.form.get('image')?.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview= reader.result as string;
    };
    reader.readAsDataURL(file)
  }

}
