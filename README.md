# INB Health — Maia

A Maia é a agente que lê o exame da pessoa. Ela monta os cards dos marcadores, diz por que cada um importa e se a evolução foi positiva ou negativa. No app, a pessoa vê esses cards e tira dúvidas com ela.

A entrada começa pelo perfil (objetivos, condições, atividade e medidas) e segue para o envio do exame. O exame de exemplo já traz 69 marcadores: 9 fora da faixa, 21 em atenção e 39 na faixa ótima.

## Ambiente de teste

Abra:

https://htmlpreview.github.io/?https://github.com/mobzstudio/INB-app/blob/cursor/maia-pagina-teste-dc9a/index.html

A página está no repositório, no branch `cursor/maia-pagina-teste-dc9a`. O GitHub não executa o servidor, então essa versão leva a mesma agente no navegador.

O endereço https://mobzstudio.github.io/INB-app/ só passa a responder depois que o Pages for ligado em https://github.com/mobzstudio/INB-app/settings/pages (fonte: GitHub Actions). Essa opção pede permissão de administrador do repositório.

## Acessar no computador

```bash
npm install
npm test
npm run dev
```

Abra o endereço do Vite, em geral http://localhost:5173.
