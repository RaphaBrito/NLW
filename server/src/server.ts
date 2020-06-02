import express from 'express';

const app = express();

app.get('/users', (request, response) => {
  console.log('Listagem de Usuários');

  //response.send('Hello World!!');
  response.json([
    'Raphael',
    'Letícia',
    'Júlia',
    'Betânia',
    'Mauricio',
    'Manoel',
    'Ana Maria',
  ]);
});

app.listen(3333);
