const User = require('../models/user')
const jwt = require('jsonwebtoken')
const Sib = require('sib-api-v3-sdk')
const _ = require('lodash')

//we can use this exports method any were in the folder that instaled express
// exports.signup =  function(req, res){
//   const {name, email, password} = req.body
//   User.findOne({email})    //hear {email:'email'} but we made {email} bcz key and value name is same
//   .then(user => {
//     if (user) {
//       return res.status(400).json({
//         error: 'email is already taken'
//       });
//     }

//     let newUser = new User({
//       name,
//       email, 
//       password
//     });

//     newUser.save()
//       .then(() => {
//         return res.json({
//           message: 'user created successfully',
//           newUser
//         });
//       })
//       .catch(err => {
//         return res.status(400).json({
//           error: 'SIGNUP ERROR',
//           err
//         });
//       });
//   })
//   .catch(err => {
//     res.status(500).json({
//       error: err
//     });
//   });
// }

//email verification signUp-----------------------------------------

 // if we use above approch we will be saving the lot of junk users in your database
// people will signup with whatever email and it will work's
// so we use the concept of email conformation. when they want to signup we send the 
// verification email 
// when receive a email the user information will encoded in jason web token(jwt)

 

exports.signup = (req, res) => {
  const { name, email, password } = req.body;

  User.findOne({ email }).then((user) => {
    if (user) {
      return res.status(400).json({
        error: 'email is taken'
      });
    }

    const token = jwt.sign({ name, email, password },
      process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '10m' });

    const apikey = process.env.API_KEY;
    Sib.ApiClient.instance.authentications['api-key'].apiKey = apikey;

    const tranEmailApi = new Sib.TransactionalEmailsApi();

    const sender = {
      email: 'darshanrangegowda19@gmail.com',
    };

    const receivers = [
      {
        email: email,
      },
    ];

    tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: 'Account activation link',
      htmlContent: `<h2>Click here for activation:</h2>
           <p>${process.env.CLIENT_URL}/accountActivation/${token}</p>
           <p>${process.env.CLIENT_URL}`


    })
    .then(() => {
      return res.json({
        message: `Email has been sent to ${email}`
      })
    } )
    .catch((err) => {
      // console.error('Error sending verification email:', err);
      return res.status(500).send('Error sending verification email');
    });
  })
  .catch((err)=>{
    console.log('error in signUp:', err)
    return res.json({
      message:err.message
    })
  })
};

exports.accountActivation = (req, res)=>{
  const {token} = req.body;

  if(token){
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function(err, decoded) {
      if(err){
        console.log('JWT ACCOUNT ACTIVATION ERROR')
        return res.status(401).json({
          error:'expired link, signUp again'
        })
      }

      const {name, email, password} = jwt.decode(token)

      const user = new User({name, email, password})

      user.save()
      .then(()=>{
        return res.status(200).json({
          message: 'user signup succesfull, please signin'
        })
      })
      .catch(()=>{
        return res.status(400).json({
          error:'Error saving the user in database. try again signUp again'
        })
      })
    })
  }
  else {
    return res.json({
      message:'Something went wrong try again'
    })
  }
};

/*
* check if user is trying to signin but havent signup yet
* Check if password match with hashed_password that is saved in db
* if yes, generate token with expiry
* the token will be sent to client/react
* it will be used as jwt based authentication system
* we can allow user to access protected routes later if they have valid token
* so jwt token is like password with expiry
* in successful signin we will send user info and valid token
* this token will be send back to server from client/react to access protect
*/

exports.signin = (req, res)=>{
  const {email, password} = req.body

  //check if user exist

  User.findOne({email})
  .then((user)=>{
    if(user){
      if(user.authenticate(password)){
       //generate a token and sent to client
       const token = jwt.sign({_id: user._id}, process.env.JSW_SECRET,{expiresIn: '1d'});

       const {_id, name, email, role} = user
       return res.json({
        token,
        user: {_id, name, email, role}
       })
      }
      else{
        return res.status(400).json({
          error:'email and password does not match'
        })
      }
    }
    else{
      return res.status(400).json({
        error:'User with that email does not exist. please signup'
      })
    }
  })
  .catch((err)=>{
    return res.status(400).json({
      error:'User with that email does not exist. please signup'
    })
  })
}

exports.forgotPassword = (req, res)=>{
  const {email} = req.body

  User.findOne({email})
  .then((user)=>{
    
    const token = jwt.sign({ _id: user._id},
      process.env.JWT_RESET_PASSWORD, { expiresIn: '10m' });

      User.updateOne({resetPasswordLink: token})
        .then(()=>{
          const apikey = process.env.API_KEY;
          Sib.ApiClient.instance.authentications['api-key'].apiKey = apikey;
      
          const tranEmailApi = new Sib.TransactionalEmailsApi();
      
          const sender = {
            email: 'darshanrangegowda19@gmail.com',
          };
      
          const receivers = [
            {
              email: email,
            },
          ];
      
          tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: 'Password reset link',
            htmlContent: `<h2>Click here to reset password:</h2>
                 <p>${process.env.CLIENT_URL}/password/reset/${token}</p>
                 <p>${process.env.CLIENT_URL}`
      
      
          })
          .then(() => {
            return  res.json({
              message: `Email has been sent to ${email}`
            })
          } )
          .catch((err) => {
            // console.error('Error sending verification email:', err);
            res.status(500).send('Error sending verification email');
          });
        })
        .catch((err)=>{
          console.log("RESET PASSWORD LINK ERROR", err)
          return res.status(400).json({
            error: 'DATABASE CONNECTION ERROR ON USER PASSWORD FORGOT REQUEST'
          })
        })

   
  })
  .catch((err)=>{
    return res.status(400).json({
      error: "User with that email does not exist"
    }); 
  });
}


exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;

  if (resetPasswordLink) {
    jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function (err, decode) {
      if (err || !decode) { 
        return res.status(400).json({
          error: 'Link expired, please try again'
        });
      } else {
        User.findOne({ resetPasswordLink })
          .then((user) => {
            if (!user) {
              return res.status(400).json({
                error: 'User not found'
              });
            }

            const updateFields = {
              password: newPassword,
              resetPasswordLink: ''
            };

            // Use _.extend to update the user object with new fields
            user = _.extend(user, updateFields);  //merge the `updateFields` object with the existing `user` object

            user.save()
              .then(() => {
                res.json({
                  message: 'Great! Now you can login with your new password'
                });
              })
              .catch((err) => {
                return res.status(400).json({
                  error: 'Error in saving the new password'
                });
              });
          })
          .catch((err) => {
            return res.status(400).json({
              error: 'Something went wrong. Please try again'
            });
          });
      }
    });
  }
};
