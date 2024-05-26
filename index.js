// Importaciones

// Clases

class Zapatilla {
	constructor(nombre, marca, precio, color, fecha, talles) {
		this.nombre = nombre
		this.marca = marca
		this.color = color
		this.precio = precio
		this.fecha = fecha
		this.talles = talles
	}
}

class GestorZapatillas {
	constructor() {
		this.totalZapatillas = []
	}

	agregarZapatilla(nombre, marca, precio, color, fecha, talles) {
		const nuevaZapatilla = new Zapatilla(
			nombre,
			marca,
			precio,
			color,
			fecha,
			talles
		)
		this.totalZapatillas.push(nuevaZapatilla)
	}

	removerArticulo(index) {
		this.totalZapatillas.splice(index, 1)
		this.actualizarStorage()
	}

	actualizarStorage() {
		localStorage.setItem('zapatillas', JSON.stringify(this.totalZapatillas))
	}

	cargarDesdeStorage() {
		const zapatillasJSON = localStorage.getItem('zapatillas')
		if (zapatillasJSON) {
			this.totalZapatillas = JSON.parse(zapatillasJSON)
		}
	}

	cargarDesdeJson(data) {
		this.totalZapatillas = this.totalZapatillas.concat(data)
		this.actualizarStorage()
	}
}

// Variables globales y constantes

const cantidadTalles = 12
const talles = [
	'33',
	'34',
	'35',
	'36',
	'37',
	'38',
	'39',
	'40',
	'41',
	'42',
	'43',
	'44',
]

const form = document.getElementById('form-data-zapatilla')
const divInputs = document.getElementById('talles-inputs')

let content = ''

const gestorZapatillas = new GestorZapatillas()

const removeArticle = document.getElementById('remove-article')

// Funciones

/*
	*		Esta funcion de closed modal me permite poder
	*	 cerrar algun modal o cualquier elemento que se
	*  abra por encima del contenido
*/
const closedModalForm = () => {
	const button = document.getElementById('closeModalButton')
	button.setAttribute('data-bs-dismiss', 'modal')
	button.setAttribute('aria-label', 'Close')
	button.click()
	button.removeAttribute('data-bs-dismiss')
	button.removeAttribute('aria-label')
}

const createInputsTalles = () => {
	for (let i = 0; i < cantidadTalles; i++) {
		content += `
			<div class="mb-3 col-4">
				<label class="form-label">${talles[i]}</label>
				<input
				type="number"
				class="form-control"
				id="talle[${talles[i]}]"
				placeholder="0"
				oninput="this.value = this.value.replace(/[^0-9]/g, '')" 
			/>
			</div>
			`
		divInputs.innerHTML = content
	}
}


// Muestra los detalles de la zapatilla en un offCanvas
const showOffcanvasContent = (index) => {
	const zapatilla = gestorZapatillas.totalZapatillas[index]
	const offcanvasBody = document.querySelector('.offcanvas-body')
	offcanvasBody.innerHTML = `
		<h5>${zapatilla.nombre} - ${zapatilla.marca}</h5>
		<p>Color: ${zapatilla.color}</p>
		<p>Precio: ARS ${parseInt(zapatilla.precio).toLocaleString()}</p>
		<p>Fecha: ${zapatilla.fecha}</p>
		<p>Talles:</p>
		<ul>
			${Object.entries(zapatilla.talles).map(([talle, cantidad]) => `<li>${talle}: ${cantidad}</li>`).join('')}
		</ul>
	`

	// Funcion para remover algun articulo
	removeArticle.addEventListener('click', () => {
		Swal.fire({
			title: "¿Estas seguro?",
			text: "¡No podrás revertirlo!",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#3085d6",
			cancelButtonColor: "#d33",
			confirmButtonText: "¡Sí, bórralo!"
		}).then((result) => {
			if (result.isConfirmed) {

				gestorZapatillas.removerArticulo(index)
				showShoes()

				document.getElementById('close-offcanvas').click()

				Swal.fire({
					title: "Eliminado!",
					text: "Tu producto ha sido eliminado.",
					icon: "success"
				});
			}
		});

	})
}




// Muestra las zapatillas en una tabla.
const showShoes = () => {
	const mostrarZapatillas = document.getElementById('mostrarZapatillas')
	mostrarZapatillas.innerHTML = ''

	const zapatillasArray = gestorZapatillas.totalZapatillas

	zapatillasArray.forEach((zapatilla, index) => {
		const HTML = `
		<tr class="cursorPointer" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" data-index="${index}">
			<td scope="row">${index + 1}</td>
			<td>${zapatilla.nombre}</td>
			<td>${zapatilla.marca}</td>
			<td>${zapatilla.color}</td>
			<td>ARS ${parseInt(zapatilla.precio).toLocaleString()}</td>
		</tr>
		`
		mostrarZapatillas.insertAdjacentHTML('beforeend', HTML)
	})

	document.querySelectorAll('#mostrarZapatillas tr').forEach(tr => {
		tr.addEventListener('click', (event) => {
			const index = event.currentTarget.getAttribute('data-index')
			showOffcanvasContent(index)
		})
	})
}


// Aqui obtenemos la data del json y la retornamos
const getDataJson = () => {
	return fetch('./producto.json')
		.then(response => {
			if (!response.ok) {
				throw new Error('Error al cargar los datos')
			}
			return response.json()
		})
		.catch(error => {
			console.error('Error: ', error)
			return []
		})
}


// Esta funcion solo cargara la data del json al inicio por primera vez.
//	para poder cargar la data de nuevo tendria que estar vacio el local storage
const getDataStorage = async () => {
	window.addEventListener('load', async () => {
		gestorZapatillas.cargarDesdeStorage()
		if (gestorZapatillas.totalZapatillas.length === 0) {
			const data = await getDataJson()
			gestorZapatillas.cargarDesdeJson(data)
		}
		showShoes()
	})
}


// Ejecuciones

getDataStorage()


createInputsTalles()
// Este es el envio de formulario
form.addEventListener('submit', event => {
	event.preventDefault()

	const formData = new FormData(event.target)

	const data = Object.fromEntries(formData.entries())

	/* 
	 * Recorrer cada input creado de los talles
	 * sacar el value convertirlo a tipo number
	 * luego asignar el valor a cada propiedad
	 * que tiene de nombre los valores del array
	 * de talles
	 */
	data.talles = talles.reduce((acc, talle) => {
		const tallaValue = document.getElementById(`talle[${talle}]`)
		const cantidad = parseInt(tallaValue.value) || 0
		acc[talle] = cantidad
		return acc
	}, {})
	gestorZapatillas.agregarZapatilla(
		data.nameShoes,
		data.marcaShoes,
		data.precioShoes,
		data.colorShoes,
		data.dateShoes,
		data.talles
	)

	gestorZapatillas.actualizarStorage()

	console.log(gestorZapatillas)
	form.reset()

	showShoes()

	closedModalForm()
})

