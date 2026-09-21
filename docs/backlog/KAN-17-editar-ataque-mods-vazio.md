---
id: KAN-17
titulo: Editar ataque mostrava Modificadores e Maldições vazio
status: aprovado
camada: front
depende_de: [KAN-13]
---

Ver a issue no Jira: https://arkaniss.atlassian.net/browse/KAN-17

## Causa

A consulta que carrega os ataques não trazia `modifiers` — nem `image_url`,
`alternative_attacks`, `attack_bonus` e `damage_attribute`. Além de abrir vazio, isso
significava que **salvar a edição apagaria** as modificações e os ataques alternativos
que estavam gravados.

## Critérios de aceite

- [x] Editar um ataque de arma modificada mostra as modificações.
- [x] Salvar não apaga modificações nem ataques alternativos.
- [x] Ataque vindo do inventário mostra as modificações atuais do item, não a cópia do envio.

## Histórico

- 21/09/2026 criado e concluído
