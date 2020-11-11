const request=require('request')

setInterval(()=> {
    request.get('https://uzbtesterbot.herokuapp.com',(error, response, body)=>{
        console.log("error:",body)
       //  console.log("response",response)
       //  console.log("body",' ',body)
   })   
//    request.post('https://automashinaboti.herokuapp.com',(error, response, body)=>{
//      console.log("error:",body)
//     //  console.log("response",response)
//     //  console.log("body",' ',body)
// })   
},30*60000)