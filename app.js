//se guardan los id para manipularlos
const cards = document.getElementById('cards')
const items = document.getElementById('items')
const footer = document.getElementById('footer')
const templateCard = document.getElementById('template-card').content
const templateFooter = document.getElementById('template-footer').content
const templateCarrito = document.getElementById('template-carrito').content

//memoria volatil 
const fragment = document.createDocumentFragment()
//variable vacia porque se le empuja la informacion de los cards
let carrito = {} 
//llamammos el escuchador de eventos 
// DOMContent es disparado cuando el elemento html ha sido completamente cargado
document.addEventListener('DOMContentLoaded', e => {
    fetchData()
    //guardar en el local storage, carrito es un key que creamos
    if(localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'))
        pintarCarrito()
    }
})
//Escucha el evento click en todos los elementos html y lo captura en e
document.addEventListener('click', e => addCarrito(e))

items.addEventListener('click', e => btnAccion(e))

//llamar al api
const fetchData = async () => {
    try {
        //me comunico con la api
        const respuesta = await fetch('api.json')
        //traigo y convierto la data en json
        const data = await respuesta.json()
        pintarCards( data )
        //console.log(data)
    } catch (e){
        console.log(e)
    }
}

const pintarCards = data => {
    //recorremos la con Foreach porque es un json
    data.forEach( producto => {
        //Seleccionamos la etiqueta html, seleccionamos contenido = contenido del array 
        templateCard.querySelector( 'h5' ).textContent = producto.title;
        templateCard.querySelector('p').textContent = producto.precio;
        templateCard.querySelector('img').setAttribute("src", producto.thumbnailUrl);
        templateCard.querySelector('.btn-dark').dataset.id = producto.id;
        //clonamos la card 
        const clone = templateCard.cloneNode( true )
        //se pinta con el fragment
        fragment.appendChild( clone )
    });
    cards.appendChild( fragment )
}
// funcion que recive como parametro e que esta capturando el evento click 
// de la funcion event listener
const addCarrito = e => {
    //se verifica por consola como con el click se muestran los elementos html del DOM
    //console.log(e.target)
    //Pregunta ¿ que elemento al que yo doy click tiene la clase btn-dark ? el elemento que 
    //la tenga devuelve true, si no false
    //console.log(e.target.classList.contains('btn-dark'))
    //ahora SI (los elementos que tengan la clase btn-dark) si la tiene 
    if ((e.target.classList.contains('btn-dark'))) {
        //imprima en consola el boton y los elementos que estan con el
        //console.log(e.target.parentElement)
        //ahora se empuja la dara a setCarrito
        setCarrito(e.target.parentElement)
    }
    e.stopPropagation()
}
// llega la data de la card que viene de la funcion addCarrito, se almacena en objeto
const setCarrito = objeto => {
    //console.log(objeto)
    //se arma el objeto con la data que viene de addCarrito
    const producto = {
        //se obtiene el id del boton 
        id: objeto.querySelector('.btn-dark').dataset.id,
        //se obtiene el titulo 
        title: objeto.querySelector('h5').textContent,
        //se obtiene el precio
        precio: objeto.querySelector('p').textContent,
        cantidad: 1
    }
    //si esto existe quiere decir que el producto esta duplicado y necesitamos
    //aumentar la cantidad
    if(carrito.hasOwnProperty(producto.id)) {
        //carrito es la coleccion de objetos
        //estamos accediendo solo a la cantidad y le aumentamos 1
        producto.cantidad = carrito[producto.id].cantidad + 1
    }
    // ... se adquiere una copia del objeto producto y se guarda
    carrito[producto.id] = {...producto}
    //console.log(carrito)
    //llamo a la funcion pintarCarrito que se ejecuta esta lista la informacion
    pintarCarrito()
}

const pintarCarrito = () => {
    //console.log(carrito)
    //limpiamos el html
    items.innerHTML = '' 
    Object.values(carrito).forEach( producto => {
        templateCarrito.querySelector('th').textContent = producto.id
        templateCarrito.querySelectorAll('td')[0].textContent = producto.title
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id
        templateCarrito.querySelector('span').textContent = producto.cantidad * producto.precio


        const clone = templateCarrito.cloneNode(true)
        fragment.appendChild(clone)
    })
    //pintar informacion
    items.appendChild(fragment)

    pintarFooter()
    //pasamos a texto plano para el local storage
    localStorage.setItem('carrito', JSON.stringify(carrito))
}

const pintarFooter = () => {
    footer.innerHTML = ""
    if(Object.keys(carrito).length === 0){
        footer.innerHTML = `
        <th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>
        `
        return
    }

    const nCantidad = Object.values(carrito).reduce((acc, {cantidad}) => acc + cantidad,0)
    const nPrecio = Object.values(carrito).reduce((acc, {cantidad, precio}) => acc + cantidad * precio,0)

    templateFooter.querySelectorAll('td')[0].textContent = nCantidad
    templateFooter.querySelector('span').textContent = nPrecio

    const clone = templateFooter.cloneNode(true)
    fragment.appendChild(clone)
    footer.appendChild(fragment)

    const btnVaciar = document.getElementById('vaciar-carrito')
    btnVaciar.addEventListener('click', () => {
        carrito =  {}
        pintarCarrito()
    })
}

const btnAccion = e => {
    //console.log(e.target)
    //btn aumentar 
    if (e.target.classList.contains('btn-info')){
        carrito[e.target.dataset.id]
        const producto = carrito[e.target.dataset.id]
        producto.cantidad++
        carrito[e.target.dataset.id] = {...producto}
        pintarCarrito()
    }
    //btn disminuir
    if (e.target.classList.contains('btn-danger')) {
        carrito[e.target.dataset.id]
        const producto = carrito[e.target.dataset.id]
        producto.cantidad--
        if(producto.cantidad === 0) {
            delete carrito[e.target.dataset.id]
        }    
        pintarCarrito()
    } 
    e.stopPropagation
}