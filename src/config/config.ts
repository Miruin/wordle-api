import {config} from 'dotenv';
config();

export default{

    port1: process.env.PORT1 || 8080,
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
    q4: process.env.Q4,
    q5: process.env.Q5,
    q6: process.env.Q6,
    q7: process.env.Q7,
    q8: process.env.Q8,
    q9: process.env.Q9,
    q9_1: process.env.Q9_1,
    q10: process.env.Q10,
    q10_1: process.env.Q10_1,
    q11: process.env.Q11,
    

    secrettoken: process.env.SECRET_TOKEN

};