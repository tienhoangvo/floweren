import '@babel/polyfill';

import {
  login,
  logout,
  signup,
  forgotPassword,
  resetPassword,
} from './auth';
import { updateMe } from './updateMe';
import { searchProducts } from './search';
import { readURL } from './displayUploadImage';
import { orderProducts } from './stripe';
import { addToCart } from './addToCart';

import { showAlert } from './alerts';
import {
  getCategories,
  categoryOption,
} from './categoryOption';

const loginForm = document.querySelector(
  '.login-form .form'
);

const signupForm = document.querySelector(
  '.signup-form .form'
);

const forgotPasswordForm = document.querySelector(
  '.forgot-password-form .form'
);

const resetPasswordForm = document.querySelector(
  '.reset-password-form .form'
);

const logoutBtn = document.querySelector(
  '.nav__el--logout'
);

const searchForm = document.querySelector(
  '.form-search'
);

const userDataForm = document.querySelector(
  '.form-user-data'
);

const userPasswordForm = document.querySelector(
  '.form-user-settings'
);

const cartBtn = document.querySelector(
  '.nav__el--cart'
);

const orderBtn = document.querySelector(
  '.btn-checkout'
);

const addToCartBtn = document.querySelector(
  '#add-to-cart'
);

////////////////////
// AUTHENTICATION
////////////////////
if (loginForm) {
  const emailInput = document.querySelector(
    '#email'
  );
  const passwordInput = document.querySelector(
    '#password'
  );
  loginForm.addEventListener(
    'submit',
    async (event) => {
      event.preventDefault();

      const email = emailInput.value;
      const password = passwordInput.value;

      const data = { email, password };
      login(data);
    }
  );
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', (event) => {
    logout();
  });
}

if (signupForm) {
  const emailInput = document.querySelector(
    '#email'
  );
  const nameInput = document.querySelector(
    '#name'
  );
  const passwordInput = document.querySelector(
    '#password'
  );
  const passwordConfirmInput = document.querySelector(
    '#passwordConfirm'
  );
  const phoneInput = document.querySelector(
    '#phone'
  );
  const cityInput = document.querySelector(
    '#city'
  );
  const addressTextArea = document.querySelector(
    '#address'
  );

  signupForm.addEventListener(
    'submit',
    (event) => {
      event.preventDefault();

      const email = emailInput.value;
      const name = nameInput.value;
      const password = passwordInput.value;
      const passwordConfirm =
        passwordConfirmInput.value;
      const phone = phoneInput.value;
      const city = cityInput.value;
      const address = addressTextArea.value;

      const data = {
        email,
        name,
        password,
        passwordConfirm,
        phone,
        city,
        address,
      };

      signup(data);
    }
  );
}

if (forgotPasswordForm) {
  const emailInput = document.querySelector(
    '#email'
  );

  forgotPasswordForm.addEventListener(
    'submit',
    async (event) => {
      event.preventDefault();

      const email = emailInput.value;

      await forgotPassword(email);
    }
  );
}

if (resetPasswordForm) {
  const passwordInput = document.querySelector(
    '#password'
  );
  const passwordConfirmInput = document.querySelector(
    '#passwordConfirm'
  );
  resetPasswordForm.addEventListener(
    'submit',
    async (event) => {
      event.preventDefault();
      const password = passwordInput.value;
      const passwordConfirm =
        passwordConfirmInput.value;
      const data = { password, passwordConfirm };
      console.log(data);
      resetPassword(data);
    }
  );
}

if (userDataForm) {
  const photoInput = document.querySelector(
    '#photo'
  );
  console.log(photoInput);
  photoInput.addEventListener('change', (event) =>
    readURL(event.target)
  );
  userDataForm.addEventListener(
    'submit',
    async (event) => {
      event.preventDefault();
      const name = document.querySelector('#name')
        .value;
      const email = document.querySelector(
        '#email'
      ).value;
      const photoInput = document.querySelector(
        '#photo'
      );
      const phone = document.querySelector(
        '#phone'
      ).value;
      const address = document.querySelector(
        '#address'
      ).value;
      const form = new FormData();
      form.append('name', name);
      form.append('email', email);
      form.append('phone', phone);
      form.append('address', address);

      if (photoInput.files && photoInput.files[0])
        form.append('photo', photoInput.files[0]);

      document.querySelector(
        '.btn--save-password'
      ).textContent = 'Updating •••';

      await updateMe(form, 'updateMe');
      document.querySelector(
        '.btn--save-password'
      ).textContent = 'SAVE SETTINGS';
    }
  );
}

if (userPasswordForm) {
  userPasswordForm.addEventListener(
    'submit',
    async (event) => {
      event.preventDefault();
      document.querySelector(
        '.btn--save-password'
      ).textContent = 'Updating •••';
      const password = document.querySelector(
        '#password'
      ).value;
      const passwordCurrent = document.querySelector(
        '#password-current'
      ).value;
      const passwordConfirm = document.querySelector(
        '#password-confirm'
      ).value;

      await updateMe(
        {
          password,
          passwordCurrent,
          passwordConfirm,
        },
        'password'
      );

      document.querySelector('#password').value =
        '';
      document.querySelector(
        '#password-current'
      ).value = '';
      document.querySelector(
        '#password-confirm'
      ).value = '';

      document.querySelector(
        '.btn--save-password'
      ).textContent = 'Save password';
    }
  );
}

if (cartBtn) {
  cartBtn.addEventListener('click', (event) => {
    const cartDropdown = document.querySelector(
      '.cart-dropdown'
    );
    cartDropdown.classList.toggle('hide');
  });
}

if (searchForm) {
  const categoriesFilter = document.querySelector(
    '.form-search-categories'
  );

  window.addEventListener(
    'load',
    async (event) => {
      const categories = await getCategories();

      let categoryOptions = categories.map(
        (category) => categoryOption(category)
      );

      categoryOptions.unshift(
        categoryOption({
          _id: '',
          name: 'Choose a category',
        })
      );

      categoriesFilter.innerHTML = categoryOptions.join(
        ''
      );

      categoriesFilter.addEventListener(
        'input',
        async (event) => {
          console.log(event.target.value);
          await searchProducts({
            search: searchInput.value,
            category: event.target.value,
          });
        }
      );
    }
  );

  const searchInput = document.querySelector(
    '.form-search-input'
  );

  let timeOutId;

  searchInput.addEventListener(
    'input',
    async (event) => {
      clearTimeout(timeOutId);
      const searchStr = event.target.value;
      const categoryId = categoriesFilter.value;
      console.log({ categoryId });

      const searchObj =
        categoryId !== ''
          ? {
              search: searchStr,
              category: categoryId,
            }
          : { search: searchStr };

      timeOutId = setTimeout(async () => {
        await searchProducts(searchObj);
      }, 500);
    }
  );
}

if (orderBtn) {
  orderBtn.addEventListener(
    'click',
    async (event) => {
      event.target.textContent = 'Processing...';
      await orderProducts();
    }
  );
}

if (addToCartBtn) {
  addToCartBtn.addEventListener(
    'click',
    async (event) => {
      event.target.textContent = 'Processing...';
      await addToCart(
        event.target.dataset.productId
      );
    }
  );
}

const alertMessage = document.querySelector(
  'body'
).dataset.alert;
if (alertMessage)
  showAlert('success', alertMessage, 15);

var Tawk_API = Tawk_API || {},
  Tawk_LoadStart = new Date();
(function () {
  var s1 = document.createElement('script'),
    s0 = document.getElementsByTagName(
      'script'
    )[0];
  s1.async = true;
  s1.src =
    'https://embed.tawk.to/5f6025c0f0e7167d001052b0/default';
  s1.charset = 'UTF-8';
  s1.setAttribute('crossorigin', '*');
  s0.parentNode.insertBefore(s1, s0);
})();
