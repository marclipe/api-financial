import express, { request, response } from "express";
import { v4 as uuidv4 } from "uuid";

const app = express();

const customers = [];

app.use(express.json())


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

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if(operation.type === 'credit') {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0)

  return balance;
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

app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body;

  const { customer } = request;

  const statementOperation = {
    description, 
    amount, 
    createdAt: new Date(),
    type: "credit"
  }

  customer.statement.push(statementOperation)

  return response.status(201).send();
})

app.post("/withdraw", verifyIfExistsAccountCPF, (request, response) => {
  const { amount } = request.body; 
  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return response.status(400).json({ error: "Insufficient funds!" });
  }

  const statementOperation = {
    amount,
    createdAt: new Date(),
    type: "debit",
  };
  customer.statement.push(statementOperation);

  return response.status(201).send();
})

app.get("/statement/date", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  const { date } = request.query; 

  //Quero pegar todas informações daquele dia, independente da hora
  const dateFormat = new Date(date + " 00:00"); //Precismos ter um espaço

  //Vamos percorrer o customer, para retornar apenas o extrato bancário do dia que estamos pedindo
  const statement = customer.statement
  .filter((statement) => 
  statement.createdAt.toDateString() === new Date(dateFormat).toDateString())

  return response.json(statement)
})

app.put("/account", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  const { name } = request.body;

  customer.name = name; //Vamos alterar o name

  //Se for sucesso 
  return response.status(201).send();
})

app.get("/account", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  return response.json(customer);
})

app.listen(3333);
