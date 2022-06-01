import { MatSnackBar } from "@angular/material/snack-bar";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { User } from "../model/user";
import { Injectable } from "@angular/core";
import { Apollo, gql } from 'apollo-angular';
import { catchError } from "rxjs/operators";
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  private READ_QUERY: string;
  private READ_BY_ID_QUERY: string;
  private CREATE_QUERY: string;
  private UPDATE_QUERY: string;
  private DELETE_QUERY: string;

  constructor(private snackBar: MatSnackBar, private http: HttpClient, private apollo: Apollo) {
  }

  async getUserQuery(): Promise<void> {
    this.READ_QUERY = await this.http.get('assets/graphql/user/read.graphql', {responseType: 'text'}).toPromise();
  }

  async getUserByIdQuery(): Promise<void> {
    this.READ_BY_ID_QUERY = await this.http.get('assets/graphql/user/readById.graphql', {responseType: 'text'}).toPromise();
  }

  async createUserQuery(): Promise<void> {
    this.CREATE_QUERY = await this.http.get('assets/graphql/user/create.graphql', {responseType: 'text'}).toPromise();
  }

  async updateQuery(): Promise<void> {
    this.UPDATE_QUERY = await this.http.get('assets/graphql/user/update.graphql', {responseType: 'text'}).toPromise();
  }

  async deleteQuery(): Promise<void> {
    this.DELETE_QUERY = await this.http.get('assets/graphql/user/delete.graphql', {responseType: 'text'}).toPromise();
  }

  showMessage(msg: string):void {
    this.snackBar.open(msg,'X', {duration:3000, horizontalPosition:"right", verticalPosition:"top"});
  }

  async create(user: User): Promise<User> {
    if(!this.CREATE_QUERY)
      await this.createUserQuery();

    const result = await this.apollo.mutate<any>({
      mutation: gql`${this.CREATE_QUERY}`,
      variables: {email: user.email, name: user.name, password: user.password}
    }).pipe(catchError(e => {
      this.showMessage(`Erro: ${e}`);
      return of<any>();
    })).toPromise();

    return result ? result.data.addUser : null;
  }

  async update(user: User): Promise<User> {
    if(!this.UPDATE_QUERY)
      await this.updateQuery();

    const result = await this.apollo.mutate<any>({
      mutation: gql`${this.UPDATE_QUERY}`,
      variables: {id: user.id, email: user.email, name: user.name, password: user.password}
    }).pipe(catchError(e => {
      this.showMessage(`Erro: ${e}`);
      return of<any>();
    })).toPromise();

    return result ? result.data.updateUser : null;
  }

  async delete(user: User): Promise<boolean> {
    if(!this.DELETE_QUERY)
      await this.deleteQuery();

    const result = await this.apollo.mutate<any>({
      mutation: gql`${this.DELETE_QUERY}`,
      variables: {id: user.id}
    }).pipe(catchError(e => {
      this.showMessage(`Erro: ${e}`);
      return of<any>();
    })).toPromise();

    return result ? result.data.delUser : null;
  }

  async read(): Promise<User[]> {
    if(!this.READ_QUERY)
      await this.getUserQuery();

    const result = await this.apollo.query<any>({
      query: gql`${this.READ_QUERY}`,
      fetchPolicy: "no-cache",
    }).pipe(catchError(e => {
      this.showMessage(`Erro: ${e}`);
      return of<any>();
    })).toPromise();

    return result ? result.data.users : [];
  }

  async readById(id: number): Promise<User> {
    if(!this.READ_BY_ID_QUERY)
      await this.getUserByIdQuery();

    const result = await this.apollo.query<any>({
      query: gql`${this.READ_QUERY}`,
      variables: {id: id},
      fetchPolicy: "no-cache",
    }).pipe(catchError(e => {
      this.showMessage(`Erro: ${e}`);
      return of<any>();
    })).toPromise();

    return result ? result.data.user : null;
  }

}
