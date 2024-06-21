import { Component, OnInit } from '@angular/core';
import { collection, addDoc, updateDoc, getDoc, doc, Firestore, deleteDoc } from '@angular/fire/firestore';
import { Storage, StorageError, UploadTaskSnapshot, getDownloadURL, ref, uploadBytesResumable, deleteObject } from '@angular/fire/storage';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-cliente-edit',
  templateUrl: './cliente-edit.page.html',
  styleUrls: ['./cliente-edit.page.scss'],
})
export class ClienteEditPage implements OnInit {
  id: any;  //atributo que recibe el id del reg. desde la ruta
  cliente: any = {};
  isNew: boolean = false;
  avatar: string = '';

  constructor(
    private readonly firestore: Firestore,
    private route: ActivatedRoute,
    private router: Router,
    private storage: Storage
  ) { }

  //metodo de la interfaz OnInit
  ngOnInit() {
    this.route.params.subscribe((params: any) => {
      this.id = params.id;
      if (params.id == 'new') {
        this.isNew = true;
      } else {
        this.obtenerCliente(this.id);
      }
    });
  }

  incluirCliente = () => {
    let clientesRef = collection(this.firestore, "mantenimiento_seguro");

    addDoc(clientesRef, {
      nombre_apellido: this.cliente.nombre_apellido,
      fecha_nacimiento: new Date(this.cliente.fecha_nacimiento),
      bien_asegurado: this.cliente.bien_asegurado,
      monto_asegurado: Number(this.cliente.monto_asegurado),
    }).then(doc => {
      console.log("Registro Incluido");
      this.router.navigate(['/cliente-list']);
    }).catch(error => {

    });
  }

  editarCliente = () => {
    console.log("Aqui editar en firebase");
    const document = doc(this.firestore, "mantenimiento_seguro", this.id);

    updateDoc(document, {
      nombre_apellido: this.cliente.nombre_apellido,
      fecha_nacimiento: new Date(this.cliente.fecha_nacimiento),
      bien_asegurado: this.cliente.bien_asegurado,
      monto_asegurado: Number(this.cliente.monto_asegurado),
    }).then(doc => {
      console.log("Registro Editado");
      this.router.navigate(['/cliente-list']);
    }).catch(error => {
      console.log("Error al editar el cliente");
    });

  }

  obtenerCliente = (id: string) => {
    const document = doc(this.firestore, "mantenimiento_seguro", id);
    getDoc(document).then(doc => {

      console.log("Registro a editar", doc.data());

      if (doc.data()) {
        this.cliente = doc.data();
        this.cliente.fecha_nacimiento = this.cliente.fecha_nacimiento.toDate().toISOString().substring(0, 10) + "";
        if(this.cliente.avatar){
          this.obtenerAvatarCliente();
        }
      } else {
        this.cliente = {};
      }
    });
  }

  guardarCliente = () => {
    if (this.isNew) {
      this.incluirCliente();
    } else {
      this.editarCliente();
    }
  }

  eliminarCliente = () => {
    console.log("Aqui editar en firebase");
    const document = doc(this.firestore, "mantenimiento_seguro", this.id);

    deleteDoc(document).then(doc => {
      console.log("Registro Eliminado");
      this.router.navigate(['/cliente-list']);
    }).catch(error => {
      console.log("Error al eliminar el cliente");
    });

  }

  uploadFile = (input: HTMLInputElement) => {
    if (!input.files) return
    const files: FileList = input.files;

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file) {
        console.log(file, file.name);
        const storageRef = ref(this.storage, `avatars/cliente/${this.id}`);
        uploadBytesResumable(storageRef, file).on(
          'state_changed',
          this.onUploadChange,
          this.onUploadError,
          this.onUploadComplete,
        );
      }
    }
  }

  onUploadChange = (response: UploadTaskSnapshot) => {
    console.log('onUploadChange', response);
  }

  onUploadError = (error: StorageError) => {
    console.log('onUploadError', error);
  }

  onUploadComplete = () => {
    console.log('upload completo');
    this.editarAvatar();
    this.obtenerAvatarCliente();
  }

  editarAvatar = () => {
    const document = doc(this.firestore, "mantenimiento_seguro", this.id);
    updateDoc(document, {
      avatar: 'avatars/cliente/' + this.id
    }).then(doc => {
      console.log("Avatar Editado");
    });
  }

  obtenerAvatarCliente = () => {
    const storageRef = ref(this.storage, `avatars/cliente/${this.id}`);
    getDownloadURL(storageRef).then(doc => {
      this.avatar = doc;
    });
  }

  eliminarAvatar = () => {
    const storageRef = ref(this.storage, `avatars/cliente/${this.id}`);
    deleteObject(storageRef).then(() => {
      console.log('Avatar eliminado del almacenamiento');

      const document = doc(this.firestore, "mantenimiento_seguro", this.id);
      updateDoc(document, {
        avatar: ''
      }).then(() => {
        console.log('Avatar eliminado del documento');
        this.avatar = '';
      }).catch(error => {
        console.error('Error al actualizar el documento: ', error);
      });
    }).catch(error => {
      console.error('Error al eliminar el avatar del almacenamiento: ', error);
    });
  }

}
