const User = require('../models/user');
const fs = require('fs');
const path = require('path');
const usersMailer = require('../mailers/users_mailer');
const crypto  = require('crypto')
const user = require('../models/user');


//render the profile
module.exports.profile = function(req, res){
    User.findById(req.params.id, function(err, user){
        return res.render('user_profile', {
            title: 'User Profile',
            profile_user: user
        });
    });

}





// render the sign up page
module.exports.signUp = function(req, res){
    if (req.isAuthenticated()){
        return res.redirect('/users/profile');
    }


    return res.render('user_sign_up', {
        title: "Sign Up"
    })
}


// render the sign in page
module.exports.signIn = function(req, res){

    if (req.isAuthenticated()){
        return res.redirect('/users/profile');
    }
    return res.render('user_sign_in', {
        title: " Sign In"
    })
}

// get the sign up data
module.exports.create = function(req, res){

    //------------ Checking password mismatch ------------//
    if (req.body.password != req.body.password2){
        req.flash('error', 'Passwords do not match');
        return res.redirect('back');
    }
 //------------ Validation passed ------------//
    User.findOne({email: req.body.email}, function(err, user){
        if(err){req.flash('error', err); return}


 //------------ if user is not found create user------------//
        if (!user){
            User.create(req.body, function(err, user){
                if(err){req.flash('error', err); return}

                return res.redirect('/users/sign-in');
            })
        }else{
            req.flash('success', 'You have signed up, login to continue!');
            return res.redirect('back');
        }

    });
}


// sign in and create a session for the user
module.exports.createSession = function(req, res){
    req.flash('success', 'Logged in Successfully');
    return res.redirect('/users/profile');
}

// signout to user
module.exports.destroySession = function(req, res){
    req.logout();
    req.flash('success', 'You have logged out!');


    return res.redirect('/');
}

 //------------ resetPassword ------------//
module.exports.resetPassword = function(req, res)
{
    return res.render('reset_password',
    {
        title: ' Reset Password',
        access: false
    });
}
 //------------ reset password mail ------------//
module.exports.resetPassMail = function(req, res)
{
    User.findOne({email: req.body.email}, function(err, user)
    {
        if(err)
        {
            console.log('Error in finding user', err);
            return;
        }
        if(user)
        {
            if(user.isTokenValid == false)
            {
                user.accessToken = crypto.randomBytes(30).toString('hex');
                user.isTokenValid = true;
                user.save();
}



            usersMailer.resetPassword(user);
            if (req.xhr){
                
    
                return res.status(200).json({
                    data: {
                        user: user
                    },
                    message: "reset password!"
                });
            }
            

           

            req.flash('success', 'Password reset link sent. Please check your mail');
            return res.redirect('/');
        }
        else
        {
            req.flash('error', 'User not found. Try again!');
            return res.redirect('back');
        }
    });
}
 //------------set password ------------//
module.exports.setPassword = function(req, res)
{
    User.findOne({accessToken: req.params.accessToken}, function(err, user)
    {
        if(err)
        {
            console.log('Error in finding user', err);
            return;
        }
        if(user.isTokenValid)
        {
            return res.render('reset_password',
            {
                title: 'Codeial | Reset Password',
                access: true,
                accessToken: req.params.accessToken
            });
        }
        else
        {
            req.flash('error', 'Link expired');
            return res.redirect('/users/reset-password');
        }
    });
}


 //------------ update password ------------//
module.exports.updatePassword = function(req, res)
{
    User.findOne({accessToken: req.params.accessToken}, function(err, user)
    {
        if(err)
        {
            console.log('Error in finding user', err);
            return;
        }
        if(user.isTokenValid)
        {
            if(req.body.newPass == req.body.confirmPass)
            {
                user.password = req.body.newPass;
                user.isTokenValid = false;
                user.save();
                req.flash('success', "Password updated. Login now!");
                return res.redirect('/users/sign-in') 
            }
            else
            {
                req.flash('error', "Passwords don't match");
                return res.redirect('back');
            }
        }
        else
        {
            req.flash('error', 'Link expired');
            return res.redirect('/users/reset-password');
        }
    });
}
