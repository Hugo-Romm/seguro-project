import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Mantenimiento de clientes asegurados', url: '/cliente-list', icon: 'person' },
  ];
  public labels = [];
  constructor() {}
}
