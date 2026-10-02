# INB Health — Maia

A Maia é a agente que lê o exame da pessoa. No servidor ela monta os cards dos marcadores, diz por que cada um importa e se a evolução foi positiva ou negativa. No app, a pessoa vê esses cards e tira dúvidas com ela.

A entrada começa pelo perfil (objetivos, condições, atividade e medidas) e segue para o envio do exame. O exame de exemplo já traz 69 marcadores: 9 fora da faixa, 21 em atenção e 39 na faixa ótima.

## Acessar

```bash
npm install
npm test
npm run dev
```

Abra o endereço do Vite, em geral http://localhost:5173. A agente responde em `/api` junto com o app.
