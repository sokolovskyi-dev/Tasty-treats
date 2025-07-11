import Notiflix from 'notiflix';
import { fetchRecipeInfo } from '../services/recipe-info';
import { hideLoader, showLoader } from './loader';
import { removeItemAndUpdateFavGallery } from './favorites-gallery';
import {
  saveToStorage,
  loadFromStorage,
  removeFromStorage,
} from '../utils/localStorage';
import { STORAGE_KEYS } from '../../constants/constants';
const favoritesKey = STORAGE_KEYS.FAVORITES_KEY;

let favoritesValue = loadFromStorage(favoritesKey) || [];

async function renderRecipeToModal(btn, modalContent) {
  const loaderContainer =
    btn.closest('.gallery-item') || btn.closest('.popular-recipes-section');
  let opacityElement = null;

  if (btn.closest('.gallery-item')) {
    opacityElement = loaderContainer.querySelector('.gallery__list');
    showLoader(loaderContainer, opacityElement);
  } else if (btn.closest('.popular-recipes-section')) {
    opacityElement = loaderContainer.querySelector('.popular-recipes__list');
    showLoader(loaderContainer, opacityElement);
  } else {
    console.error('Loader error');
  }

  try {
    const recipeId = btn.dataset.id;
    const recipeInfo = await fetchRecipeInfo(recipeId);
    const markup = createRecipeInfoMarkup(recipeInfo);

    modalContent.innerHTML = markup;

    initRecipeInfoButtons();
  } catch (error) {
    console.error('Error rendering recipe iformation to madal', error);
    throw error;
  } finally {
    hideLoader(loaderContainer, opacityElement);
  }
}

function createRecipeInfoMarkup({
  title,
  instructions,
  time,
  rating,
  ingredients,
  tags,
  youtube,
  _id,
}) {
  const paintedStarsWidth = (rating / 5) * 100;

  favoritesValue = loadFromStorage(favoritesKey) || [];

  let addToFavoriteBtnTextContent = '';
  if (favoritesValue.includes(_id)) {
    addToFavoriteBtnTextContent = 'Remove from favorites';
  } else if (!favoritesValue.includes(_id)) {
    addToFavoriteBtnTextContent = 'Add to favorites';
  }

  let tagsList;
  tags.length === 0
    ? (tagsList = '')
    : (tagsList = tags
        .map(tag => `<li class="tags-list-item">#${tag}</li>`)
        .join(''));

  const ingredientslist = ingredients
    .map(
      ({ name, measure }) => `
  <li class="ingredients-list__item">
  <p class="ingredients-list__item-name">${name}</p>
 <p class="ingredients-list__item-measure">${measure}</p>
  </li>
  `
    )
    .join('');

  if (window.innerWidth < 768) {
    return `
    <div class="recipe-info-wrapper">
    <div class="video-container">
    <iframe
    src="${getYouTubeEmbedUrl(youtube)}"
    title="YouTube video player"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    ></iframe>
    </div>
    
    <h3 class="recipe-info-title">${title}</h3>



  <div class="recipe-info__rating-time-wrapper">
  
  <div class="recipe-info__rating-wrapper">
  <p class="recipe-info-rating-number">${rating.toFixed(1)}</p>
  
<div class="stars-list-wrapper">
          <ul class="rating-list">
            <li class="rating-list__item">
             <svg class="rating-list__star-icon">
                <use href="#icon-star"></use>
              </svg>
            </li>
            <li class="rating-list__item">
            <svg class="rating-list__star-icon">
                <use href="#icon-star"></use>
              </svg>
            </li>
            <li class="rating-list__item">
            <svg class="rating-list__star-icon">
                <use href="#icon-star"></use>
              </svg>
            </li>
            <li class="rating-list__item">
            <svg class="rating-list__star-icon">
                <use href="#icon-star"></use>
              </svg>
            </li>
            <li class="rating-list__item">
            <svg class="rating-list__star-icon">
                <use href="#icon-star"></use>
              </svg>
            </li>
          </ul>

 <ul class="rating-list painted" style="width: ${paintedStarsWidth}%;">
            <li class="rating-list__item">
             <svg class="rating-list__star-icon">
                <use href="#icon-star"></use>
              </svg>
            </li>
            <li class="rating-list__item">
            <svg class="rating-list__star-icon">
                <use href="#icon-star"></use>
              </svg>
            </li>
            <li class="rating-list__item">
            <svg class="rating-list__star-icon">
                <use href="#icon-star"></use>
              </svg>
            </li>
            <li class="rating-list__item">
            <svg class="rating-list__star-icon">
                <use href="#icon-star"></use>
              </svg>
            </li>
            <li class="rating-list__item">
            <svg class="rating-list__star-icon">
                <use href="#icon-star"></use>
              </svg>
            </li>
          </ul>
           </div>


  </div>
  
  
  <p class="recipe-info-time">${time} min</p>
  </div>


  
  <ul class="ingredients-list">
  ${ingredientslist}
  </ul>

  <ul class="tags-list">
  ${tagsList}
  </ul>
  
  <p class="instructions-text">${instructions}</p>

  <div class="recipe-info__btn-wrapper"> 
   <button class="add-to-favorite-btn" data-id="${_id}" aria-label="Add to favorites button" >${addToFavoriteBtnTextContent}</button>
    <button class="give-rating-btn" data-id="${_id}" aria-label="Give a rating button"  data-modal-open  data-modal-type="rating">Give a rating</button>
  </div>
 
  </div>
    `;
  }

  return `
  <div class="recipe-info-wrapper">
  <h3 class="recipe-info-title">${title}</h3>
<div class="video-container">
  <iframe
    src="${getYouTubeEmbedUrl(youtube)}"
    title="YouTube video player"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
  ></iframe>
</div>

<div class="tags-rating-time-wrapper">
<ul class="tags-list">
${tagsList}
</ul>

<div class="recipe-info__rating-time-wrapper">
  
  <div class="recipe-info__rating-wrapper">
  <p class="recipe-info-rating-number">${rating.toFixed(1)}</p>
  
<div class="stars-list-wrapper">
          <ul class="rating-list">
            <li class="rating-list__item">
             <svg class="rating-list__star-icon">
                <use href="#icon-star"></use>
              </svg>
            </li>
            <li class="rating-list__item">
            <svg class="rating-list__star-icon">
                <use href="#icon-star"></use>
              </svg>
            </li>
            <li class="rating-list__item">
            <svg class="rating-list__star-icon">
                <use href="#icon-star"></use>
              </svg>
            </li>
            <li class="rating-list__item">
            <svg class="rating-list__star-icon">
                <use href="#icon-star"></use>
              </svg>
            </li>
            <li class="rating-list__item">
            <svg class="rating-list__star-icon">
                <use href="#icon-star"></use>
              </svg>
            </li>
          </ul>

 <ul class="rating-list painted" style="width: ${paintedStarsWidth}%;">
            <li class="rating-list__item">
             <svg class="rating-list__star-icon">
                <use href="#icon-star"></use>
              </svg>
            </li>
            <li class="rating-list__item">
            <svg class="rating-list__star-icon">
                <use href="#icon-star"></use>
              </svg>
            </li>
            <li class="rating-list__item">
            <svg class="rating-list__star-icon">
                <use href="#icon-star"></use>
              </svg>
            </li>
            <li class="rating-list__item">
            <svg class="rating-list__star-icon">
                <use href="#icon-star"></use>
              </svg>
            </li>
            <li class="rating-list__item">
            <svg class="rating-list__star-icon">
                <use href="#icon-star"></use>
              </svg>
            </li>
          </ul>
           </div>


  </div>
  
  
  <p class="recipe-info-time">${time} min</p>
  </div>

</div>

<ul class="ingredients-list">
${ingredientslist}
</ul>

<p class="instructions-text">${instructions}</p>

<div class="recipe-info__btn-wrapper"> 
  <button class="add-to-favorite-btn" data-id="${_id}" aria-label="Add to favorites button" >${addToFavoriteBtnTextContent}</button>
  <button class="give-rating-btn" data-id="${_id}" aria-label="Give a rating button"  data-modal-open  data-modal-type="rating">Give a rating</button>
  </div>
</div>
  `;
}

function getYouTubeEmbedUrl(url) {
  try {
    const videoId = new URL(url).searchParams.get('v');
    return `https://www.youtube.com/embed/${videoId}`;
  } catch (error) {
    console.error('Invalid YouTube URL:', url);
    return '';
  }
}

function initRecipeInfoButtons() {
  const addToFavoriteBtn = document.querySelector('.add-to-favorite-btn');
  if (addToFavoriteBtn) {
    addToFavoriteBtn.addEventListener('click', onAddToFavoriteBtnClick);
  }
}

function onAddToFavoriteBtnClick(e) {
  const addToFavoriteBtn = e.currentTarget;
  const id = e.currentTarget.dataset.id;
  const heartIcon = document.querySelector(
    `.favorite-btn__icon[data-id="${id}"]`
  );

  favoritesValue = loadFromStorage(favoritesKey) || [];

  if (!favoritesValue.includes(id)) {
    favoritesValue.push(id);
    heartIcon?.classList.add('saved');
    addToFavoriteBtn.textContent = 'Remove from favorites';
    Notiflix.Notify.success('Added to favorites', {
      clickToClose: true,
    });
  } else if (favoritesValue.includes(id)) {
    heartIcon?.classList.remove('saved');
    if (document.body.dataset.currentPage === 'favorites') {
      addToFavoriteBtn.textContent = 'Removed from favorites';
      addToFavoriteBtn.classList.add('disabled');
      removeItemAndUpdateFavGallery(id);
    } else {
      const index = favoritesValue.indexOf(id);
      favoritesValue.splice(index, 1);

      addToFavoriteBtn.textContent = 'Add to favorites';
      Notiflix.Notify.warning('Removed from favorites', {
        clickToClose: true,
      });
    }
  }
  if (favoritesValue.length === 0) {
    removeFromStorage(favoritesKey);
  } else {
    saveToStorage(favoritesKey, favoritesValue);
  }
}

export { renderRecipeToModal };
