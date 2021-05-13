const Card = personaje => { //Genera la card del personaje
  const { id, name, status, species, image } = personaje //Obtener los datos del personaje con destructuring
  return `
      <div class="column is-one-quarter-desktop is-full-mobile">
          <a class="handleOpenModal" data-id=${id}><div class="card">
              <div class="card-image">
              <figure class="image is-4by3">
                  <img src="${image}" alt="Placeholder image">
              </figure>
              </div>
              <div class="card-content">
              <div class="media">
                  <div class="media-left">
                  <figure class="image is-48x48">
                      <img src="${image}" alt="Placeholder image">
                  </figure>
                  </div>
                  <div class="media-content">
                      <p class="title is-4">${name}</p>
                      <p class="subtitle is-6">${species}</p>
                  </div>
              </div>
              <div class="content">
                  <p>${status}</p>
              </div>
              </div>
          </div></a>
      </div>
  `
}

const Modal = personaje => { //Generar el modal, previamente cargado con la info del personaje y de los episodios

  const { name, image, episodesData } = personaje //Datos del personaje y array de episodios (data)

  //Recorro todos los episodios y los voy acumulando en episodesLi (ul)
  let episodesLi = ''
  episodesData.forEach(({name})=>{
      episodesLi += `<li>${name}</li>`
  })

  return `
  <div class="box">
      <article class="media">
          <div class="media-left">
              <figure class="image is-64x64">
                  <img src=${image} alt="Image">
              </figure>
              </div>
              <div class="media-content">
              <div class="content">
                  <p>
                  <strong>${name}</strong>
                  <br>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean efficitur sit amet massa fringilla egestas. Nullam condimentum luctus turpis.
                  </p>
                  <h3>Episodes</h3>
                  <ul>${episodesLi}</ul>
              </div>
              <nav class="level is-mobile">
                    <div class="level-left">
                      <a class="level-item" aria-label="retweet">
                          <span class="icon is-small">
                            <i class="fas fa-retweet" aria-hidden="true"></i>
                          </span>
                        </a>
                        <a class="level-item" aria-label="like">
                          <span class="icon is-small">
                            <i class="fas fa-heart" aria-hidden="true"></i>
                        </span>
                      </a>
                  </div>
              </nav>
          </div>
      </article>
  </div>
  `
}

const appendElements = (characters, borrarGrilla = false) => { //Agrega las cards a la grilla
  const $grid = document.querySelector('.grid'); //Selecciono la grilla del DOM
  if (borrarGrilla) { //Me borra (inicializa) la grilla si borrarGrilla = true
      $grid.innerHTML = null;
  }
  characters.forEach(character => { //Para cada personaje, creamos la Card y la agregamos (acumulamos += ) a grid
      const cardItem = Card(character);
      $grid.innerHTML += cardItem;
  });

  //Modal
  const $modalOpenArr = document.querySelectorAll('.handleOpenModal'); //Selecciono todos links de las cards
  const $modal = document.querySelector('.modal'); //Selecciono el modal
  const $modalContent = document.querySelector('.modal-content'); //Selecciono donde voy a colocar el markup del modal
  const $modalClose = document.querySelector('.modal-close'); //Selecciono la crucecita para cerrar el modal

  $modalClose.addEventListener('click', () => { //Le agrego el click a la crucecita del modal
      $modal.classList.remove('is-active');
  })

  $modalOpenArr.forEach((card) => { //Para cada link de card, le agrego el evento de click
      card.addEventListener('click', () => {
          const id = card.dataset.id; //Obtenemos el ID del personaje del data-id de la card
          const character = characters[id - 1]; //Nos da la posicion del personaje en el array de characters
          const { episode } = character //Obtengo los links de cada episodio del personaje

          const getEpisodesData = async () => { //Hago Promise.all para consultar cada link de episodio.
              return Promise.all(episode.map(url => getEpisode(url))) //Resuelvo cada una de las promesas (fetchs de episodes)
          }
          getEpisodesData().then(episodesData => { //Cuando todas las Promises se cumplieron. Trabajo con la respuesta (array de episodios con su data)
              const characterWithEpisodes = { ...character, episodesData } //Junto los datos que tenia del character + sus episodes
              $modalContent.innerHTML = Modal(characterWithEpisodes) //Le mando todo junto a modal
              $modal.classList.add('is-active'); //Activo el modal
          })
      })
  })
}

const getCharacters = async (baseURL, from, to) => { //Obtengo de la api, los personajes desde/hasta
  const charactersRange = Array.from({ length: to - from + 1 }, (_, index) => index + 1).join(','); //armar cadena 1,2,3,4,5,6,7...100. De los IDS del personaje.
  const url = `${baseURL}character/${charactersRange}`; //Armo la URL de consulta a la API
  const response = await fetch(url);
  const characters = await response.json();
  return characters; //Devuelvo un array con todos los personajes.
}

const getEpisode = async (url) => { //Obtengo la data de un episodio, mediante su URL
  const response = await fetch(url);
  const episode = await response.json();
  return episode; //Devuelvo un objeto con la data del episodio.
}

const getCharactersByQuery = async (baseURL, valorABuscar) => { //Busco un personaje con un parámetro de búsqueda (valorABuscar)
  const url = `${baseURL}character/?name=${valorABuscar}`; //Armo la URL de búsqueda
  const response = await fetch(url);
  const characters = await response.json();
  return characters; //Devuelvo un array con todos los personajes que matcheen.
}

const main = async () => {
  //Armar la grilla
  const baseURL = 'https://rickandmortyapi.com/api/'; //URL Base de mi API (Consultar Documentación de la API)
  const characters = await getCharacters(baseURL, 1, 100); //Traigo personajes desde/hasta
  appendElements(characters) //Agrego los personajes a la grid.

  //Busqueda de personaje
  const $submit = document.querySelector('.handle_search'); //Selecciono el botón del form de búsqueda
  $submit.addEventListener('click', async (event) => { //Agrego evento de click en botón de búsqueda
      event.preventDefault(); //Cancelo el evento default del botón (href cancelado)
      const $input = document.querySelector('.input_search') //Selecciono el input de búsqueda
      const value = $input.value; //Obtengo el value (valor) del input de búsqueda
      const charactersByQuery = await getCharactersByQuery(baseURL, value) //Con mi valor de búsqueda, traigo los personajes que matchean.
      const characters = charactersByQuery.results; //Obtengo los resultados
      appendElements(characters, true); //Agrego los personajes, con parámetro de valorABuscar en True (reinicia grilla)
  })
}

main(); //Ejecuto toda la aplicación.

// Fetch: Funcion interna de Javascript, que por adentro resuelve una promesa. Hace una busqueda/pedido (metodo get) a una URL y la URL le devuelve info o un problema. 
// Endpoint: Una URL sumada a un metodo (get/post/delete) me ejecuta una funcion propia de mi API.
// addEventListener: Se queda escuchando, cuando alguien toca recien ahi se ejecuta todo lo que esta adentro
// Modal: El pop up/ventana que te aparece. Cuando me aparece el modal necesito tener el PERSONAJE y la DATA DE EPISODIOS
// dataset: Acceder a los atributos data que tiene un elementos del DOM. (Linea 102)