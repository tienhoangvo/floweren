class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = [
      'page',
      'sort',
      'limit',
      'fields',
      'search',
    ];

    excludeFields.forEach(
      (el) => delete queryObj[el]
    );

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`
    );

    console.log(queryStr);
    this.query = this.query.find(
      JSON.parse(queryStr)
    );
    return this;
  }

  search() {
    if (this.queryString.search) {
      console.log(this.queryString);
      this.query = this.query.find({
        $text: {
          $search: `"${this.queryString.search}"`,
        },
      });
    }
    return this;
  }

  sort() {
    const sortBy = this.queryString.sort
      ? this.queryString.sort.split(',').join(' ')
      : 'createdAt';

    console.log(sortBy);

    this.query = this.query.sort(sortBy);
    return this;
  }

  limitFields() {
    const fields = this.queryString.fields
      ? this.queryString.fields
          .split(',')
          .join(' ')
      : '-__v';

    console.log(fields);

    this.query = this.query.select(fields);

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;

    let limit = this.queryString.limit * 1 || 10;

    // A limit on the number of objects to be returned, between 1 and 100.
    limit =
      limit > 0 && limit <= 100 ? limit : 10;

    const skip = (page - 1) * limit;

    console.log(
      `page: ${page}, limit: ${limit}, skip: ${skip}`
    );

    this.query = this.query
      .skip(skip)
      .limit(limit);

    this.page = page;
    this.limit = limit;
    return this;
  }
}

module.exports = APIFeatures;
