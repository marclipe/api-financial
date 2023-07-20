const express = require("express");
const { v4: uuidv4 } = require("uuid")

const app = express();

const customers = [];

app.use(express.json()) //Middleware com o nosso json

//Middleware de verificação de conta
function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  // Vou verificar se existe o meu customer, se não existir eu vou continuar retornando esse erro
  if (!customer) {
    return response.status(400).json({ error: "Customer not found!" });
  }

  //Para passar o customer para as minhas rotas que estou utilizando o middleware
  request.customer = customer;
  console.log(customer)

  //Se o customer existir vou deixar o processor seguir
  return next();
}

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

// app.use(verifyIfExistsAccountCPF);

app.get("/statement", verifyIfExistsAccountCPF, (request, response) => {
  //Para passar o customer para as minhas rotas que estou utilizando o middleware
  const { customer } = request; //para ter acesso o customer do middleware
  return response.json(customer.statement);
})

app.listen(3333);
