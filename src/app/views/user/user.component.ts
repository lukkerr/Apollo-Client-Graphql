import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { User } from "../../model/user";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-usuario',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  filterFields: string[] = ['Id', 'Nome', 'E-mail'];
  filterField: string = '';
  filterUsers: User[] = [];
  users: User[] = [];
  flagShowPopup = false;
  flagShowConfirm = false;
  displayedColumns: string[] = ['id', 'name', 'email'];
  user: User = null;
  eraseUserValues: User = {
    name:'',
    email: '',
    password:''
  };
  loaded: boolean = false;
  popUpMode = null;

  constructor(private userService: UserService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.initAsync();
  }

  async initAsync() {
    this.getUsers();
    this.loaded = true;
  }

  showPopUp(mode: String, user: User): void {
    this.flagShowPopup = !this.flagShowPopup;
    if(!this.flagShowPopup)
      this.flagShowConfirm = false;

    this.popUpMode = mode;
    this.user = <User> JSON.parse( JSON.stringify(user) );
  }

  async getUsers() {
    this.userService.read().then((users: User[]) => {
      this.users = users;
      this.filterUsers = users;
    });
  }

  saveUser(buttonSalvar: MatButton, buttonCancelar: MatButton):void{
    if(this.user.name.trim() !== '' &&
      this.user.password.trim() !== '' &&
      this.user.email.trim() !== '') {

      this.user.name = this.user.name.trim();
      this.user.password = this.user.password.trim();
      this.user.email = this.user.email.trim();

      buttonSalvar.disabled = true;
      buttonCancelar.disabled = true;

      if(this.user.id) {
        this.userService.update(this.user).then((user) => {
          if(user) {
            this.userService.showMessage("Usuário Atualizado!");
            this.getUsers();
            this.showPopUp(null, this.eraseUserValues);
          } else {
            this.showPopUp(null, this.eraseUserValues);
          }
        });
      } else {
        this.userService.create(this.user).then((user) => {
          if(user) {
            this.userService.showMessage("Usuário Cadastrado!");
            this.getUsers();
            this.showPopUp(null, this.eraseUserValues);
          } else {
            this.showPopUp(null, this.eraseUserValues);
          }
        });
      }
    } else {
      this.userService.showMessage("Preencha todos os campos!");
    }
  }

  eraseUser(): void {
    this.userService.delete(this.user).then((isDeleted)=>{
      if(isDeleted) {
        this.userService.showMessage("Usuário Removido!");
        this.getUsers();
        this.showPopUp(null, this.eraseUserValues);
      } else if(isDeleted === false) {
        this.userService.showMessage("Usuário já removido anteriormente!");
        this.getUsers();
        this.showPopUp(null, this.eraseUserValues);
      } else {
        this.showPopUp(null, this.eraseUserValues);
      }
    });
  }

  openConfirm(): void {
    this.flagShowConfirm = true;
  }

  closeConfirm(): void {
    this.flagShowConfirm = false;
  }

  search(input: HTMLInputElement) {
    const searchText = input.value;
    this.filterUsers = this.users.filter(user => {

      return Object.keys(user).filter(key => {
        if(user[key] != undefined) {
          const validText = user[key].toString().toLowerCase().includes(searchText.toLowerCase());
          return validText && this.filterField === key || validText && this.filterField === "";
        } else {
          return false;
        }
      }).length > 0;

    });
  }

  clickPoUp(event: Event, popUp: HTMLDivElement) {
    if(event.target === popUp) {
      this.showPopUp(null, this.eraseUserValues);
    }
  }

  clickConfirm(event: Event, popUp: HTMLDivElement) {
    if(event.target === popUp) {
      this.closeConfirm();
    }
  }

}
