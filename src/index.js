const express = require("express");
const { v4: uuidv4 } = require("uuid")

const app = express();

const customers = [];

app.use(express.json()) //Middleware com o nosso json

/*
* cpf - string 
* name - string
* id - uuid
* statement []
*/

app.post("/account", (request, response) => {
  const {cpf, name} = request.body; 

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if(customerAlreadyExists) {
    return response.status(400).json({error: "Customer already Exists!"})
  }

  customers.push({
    cpf, 
    name, 
    id: uuidv4(), 
    statement: []
  })

  return response.status(201).send();
})

app.get("/statement/:cpf", (request, response) => {
  const { cpf } = request.params; //A gente vai buscar o cpf do nosso cliente pelos Route Params

  //A gente precisa buscar o nosso cliente, precisamos recuperar statement  
  //find é porque precisamos retornar retornar todos os dados 
  const customer = customers.find(customer => customer.cpf === cpf);
  console.log(customer.statement);

  //Se existir ele vai retornar o customer dentro do statement 
  return response.json(customer.statement);
})

app.listen(3333);
