export const readURL = (input) => {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = (event) => {
      if (input.files && input.files[0]) {
        document
          .querySelector('.form__user-photo')
          .setAttribute(
            'src',
            event.target.result
          );
      }
    };

    reader.readAsDataURL(input.files[0]);
  }
};
