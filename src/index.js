const express = require("express");
const { v4: uuidv4 } = require("uuid")

const app = express();

const customers = [];

app.use(express.json())

//Middleware de verificação de conta
function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({ error: "Customer not found!" });
  }

  request.customer = customer;
  console.log(customer)

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
  const { customer } = request;
  return response.json(customer.statement);
})

//Vamos precisar do Middleware de verificação 
app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
  //Precisamos dessas informações dentro do  statement: []
  const { description, amount } = request.body;

  const { customer } = request; //verifica se a conta é válida ou não

  const statementOperation = {
    description, 
    amount, 
    createdAt: new Date(),
    type: "credit"
  }

  //Para inserir essa operação dentro do meu Customer
  //Sempre que a gente fizer um operação ele vai inserir dentro statement
  customer.statement.push(statementOperation)

  //Se der sucesso
  return response.status(201).send();
})

app.listen(3333);
