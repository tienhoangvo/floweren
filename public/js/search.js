import axios from 'axios';

import loader from './loader';
import generateProductCard from './productCard';

export const searchProducts = async (
  searchObj
) => {
  const cardContainer = document.querySelector(
    '.card-container'
  );

  cardContainer.innerHTML = loader;
  if (searchObj.category === '')
    searchObj.category = undefined;
  if (
    searchObj.search ||
    searchObj.search == ''
  ) {
    const products = (
      await axios({
        method: 'get',
        url: '/api/v1/products',
        params: searchObj,
      })
    ).data.data.data;

    console.log(products);
    console.log(cardContainer);

    if (products.length > 0) {
      cardContainer.innerHTML = '';
      const productsHTML = products.reduce(
        (acc, product) => {
          return `${acc} ${generateProductCard(
            product
          )}`;
        },
        ''
      );
      console.log(productsHTML);
      cardContainer.innerHTML = productsHTML;
    } else {
      cardContainer.innerHTML =
        '<h5 class="no-search-results">NO RESULTS<h5>';
    }
  }
};
