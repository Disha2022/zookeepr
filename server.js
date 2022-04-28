const express = require('express'); // require express
const fs = require('fs');
const path = require('path');
const { animals } = require('./data/animals');
const PORT = process.env.PORT || 3001;
const app = express(); //instantiate the server


// parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data
app.use(express.json());
//================================================================

function filterByQuery(query, animalsArray) {
  let personalityTraitsArray = [];
  //save the anuimal array with filtered result here:
    let filteredResults = animalsArray;
  if (query.personalityTraits) {
    //save personality traits as a dedicated array
    //If personality trait is a string, place it into a new array and save
    if (typeof query.personalityTraits === 'string') {
      personalityTraitsArray = [query.personalityTraits];// why this one is out in bracket but line 26 is not?
    } else {
      personalityTraitsArray = query.personalityTraits;
    }
    //loop through each trait in personality trait array
    personalityTraitsArray.forEach(trait => {
           // Check the trait against each animal in the filteredResults array.
      // Remember, it is initially a copy of the animalsArray,
      // but here we're updating it for each trait in the .forEach() loop.
      // For each trait being targeted by the filter, the filteredResults
      // array will then contain only the entries that contain the trait,
      // so at the end we'll have an array of animals that have every one 
      // of the traits when the .forEach() loop is finished.

      filteredResults = filteredResults.filter(
        (animal) => animal.personalityTraits.indexOf(trait) !== -1
      );
    });
  }

  if (query.diet) {
    filteredResults = filteredResults.filter(
      (animal) => animal.diet === query.diet
    );
  }
  if (query.species) {
    filteredResults = filteredResults.filter(
      (animal) => animal.species === query.species
    );
  }
  if (query.name) {
    filteredResults = filteredResults.filter(
      (animal) => animal.name === query.name
    );
  }
  return filteredResults;
}

function findById (id, animalsArray) {
  const result = animalsArray.filter(animal => animal.id === id)[0];
  return result;
}
//===================================================================
function createNewAnimal(body, animalsArray) {
//our functions main code will go here
const animal = body;
animalsArray.push(animal);
fs.writeFileSync(
  path.join(__dirname,'./data/animals.json'),
  JSON.stringify({animals: animalsArray},null,2)
);
//return finished code to post the route for response
return animal;
}
//===========================================================
function validateAnimal(animal) {
  if (!animal.name || typeof animal.name !== 'string') {
    return false;
  }
  if (!animal.species || typeof animal.species !== 'string') {
    return false;
  }
  if (!animal.diet || typeof animal.diet !== 'string') {
    return false;
  }
  if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
    return false;
  }
  return true;
}
//=====================================================================
//route==describes the route the client will have to fetch from
app.get('/api/animals', (req, res) => {
  let results = animals;
  if (req.query) {
    results = filterByQuery(req.query, results);
  }
  res.json(results);
});

  app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
      res.json(result);
    } else {
      res.send(404);
    }
  });
//============================================================================
app.post('/api/animals',(req,res) => {
  console.log(req.body)
   // set id based on what the next index of the array will be
   req.body.id = animals.length.toString();
// if any data in req.body is incorrect, send 400 error back
if (!validateAnimal(req.body)) {
  res.status(400).send('The animal is not properly formatted.');
} else {
  // add animal to json file and animals array in this function
   const animal = createNewAnimal(req.body, animals);
    // req.body is where our incoming content will be
    res.json(animal);
    
  }

});
//==========================================================================
app.listen(PORT, () => {
  console.log(`API Server now on port ${PORT}!`); // where is the port from?
});
