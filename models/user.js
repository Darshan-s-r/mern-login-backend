const mongoose = require("mongoose");
const crypto = require('crypto')// it comes from node modules not external

const userSchema = new mongoose.Schema({
  name:{
    type:String,
    trim:true,
    required:true,
    max: 30
  },
  email:{
    type:String,
    trim:true,
    required:true,
    unique:true,
    lowercase:true,
    max: 30
  },
  hashed_password:{
    type:String,
    required:true,
  },
  salt:String,
  role:{
    // type:String
    type: mongoose.Schema.Types.Mixed,
    default: 'subscriber'
  },
  resetPasswordLink:{
    // data:String
    type: mongoose.Schema.Types.Mixed,
    default: ''
  }
  
}, {timestamps:true})

//virtual {hear it takes the plane password and add the hash}
// The virtual function is used to create virtual properties on a Mongoose schema.
userSchema.virtual('password')
.set(function(password){
  this._password = password
  this.salt = this.makeSalt()
  this.hashed_password = this.encryptPassword(password)
})
.get(function(){
  return this._password
})

//methods
userSchema.methods = {
  authenticate: function(plainText){
     return this.encryptPassword(plainText) === this.hashed_password;
  },
  encryptPassword: function(password){
    if(!password)
      return '' 
    try {
      return crypto.createHmac('sha1', this.salt)  //hear sha1 is algorithem name
      .update(password)
      .digest('hex');
    } catch(err){
      return ''
    }
  },

  makeSalt: function() {
    return Math.round(new Date().valueOf() * Math.random()) + ''  //it gives some random salt nothng else
  }
}

module.exports = mongoose.model('User', userSchema);