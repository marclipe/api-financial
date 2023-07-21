import express, { response } from "express";
import { v4 as uuidv4 } from "uuid";

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
//Para saber quanto tem em conta, a gente vai receber o statement que é quem vai armazenar as informações da nossa conta. 
function getBalance(statement) {
  //A função reduce vai pegar as info de determinado valor e vai transformar em valor somente.
  //O cálculo daquilo que entrou menos o cálculo daquilo que saiu
  //acc = acumulador e operation = o objeto que queremos alterar 
  //débito subtrai, crédito adiciona
  const balance = statement.reduce((acc, operation) => {
    if(operation.type === 'credit') {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0) //Vamos iniciar o nosso reduce em 0

  return balance; //ele vai retornar calculando o crédito e débito
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
  const { amount } = request.body; //A quantia que a gente quer fazer o saque
  const { customer } = request; //Para a gente pegar as informações de quanto ele tem em conta.

  const balance = getBalance(customer.statement); //customer.statement é onde vão ficar nossas operações

  //Não tem como sacar valores maior do que eu tenho em conta
  if (balance < amount) {
    return response.status(400).json({ error: "Insufficient funds!" });
  }

  //Se tiver dinheiro suficiente em conta
  const statementOperation = {
    amount,
    createdAt: new Date(),
    type: "debit",
  };

  //A gente insere o nossa operação de statementOperation no customer
  customer.statement.push(statementOperation);

  return response.status(201).send();
})

app.listen(3333);
