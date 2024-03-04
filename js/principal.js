const file = './data/productos.json';
const contenedorProductos = document.getElementById('contenedor');
const header = document.getElementById('header');
const body = document.querySelector('body');
const productosCompra = document.getElementById('productosCompra');
const total = document.getElementById('total');
const deseaFinalizar = document.createElement('button');
deseaFinalizar.id = "finalizar";
contenedorCompra.appendChild(deseaFinalizar);

let productos = [];
// Variable con la lista de los productos a comprar
let lista = []; 

// Funciones para almacenar y traer los datos que se almacenan --> (llave = nombre de la "base de datos" donde vamos a almacenar los datos )
function guardarLS(llave, valor_a_guardar) {
    // setItem me permite guardar la info x medio de una llave / convertimos a JSON el valor a guardar
    localStorage.setItem(llave, JSON.stringify(valor_a_guardar)); 
}
function obtenerLS(llave) {
    // Llamamos estos datos (parseo para pasarlo de JSON a js) / por medio de localStorage llamamos a toda la info asociada en llave
    const datos = JSON.parse(localStorage.getItem(llave)); 
    return datos;
}

cargaEventos();

function cargaEventos(){ 
    // Cargamos en una función todos los eventos

    // Cuando se cargue el contenido del html llama al evento
    document.addEventListener('DOMContentLoaded', async () => {
        // Espera a que los productos se carguen antes de llamar a recorrerProductos
        await renderizarProductos(); 
        lista = JSON.parse(localStorage.getItem('productos')) || [];
    });
    // Cuando detectecta scroll en la pantalla, ingresa a la función
    window.addEventListener("scroll", function(){
       // Si scroll es mayor a 10px
       if(contenedorProductos.getBoundingClientRect().top<10){ 
        // Se añade la clase scroll 
        header.classList.add("scroll");
        }
       // Sino eliminar clase .scroll
       else{
        header.classList.remove("scroll");
        }
    });
    carrito.addEventListener("click", () => {
        // Body oculta el overflow - no puede hacer scroll en el sitio
        body.style.overflow = "hidden"; 
        // Removemos la clase none que hace que no se visualice ningun elemento
        contenedorCompra.classList.remove('none'); 
        // Le agregamos estilos 
        contenedorCompra.classList.add('contenedorCompra'); 
        informacionCompra.classList.add('informacionCompra'); 
        deseaFinalizar.textContent = "Finalizar Compra";
        mostrarLista(); 
    });
    // Revertimos todos los estilos que agregamos al contenedor del carrito
    x.addEventListener("click", () =>{ 
        // Body vuelve a tener el scroll solo si es necesario
        body.style.overflow = "auto"; 
        contenedorCompra.classList.add('none');
        contenedorCompra.classList.remove('contenedorCompra');
        informacionCompra.classList.remove('informacionCompra');
    })
    deseaFinalizar.addEventListener("click", () => {
        Swal.fire({
          title: '¿Estás seguro que deseas finalizar tu compra?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#4D5E6F',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Finalizar Compra'
        }).then((result) => { 
          if (result.isConfirmed) { //si desea finalizar la compra
            Swal.fire(
              'Compra finalizada!',
              'Nos estaremos comunicando en breve para enviar el pedido. Muchas Gracias.',
              'success'
            ).then(() => {
              // Eliminamos el carrito de compras
              lista = [];
              guardarLS('productos', productos);
              numero.innerHTML = lista.length;
              numero.classList.remove('diseñoNumero');
              recorrerProductos();
              mostrarLista();
            });
          }
       });
    });      
}

async function realizarPeticion(datos) { 
    try {
        const response = await fetch(datos);

        // Comprobar si la respuesta es exitosa (código de estado HTTP en el rango 200-299)
        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
        }

        // Si la respuesta es exitosa, obtener los datos en formato JSON
        const data = await response.json();

        // Retorna los datos obtenidos
        return data;
    } catch (error) {
        // Capturamos cualquier error durante la petición 
        console.error(error);
    } finally {
        // Finaliza la petición 
        console.log('Petición finalizada.');
    }
}

//Función que se encarga de llamar a la función realizarPeticion(datos) para obtener los productos
async function renderizarProductos() {
    productos = await realizarPeticion(file);
    recorrerProductos();
}

function recorrerProductos() {
    // Limpiamos el contenedor para que no se dupliquen los productos si se llama + de 1 vez
    contenedor.innerHTML = "" 
    for (let i = 0; i < productos.length; i++) { 
        // Si hay stock se  puede comprar
        productos[i].stock > 0 ? contenedor.innerHTML += `<div><img src="./img/${productos[i].img}"><div class="informacion"><p>INOX Clásico - ${productos[i].nombre}</p><p class="precio">$${productos[i].precio}</p><button onclick=comprar(${i})>Comprar</button></div></div>`
                               : contenedor.innerHTML += `<div><img src="./img/${productos[i].img}"><div class="informacion"><p>INOX Clásico - ${productos[i].nombre}</p><p class="precio">$${productos[i].precio}</p><p class="sinStock">Sin Stock</p></div></div>`
    }
}

function comprar(indice) {
    // Añade en lista[] y devuelve la nueva longitud del array
    lista.push({ nombre: productos[indice].nombre, precio: productos[indice].precio });
    // van -> Encargada de entrar al ciclo / let -> Recorre los indices de los productos
    let van = true; 
    let i = 0; 
    while (van == true) { 
        // Si producto es igual a nombre de producto que voy a agregar
        if (productos[i].nombre == productos[indice].nombre) { 
            // Restamos 1 en stock
            productos[i].stock --; 
            // Si el articulo esta sin stock
            if (productos[i].stock == 0) { 
                // Le actualiza los productos al cliente 
                recorrerProductos(); 
            }
            // Sale del ciclo while
            van = false; 
        }
        // Le pasamos la llave y la info actualizada de productos
        guardarLS("productos", productos); 
        i++; 
    }
    numero.innerHTML = lista.length;
    numero.classList.add("diseñoNumero");
    return lista;
}

function mostrarLista(){
    // Inicialmente vacio
    productosCompra.innerHTML = "";
    valortotal = 0;
    // Recorre todos los productos que se añaden en lista
    for (let i = 0; i < lista.length; i++){
        productosCompra.innerHTML += `<div><div class="img"><button onclick=eliminar(${i}) class="botonTrash"><img src="img/trash.png"></button><p>${lista[i].nombre}</p></div><p> $${lista[i].precio}</p></div>`
        valortotal += parseInt(lista[i].precio); // a valortotal le asignamos la suma del precio del producto dentro de la lista
    }
    total.innerHTML = `<p>Valor Total: </p><p><span>$${valortotal}</span></p>`
}

function eliminar(indice) {
    Swal.fire({
      title: 'Eliminar Producto',
      text: '¿Estás seguro que deseas eliminar este producto del carrito?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      // Si eliminar es confirmado
      if (result.isConfirmed) { 
        let van = true;
        let i = 0;
        while (van == true) {
          if (productos[i].nombre == lista[indice].nombre) {
            // Incrementa el stock si se elimina un producto del carrito
            productos[i].stock++; 
            // Elimina el producto del carrito
            lista.splice(indice, 1); 
            // Sale del ciclo while
            van = false; 
          }
          i++;
        }
        guardarLS('productos', productos);
        // Actualizamos cantidad del carrito icon que muestra numero de productos
        numero.innerHTML = lista.length;
        // Si no hay productos, elimina el circulo que indica cuantos elementos hay en nuestra lista[]
        if (lista.length === 0) {
          numero.classList.remove('diseñoNumero');
        }
        // Recorre nuevamente los productos y actualiza
        recorrerProductos();
        // Recorre los elementos en lista y los actualiza 
        mostrarLista();
      }
   });
}
