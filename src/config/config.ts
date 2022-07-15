import {config} from 'dotenv';
config();

export default{

    port: process.env.PORT || 3000,
    
    dbuser: process.env.DB_USER || '',
    dbpw: process.env.DB_PW || '',
    dbserver: process.env.DB_SERVER || '',
    dbdatabase: process.env.DB_DATABASE || '',

    accountSid: process.env.ACCOUNT_SID,
    authToken: process.env.AUTH_TOKEN,
    myNumber: process.env.MY_NUMBER,

    q1: process.env.Q1,
    q1_1: process.env.Q1_1,
    q2: process.env.Q2,
    q2_1: process.env.Q2_1,
    q2_2: process.env.Q2_2,
    q3: process.env.Q3,
    q3_2: process.env.Q3_2,
    q3_3: process.env.Q3_3,
    

    secrettoken: process.env.SECRET_TOKEN

};