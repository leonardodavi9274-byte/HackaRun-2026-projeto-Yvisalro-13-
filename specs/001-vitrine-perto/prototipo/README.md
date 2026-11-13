# Prototipagem inicial — hackarum-yvisalro-telasprototipo

**Feature**: [001-vitrine-perto](../spec.md)  
**Criado em**: 2026-11-13, em um canvas de design no Claude  
**Estado**: protótipo visual de alta fidelidade; serve de referência de UX e não é código de implementação.

## Onde está o material

- As imagens exportadas de cada tela estão em [docs/imagens/hackarum-yvisalro-telasprototipo/](../../../docs/imagens/hackarum-yvisalro-telasprototipo/).
- O comportamento esperado de cada tela está descrito em [docs/frontend.md](../../../docs/frontend.md).

## Identidade visual do protótipo

| Elemento | Valor |
| --- | --- |
| Formato | Celular, 390 × 844 px |
| Tipografia | Space Grotesk (títulos) e Inter (texto) |
| Fundo | `#F7F6F3` |
| Texto | `#15171C`; secundário `#5B6070` |
| Cor primária (ações) | `#C93A1E` |
| Cor de apoio | `#0F5C66` (verde-azulado) |
| Destaque de desconto | `#FFD23F` |
| Bordas | `#E4E2DD`, cantos de 12 a 16 px |

## Telas e rastreabilidade

| # | Tela | Imagem | Histórias | Requisitos |
| --- | --- | --- | --- | --- |
| 01 | Login | `01-login.png` | H2 | FR-001 |
| 02 | Criar conta (passo 1 de 2) | `02-cadastro.png` | H2 | FR-001 |
| 03 | Gostos e desejos (passo 2 de 2) | `03-preferencias.png` | H2, H5 | FR-002, FR-010, FR-011 |
| 04 | Esqueci a senha | `04-recuperacao-de-senha.png` | H2 | FR-001 |
| 05 | Home | `05-inicio.png` | H1, H5 | FR-003, FR-009, FR-011 |
| 06 | Busca e filtros | `06-resultados-da-busca.png` | H1 | FR-003, FR-004, FR-005 |
| 07 | Story de promoção | `07-story-promocional.png` | H5 | FR-009, FR-010, FR-011 |
| 08 | Lista de desejos | `08-desejos.png` | H2, H5 | FR-002, FR-010 |
| 09 | Mapa 3D — visão geral | `09-mapa.png` | H3 | FR-007, FR-008 |
| 10 | Mapa — zoom e rota | `10-rota-ativa.png` | H3 | FR-008 |
| 11 | Pop-up de loja próxima | `11-oferta-proxima.png` | H3, H5 | FR-008, FR-009 |

As telas estão agrupadas no canvas em três fluxos: **1 · Acesso e cadastro** (01–04), **2 · Descoberta e promoções** (05–08) e **3 · Mapa inteligente** (09–11).

## Lacunas em relação à especificação

O protótipo ainda não cobre:

- **H4 / FR-006**: o painel da empresa, com cadastro de produtos, preços, promoções e estoque.
- **FR-001**: os botões de login com Google e Apple.
- **FR-007**: a tela de erro “Não foi possível encontrar a localização do dispositivo” e a seleção manual do shopping.
- **FR-008 / H3**: a lista textual de lojas por andar e categoria e a escolha do ponto inicial da rota.
- **FR-013**: as landing pages.
- **Perfil e notificações**: a aba existe na barra inferior, mas não tem tela. O sino da Home também não tem destino.
- Os estados de carregamento, erro, sem conexão e busca sem resultados.

## Pontos a decidir

- **Reservar item** (tela 10): ainda não está definido se a reserva entra no MVP. O escopo atual exclui compra e pagamento. Se a reserva entrar, falta decidir como a loja confirma o pedido, por quanto tempo guarda o item e o que acontece se o estoque acabar.

## Divergências a corrigir no protótipo

- **Desconto**: de R$ 299 para R$ 229 a redução é de cerca de 23%, mas as telas 05, 06 e 09 exibem 25% (FR-009). O cálculo de 13% da Megatech, de R$ 299 para R$ 259, está correto.
- **Rota ativa**: o texto manda virar à esquerda e a seta aponta para a direita.
- **Ordenação da busca**: o rótulo “Melhor preço e promoção primeiro” não reflete a regra do FR-004 (relevância, depois menor preço, esgotados por último).
- **Login × cadastro**: o login aceita “Nome de usuário ou e-mail”, mas o cadastro só pede e-mail.
- **Nome do shopping**: o protótipo usa “Shopping Aurora” e a spec cita “Shopping Veredas Douradas” como exemplo. Os dois são fictícios; falta escolher um para a demonstração.
