const {validationResult} = require('express-validator')

exports.runValidation = (req, res, next)=>{
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    return res.status(422).json({    //status(422) means can not go further we can put what ever we want thait does not matter
      error: errors.array()[0].msg
    })
  }
  next()
} 