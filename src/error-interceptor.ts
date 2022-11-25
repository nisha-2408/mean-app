import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { AuthService } from "./app/services/auth.service";
import { catchError } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { ErrorComponent } from "./app/components/error/error.component";

@Injectable()

export class ErrorInterceptor implements HttpInterceptor {


    constructor(private auth: AuthService, private dialog: MatDialog) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        

        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                let eMsg = "An unknown error occured!";
                if(error.error.message){
                    eMsg = error.error.message;
                }
                this.dialog.open(ErrorComponent, {data: {message: eMsg}});
                return throwError(error)
            })
        );
    }
}