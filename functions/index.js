const functions = require('firebase-functions');
var admin = require("firebase-admin");
var nunjucks = require('nunjucks')
fs = require('fs');

//Upload to bucket



const {Storage} = require('@google-cloud/storage');

// Creates a client
const storage = new Storage();



admin.initializeApp();
let db = admin.firestore();
/*

Function to add post to the firestore database.
Get a array of pst objects
Lopp over the array and adds the object to the database


Uses .set() to set the values of the post. This is so that we always update the post and dont add new post.
By changing .doc(postid).set(data) to .add(data) would make always new posts as new firestore items,

*/






async function makeHtmlPosts(posts){

    generateMenu =[]

    posts.map(async data => {

        var postData ={
            "id":data.id,
            "title": data.title.rendered,
            "slug": data.slug,
            "time": data.date,
            "desc": data.excerpt,
            "content": data.content.rendered
    }


    var menuData ={
        "id":data.id,
        "title": data.title.rendered,
        "slug": data.slug,
        "time": data.date,
        "desc": data.excerpt.rendered
    }
        // Generate the first page for the blog
        generateMenu.push(menuData)



        nunjucks.configure('templates/lifeandshell', { autoescape: true });
        var outFile = nunjucks.render('blogpage.njk',postData);
        //console.log(JSON.stringify(outFile))

        fs.writeFile('out/'+data.slug+'.html', outFile,  function (err) {
            if (err) return console.log(err);
            console.log('file written');
          });


        // Make it ready to be uploaded
        var options = {
            destination: 'blog/'+data.slug+'/index.html',
            gzip: true,
            metadata: {
                // Enable long-lived HTTP caching headers
                // Use only if the contents of the file will never change
                // (If the contents will change, use cacheControl: 'no-cache')
                cacheControl: 'public, max-age=31536000',
              },


          };


              const bucketName = 'lifeandshell'

            let fileupload = await storage.bucket(bucketName).upload('out/'+data.slug+'.html',options)
                    .catch(console.error);
                    console.log('File uploaded');


            return Promise.all([fileupload]).then(() => {
                console.log('fileupload done')  
                return "Done" 
                
            })
            .catch(function( err ) {
                console.log(err)
                return err
            })


    })

/*


Upload the blogs first page 


*/


    var menuToRender={
        "menu" : generateMenu

}
console.log(menuToRender)

    nunjucks.configure('templates/lifeandshell', { autoescape: true });
    var outFile = nunjucks.render('blog.njk',menuToRender);
    console.log(JSON.stringify(outFile))


    fs.writeFile('out/blog.html', outFile,  function (err) {
        if (err) return console.log(err);
        console.log('file written');
      });


      var options = {
        destination: 'blog/index.html',
        gzip: true,
        metadata: {
            // Enable long-lived HTTP caching headers
            // Use only if the contents of the file will never change
            // (If the contents will change, use cacheControl: 'no-cache')
            cacheControl: 'public, max-age=31536000',
          },


      };


          const bucketName = 'lifeandshell'

        let fileupload = await storage.bucket(bucketName).upload('out/blog.html',options)
                .catch(console.error);
                console.log('File uploaded');






    return "Done"




}


async function makeHtmlPages(page){

    generateMenu =[]

    page.map(async data => {

        var postData ={
            "id":data.id,
            "title": data.title.rendered,
            "slug": data.slug,
            "time": data.date,
            "desc": data.excerpt,
            "content": data.content.rendered
    }
    var menuData ={
        "id":data.id,
        "title": data.title.rendered,
        "slug": data.slug+"/",
       
    }
        // Generate the first page for the blog
        generateMenu.push(menuData)

        nunjucks.configure('templates/lifeandshell', { autoescape: true });
        //console.log(JSON.stringify(doc.data()))
        var outFile = nunjucks.render('blogpage.njk',postData);

        fs.writeFile('out/'+data.slug+'.html', outFile,  function (err) {
            if (err) return console.log(err);
            console.log('file written');
          });


        // Make it ready to be uploaded
        var options = {
            destination: data.slug+'/index.html',
            gzip: true,
            metadata: {
                // Enable long-lived HTTP caching headers
                // Use only if the contents of the file will never change
                // (If the contents will change, use cacheControl: 'no-cache')
                cacheControl: 'public, max-age=31536000',
              },


          };


              const bucketName = 'lifeandshell'

            let fileupload = await storage.bucket(bucketName).upload('out/'+data.slug+'.html',options)
                    .catch(console.error);
                    console.log('File uploaded');


            return Promise.all([fileupload]).then(() => {
                console.log('fileupload done')  
                return "Done" 
                
            })
            .catch(function( err ) {
                console.log(err)
                return err
            })


    })

/*



Making the front pag ready with the links




*/






    var menuToRender={
        "menu" : generateMenu

}
    console.log(menuToRender)

    nunjucks.configure('templates/lifeandshell', { autoescape: true });
    var outFile = nunjucks.render('index.njk',menuToRender);
    console.log(JSON.stringify(outFile))


    fs.writeFile('out/index.html', outFile,  function (err) {
        if (err) return console.log(err);
        console.log('file written');
      });


      var options = {
        destination: 'index.html',
        gzip: true,
        metadata: {
            // Enable long-lived HTTP caching headers
            // Use only if the contents of the file will never change
            // (If the contents will change, use cacheControl: 'no-cache')
            cacheControl: 'public, max-age=31536000',
          },


      };


          const bucketName = 'lifeandshell'

        let fileupload = await storage.bucket(bucketName).upload('out/index.html',options)
                .catch(console.error);
                console.log('File uploaded');

}





exports.extractPosts = functions.pubsub
      .schedule('22 * * * *')
      .onRun(async context => {
  
  
  
          console.log('Lets get some posts')
          var WPAPI = require( 'wpapi' );
          var wp = new WPAPI({ endpoint: 'https://lifeandshell.com/wp-json' });
          var Catergoies =0
          var postToAdd =[]
          let p1 = await wp.categories().get().then(function( data ) {
              Object.keys(data).map((obj, i) => {
                      if (data[obj].name=== "Linux"){
                             Catergoies =  data[obj].id 
                      }
              })
              return "Done"
          })
          .catch(function( err ) {
              console.log(err)
              return err
          });
  
  
  
  
          let p2 = await wp.posts().get().then(function( data ) {
                  data.forEach(async post => {  
                                  postToAdd.push(post) 
                      
                               }   )           
  
                       
              
          })
  
      .catch(function( err ) {
          console.log(err)
          return err
      })
         
  
      let p3 = await makeHtmlPosts(postToAdd)
  
  
      
      return Promise.all([p1, p2, p3 ]).then(() => {
              console.log('Getting data done')  
              return "Done" 
              
          })
          .catch(function( err ) {
              console.log(err)
              return err
          })
  
  
      
  })
  



  exports.extractPages = functions.pubsub
  .schedule('22 * * * *')
  .onRun(async context => {



      console.log('Lets get some posts')
      var pagesToAdd =[]
      var WPAPI = require( 'wpapi' );
      var wp = new WPAPI({ endpoint: 'https://lifeandshell.com/wp-json' });
      



      let p1 = await wp.pages().get().then(function( data ) {
              data.forEach(async page => {  
                    pagesToAdd.push(page) 

                  }) 
          
      
      return "Done"

  }).catch(function( err ) {
      console.log(err)
      return err
  })
     

  let p2 = await makeHtmlPages(pagesToAdd)


  
  return Promise.all([p1,p2 ]).then(() => {
          console.log('Getting pages')  
          return "Done" 
          
      })
      .catch(function( err ) {
          console.log(err)
          return err
      })


  
})

