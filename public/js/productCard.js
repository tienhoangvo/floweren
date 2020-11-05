const generateProductCard = (
  product
) => `<div class="card">
    <div class="card__header">
        <div class="card__picture">
            <div class="card__picture-overlay">&nbsp;</div><img class="card__picture-img"
                src="${
                  product.imageCover
                }" alt="${product.name}">
        </div>
        <h3 class="heading-tertirary"><span>${
          product.name
        }</span></h3>
    </div>
    <div class="card__details">
        <h4 class="card__sub-heading">${
          product.category.name
        }</h4>
        <p class="card__text">${product.description.slice(
          0,
          30
        )}...</p>
        <div class="card__data"><svg class="card__icon">
                <use xlink:href="/img/sprite.svg#icon-leaf"></use>
            </svg><span>${new Date(
              product.createdAt
            ).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}</span></div>
        <div class="card__data"><svg class="card__icon">
                <use xlink:href="/img/sprite.svg#icon-leaf"></use>
            </svg><span>${
              product.quantity
            } in stocks</span></div>
        <div class="card__data"><svg class="card__icon">
                <use xlink:href="/img/sprite.svg#icon-leaf"></use>
            </svg><span>${
              product.soldQuantity
            } products sold</span></div>
    </div>
    <div class="card__footer">
        <p><span class="card__footer-value">$${
          product.price
        } </span><svg class="card__footer-icon">
                <use xlink:href="/img/sprite.svg#icon-price-tag"></use>
            </svg></p>
        <p class="card__ratings"><span class="card__footer-value">${
          product.avgRatings
        }</span><span class="card__footer-text">stars /
                ${
                  product.numberOfRatings
                }</span></p><a class="btn btn--dark-pink btn--small" href="/products/${
  product.slug
}">Details</a>
    </div>
</div>`;

export default generateProductCard;
