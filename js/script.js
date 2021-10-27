let searchMovieForm = document.querySelector('[name="searchMovie"]'),
  inputType = document.getElementById('inputType'),
  btnSearch = document.getElementById('btn-search'),
  movieList = document.querySelector('.movie-list'),
  container = document.querySelector('.container');

const api_key = 'd3890bee';
const request = new XMLHttpRequest();
let page_counter = 1;

// Обработка события для кнопки поиска, при клике на которую идет запрос к api
btnSearch.addEventListener('click', (e) => {

  page_counter = 1; //это чтобы счетчик обнулялся, если новый фильм ищем
  movieList.innerHTML = ` `;
  let inputTitle = document.getElementById('inputTitle').value;
  let inputType = document.getElementById('inputType').value;
  const url = `http://www.omdbapi.com/?apikey=${api_key}&s=${inputTitle}&type=${inputType}&page=${page_counter}`;

  ajax(url); //вызов функции с ajax запросом

  e.preventDefault(); //отмена событий браузера по умолчанию
})



function ajax(url) {
  request.open('GET', url);

  request.responseText = 'json';
  // Свойство для ожидаемого типа ответа – responseType

  request.send();

  request.onload = function () {

    if (request.status == 200) {
      let jsonObj = request.response;
      let movieListObj = JSON.parse(jsonObj) //парсится json обьект в js обьект
      // При ожидаемом типе json парсинг в JS-объект происходит автоматически

      if (movieListObj.Error) {
        movieList.innerHTML = `<div class="error">Movie not found</div>`;
      }

      getMovieListObj(movieListObj); //вызов функции, которая отрисовывает карточки с фильмами

      //  отрисовываем кнопку Еще, если фильмов более 10
      if (movieListObj.totalResults > 10) {
        movieList.innerHTML += `
          <div class="btn_next_page">
              <button id="btn_next-page">Еще</button>
          </div> `
        eventListenerBtnNext();
        // это условие, чтобы кнопка Еще удалялась, когда на стр стало меньше чем 10 фильмов
        if (movieListObj.totalResults <= page_counter * 10) {
          let btnNext = document.getElementById('btn_next-page');
          btnNext.remove();
        }
      }

      getDetailsFilm(); //вызов функции, которая показывает детальную информацию о фильме

    } else {
      console.log('Ошибка соединения, повторите попытку позже');
    }

  }
}


function getMovieListObj(movieListObj) {
  if (movieListObj.Search) {
    for (let elem of movieListObj.Search) {
      let picture = '';
      // чтобы заглушка на картинку ставилась из стороннего api, если img нет
      if (elem.Poster === 'N/A') {
        picture = `https://via.placeholder.com/300x444.png?text=${elem.Title}`
      } else {
        picture = elem.Poster;
      }
      movieList.innerHTML += `
        <figure>
        <img src="${picture}">
        <p>${elem.Type}</p>
        <figcaption>${elem.Title}</figcaption>
        <p>${elem.Year}</p>
        <button class="btn-card" data-idfilm="${elem.imdbID}">Details</button>
        </figure>`;
    }
  }
}

function eventListenerBtnNext() {
  let inputTitle = document.getElementById('inputTitle').value; //заново считываем значение с inputTitle, так как он передается в url
  let inputType = document.getElementById('inputType').value; //заново считываем значение с inputType, так как он передается в url
  let btnNext = document.getElementById('btn_next-page');
  btnNext.addEventListener('click', () => {
    movieList.innerHTML = ` `; // очищаем список, чтобы новые 10 отрисовались
    page_counter++; //увеличиваем счетчик
    const url = `http://www.omdbapi.com/?apikey=${api_key}&s=${inputTitle}&type=${inputType}&page=${page_counter}`; // page - это параметр api, и приравниваем его к  page_counter, чтобы следующие 10 фильмов показывались
    ajax(url); //вызов функции с ajax запросом
  })
}

function getDetailsFilm() {
  let details = document.querySelectorAll('.btn-card');

  for (let btn of details) {
    btn.addEventListener('click', (e) => {
      let idFilm = btn.getAttribute('data-idfilm');
      const url = `http://www.omdbapi.com/?apikey=${api_key}&i=${idFilm}&plot=full`;
      ajaxDetails(url) //вызов функции с запросом и получения json обьекта
    })
  }
}

function ajaxDetails(url) {
  request.open('GET', url);
  request.responseText = 'json';
  request.send();

  request.onload = function () {

    if (request.status == 200) {
      let jsonObj = request.response;
      let movieListObj = JSON.parse(jsonObj)
      let modalContainer = document.createElement('div'); //создание модального окна
      modalContainer.classList.add('modal-container');
      container.append(modalContainer);

      let picture = '';
      if (movieListObj.Poster === 'N/A') {
        picture = `https://via.placeholder.com/273x365.png?text=${movieListObj.Title}`;
      } else {
        picture = movieListObj.Poster;
      }

      modalContainer.innerHTML = `
      <div class="modal-main">
      <div class="poster"><img src="${picture}"></div>
      <div class="film-full_info"> 
      <div><b>Title:</b>${movieListObj.Title}</div>
      <div><b>Released:</b>${movieListObj.Released}</div>
      <div><b>Genre:</b>${movieListObj.Genre}</div>
      <div><b>Country:</b>${movieListObj.Country}</div>
      <div><b>Director:</b>${movieListObj.Director}</div>
      <div><b>Writer:</b>${movieListObj.Writer}</div>
      <div><b>Actors:</b>${movieListObj.Actors}</div>
      <div><b>Awards:</b>${movieListObj.Awards}</div>
      </div>
      </div>`

      // убираем скролл у body, если открыто модальное окно
      if (modalContainer) {
        document.body.style.overflow = "hidden";
      }

      modalContainer.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('modal-container')) {
          modalContainer.style.display = "none"
          document.body.style.overflow = "auto";
        }else{
          document.body.style.overflow = "hidden";
        }
      })

    }
  }
}