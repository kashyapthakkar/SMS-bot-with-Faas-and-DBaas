/*
"StAuth10065: I Kashyap Thakkar, 000742712 certify that this material is my original work. No other person's work has been used without due acknowledgement. I have not made my work available to anyone else."
*/
const axios = require('axios');
var redis = require("redis");

client = 
  redis.createClient(
     {url: "redis://redis-17808.c82.us-east-1-2.ec2.cloud.redislabs.com:17808"
     ,password: "IzsWGDaTb6qQS84okfLy2E0Jc0rvzBom"
     }
  );

async function test(user)
{
  try {  
    var url = 'https://api.github.com/users/' + user;
    const response1 = await axios.get(url);
    return response1.data.public_repos;
    
  } catch (error) {
    console.error(error);
  }
}

async function reqredis(data)
{
  try {  
    client.set("status", JSON.stringify(data));
    
  } catch (error) {
    console.error(error);
  }
  
}///


exports.handler = async function(context, event, callback) {
    	
    let twiml = new Twilio.twiml.MessagingResponse();
    var message = event.Body.toLowerCase();
    const temp = await test("test");
    if(message.startsWith("get repos")){
        var username = message.replace("get repos ", "");
        const apiResponse = await test(username);
        twiml.message(
            "\n\n\n" + "User " + username + " has " + apiResponse + " public repositories."
        );    
    }else if(message.startsWith("update")){
        message = message.replace("update ", "");
        var messageWords = message.split(" ");
        
        var userStatus = messageWords[0];
        var userMessage = message.substr(message.indexOf(" ") + 1);
        
        var data = {
            "userStatus": userStatus,
            "userMessage": userMessage
        }
        const apiResponse = await reqredis(data);
        
        
        twiml.message(
            "\n\n\n" + "Data inserted."
        ); 
        
    }else if(message.startsWith("helpme")){
        twiml.message(
            "\n\n\n" + "1. Get Repos username: This command shows the number of github public repositories of user, Where 'username' is the username of user on github." +
            "\n\n\n" + "2. Update Status Message: This command inserts the status and message into the redis database." + 
            "\n\n\n" + "3. helpme: This command replies back with a list of the all available commands" +
            "\n\n\n" + "4. help command: This command gives instructions on how that specific command works."
        );
    }else if(message.startsWith("help")){
        message = message.replace("help ", "");
        if(message.startsWith("get repos")){
            twiml.message(
                "\n\n\n" + "This command shows the number of github public repositories of user, Where 'username' is the username of user on github. For example 'Get Repos kashyapthakkar' will give you the number of public repositories that kashyapthakkar have on github."
            );              
        }else if(message.startsWith("update")){
            twiml.message(
                "\n\n\n" + "This command inserts the status and message into the redis database. For example 'Update error something went wrong' will update status key to 'error' and message key to 'something went wrong' in redis database, will update the dashboard, and will insert the new data into sqlite database."
            );           
        }else if(message.startsWith("helpme")){
            twiml.message(
                "\n\n\n" + "This command replies back with a list of the all available commands. For example 'helpme' command will give you brief information about all the available commands."
            );            
        }else if(message.startsWith("help")){
            twiml.message(
                "\n\n\n" + "help command: This command gives instructions on how that specific command works. For example 'help Get Repos' gives an instrusction about how 'Get repo' command works."
            );           
        }else{
            twiml.message(
                "\n\n\n" + "Command doesn't exists."
            );
        }
    }else{
        twiml.message(
            "\n\n\n" + "Invalid Command"
        );
    }
    
    
    // sends back the message
    callback(null, twiml);    

};