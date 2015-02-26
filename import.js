var torii = require(__dirname + '/torii.conf.js').torii;
var mongoose = require('mongoose');
mongoose.connect('mongodb://' + torii.conf.db.host + '/' + torii.conf.db.user);

var account = require(__dirname + '/model/account');
var rbac = require('mongoose-rbac');
var role = rbac.Role;
var permission = rbac.Permission;

var userRole = 'user'

var csv = require("fast-csv");

var nodemailer = require('nodemailer');
var transport = null;
if (torii.conf.mail.service == 'smtp') {
  transport = require('nodemailer-smtp-transport');
} else {
  transport = require('nodemailer-sendmail-transport');
}

if (transport == null) {
  throw Error('Mail transport not setup, please check your configuration file');
}

/*var emailSetup = {};

    if(torii.conf.mail.host){
      emailSetup =  {
      host: torii.conf.mail.host,
      port: torii.conf.mail.port,
      secureConnection: torii.conf.mail.secureConnection,
      auth: {
        user: torii.conf.mail.user,
        pass: torii.conf.mail.pass
        }
      };

    }

var mail = nodemailer.createTransport(transport(emailSetup));*/

csv
  .fromPath("user.csv", {
    headers: false,
    delimiter: ';'
  })
  .on("data", function(data) {
    console.log(data);

    account.register(new account({
      username: data[0]
    }), data[3], function(err, account) {

      if (err) {
        console.log(err)
        return
      }

      account.name = data[1]
      account.surname = data[2]
      account.addRole(userRole, function(err) {
        console.log(err)
      })
      account.save()

      /*var mailOptions = {
        from: torii.conf.mail.from,
        to: data[0],
        subject: torii.conf.core.title + ' - Password Confirmation',
        text: 'Dear ' + data[1] + ' ' + data[2] + '\n here your password: ' + data[3] + '\n\nPlease store it!'
      };

      mail.sendMail(mailOptions, function(err, info) {
        if (err) {
          console.log(err);
          return;
        }

        console.log(info);
      });*/

    });

  })
  .on("end", function() {
    console.log("all users imported");
  });
