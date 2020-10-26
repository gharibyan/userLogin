const express = require('express');
const app = express()
const {pool} = require('./dbConfig')
const bcrypt = require('bcrypt')
const session = require('express-session')
const flash = require('express-flash')   
const PORT = process.env.PORT || 4000; 
const initializePassport = require("./passportConfig")
const passport = require("passport");
const { use } = require('passport');


async function getUsersInfo(id) {
    try {
      const usersInfo = await pool.query(
        `SELECT info FROM users WHERE id=$1`
      ,[id]);
      return usersInfo;
    } catch (err) {
        console.log(err);
      throw err;
    }
  }

  async function callGetUsersInfo (id) {
    var result = await getUsersInfo(id);
    return result;
 }  

async function updateUsersInfo(usersUpdateRequestBody){
    let userID = Object.keys(usersUpdateRequestBody)[0];
        pool.query(`UPDATE users 
        SET info = $1
        WHERE id = $2`, [usersUpdateRequestBody[userID], userID], (err, results) => {
        if (err) {
            throw err;
        }
    });
      }

async function callUpdateUsersInfo(usersUpdateRequestBody) {
    await updateUsersInfo(usersUpdateRequestBody);
    var result = await callGetUsersInfo(Object.keys(usersUpdateRequestBody)[0]);
    return result;
 }  

    async function getUsersList() {
        try {
          var usersList = await pool.query(
            `SELECT * FROM users WHERE status = 'pending'`
          );
          return usersList.rows;
        } catch (err) {
            console.log(err);
          throw err;
        }
      }

    async function callGetUsersList () {
        var result = await getUsersList();
        return result;
     }  
    
    async function updateUsersList(usersUpdateRequestBody){
        for (var key in usersUpdateRequestBody){
            pool.query(`UPDATE users 
            SET status = $1
            WHERE id = $2`,[usersUpdateRequestBody[key],key],(err, results) => {
                console.log("this is update query", results)
              if (err) {
                throw err;
              }
            });
          }
    }
    async function callUpdateUsersList (usersUpdateRequestBody) {
        await updateUsersList(usersUpdateRequestBody);
        console.log("i am here")
        result = await callGetUsersList();
        console.log("i am there")
        return result1;
     }  

module.exports = {callGetUsersList, callUpdateUsersList,callGetUsersInfo,callUpdateUsersInfo};

