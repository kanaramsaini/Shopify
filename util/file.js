const fs = require('fs'); 

const deletFile = (filePath) =>{
    fs.unlink (filePath,(err)=>{
        if(err){
            console.log(err)}
    })
}
exports.deletFile = deletFile;