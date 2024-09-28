const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next); // Properly handle errors
};

module.exports = catchAsync;
// this function returns a function
// ص عشان نبقي عارفين لو حصل اي  ايرور في اي اسينك فانكشن ال الايرور هيروح للفانكشن اللي اسمها
//  و بعد كده الفانكشن دي هتنادي ال نيكستcatchAsynch
