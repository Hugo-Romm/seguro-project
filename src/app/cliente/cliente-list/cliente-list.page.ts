import { Component, OnInit } from '@angular/core';
import { collection, Firestore, doc, deleteDoc, query, limit, getDocs, startAfter, orderBy, where }
  from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { InfiniteScrollCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-cliente-list',
  templateUrl: './cliente-list.page.html',
  styleUrls: ['./cliente-list.page.scss'],
})
export class ClienteListPage implements OnInit {

  isSearch: boolean = false; //para la barra de busqueda
  query = ""; //va contener la búsqueda que el cliente realiza mediante el buscador
  lastVisible: any = null;
  li = 30; //30 porque en resoluciones mas altas no llega a cubrir toda la pantalla y no se activa el scroll infinito
  isDarkMode: boolean = false;

  constructor(private readonly firestore: Firestore, private router: Router) { }


  listaClientes: any[] = [];

  ngOnInit() {
    this.listarClientes();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
  }

  listarClientesSinFiltro = () => {
    const clientesRef = collection(this.firestore, 'mantenimiento_seguro');

    let q = undefined;
    if (this.lastVisible) {
      q = query(clientesRef,
        orderBy('nombre_apellido'),
        limit(this.li),
        startAfter(this.lastVisible));
    } else {
      q = query(clientesRef,
        orderBy('nombre_apellido'),
        limit(this.li));
    }
    const querySnapshot = getDocs(q).then(re => {
      if (!re.empty) {
        this.lastVisible = re.docs[re.docs.length - 1];

        re.forEach(doc => {
          let cliente: any = doc.data();
          cliente.id = doc.id;
          this.listaClientes.push(cliente);
        });
      }
    });
  }

  listarClientes = () => {
    const clientesRef = collection(this.firestore, 'mantenimiento_seguro');

    if ((this.query + "").length > 0) {
      let q = undefined;
      if (this.lastVisible) {
        q = query(clientesRef,
          where("nombre_apellido", ">=", this.query.toUpperCase()),
          where("nombre_apellido", "<=", this.query.toLowerCase() + '\uf8ff'),
          orderBy('nombre_apellido'),
          limit(this.li),
          startAfter(this.lastVisible));

      } else {
        q = query(clientesRef,
          where("nombre_apellido", ">=", this.query.toUpperCase()),
          where("nombre_apellido", "<=", this.query.toLowerCase() + '\uf8ff'),
          orderBy('nombre_apellido'),
          limit(this.li));
      }
      getDocs(q).then(re => {

        if (!re.empty) {
          let nuevoArray = new Array();
          for (let i = 0; i < re.docs.length; i++) {
            const doc: any = re.docs[i].data();
            if (doc.nombre_apellido.toUpperCase().
              startsWith(
                this.query.toUpperCase().charAt(0)
              )) {
              nuevoArray.push(re.docs[i]);

            }
          }
          this.lastVisible = re.docs[nuevoArray.length - 1];
          for (let i = 0; i < nuevoArray.length; i++) {
            const doc: any = nuevoArray[i];
            let cliente: any = doc.data();
            cliente.id = doc.id;
            this.listaClientes.push(cliente);
          }

        }
      });
    } else {
      this.listarClientesSinFiltro();
    }
  }

  eliminarCliente = (id: string) => {
    console.log('Eliminando cliente con ID:', id);
    const documentRef = doc(this.firestore, 'mantenimiento_seguro', id);


    deleteDoc(documentRef)
      .then(() => {
        console.log('Cliente eliminado correctamente');
        this.router.navigate(['/cliente-list']);
      })
      .catch((error) => {
        console.error('Error al eliminar el cliente:', error);
      });
  };

  onIonInfinite(ev: any) {
    this.listarClientes();
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  clickSearch = () => { //Este metodo lo unico que hace es cambiar el valor del atributo isSearch a verdadero
    this.isSearch = true;
  }

  clearSearch = () => {
    this.isSearch = false;
    this.query = "";

    this.listaClientes = new Array();
    this.lastVisible = null;
    this.listarClientes();
  }

  buscarSearch = (e: any) => { // Define una función llamada buscarSearch que toma un argumento (evento) de cualquier tipo
    this.isSearch = false; // Establece la propiedad isSearch del objeto actual (this) a false
    this.query = e.target.value; // Asigna el valor del campo de entrada (input) del evento a la propiedad query del objeto actual

    this.listaClientes = new Array(); // Inicializa la propiedad listaClientes del objeto actual como un nuevo arreglo vacío
    this.lastVisible = null; // Establece la propiedad lastVisible del objeto actual a null
    this.listarClientes(); // Llama al método listarClientes del objeto actual
  }

  formatFecha = (fecha: any) => {
    // Verifica si la fecha es válida
    if (fecha && fecha.toDate) {
      const date = fecha.toDate(); // Convertir objeto de fecha de Firestore a objeto de fecha de JavaScript
      const day = date.getDate();
      const month = date.getMonth() + 1; // Los meses en JavaScript van de 0 a 11
      const year = date.getFullYear();
      return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
    }
    return ""; // Si la fecha no es válida, devuelve una cadena vacía
  }
}
