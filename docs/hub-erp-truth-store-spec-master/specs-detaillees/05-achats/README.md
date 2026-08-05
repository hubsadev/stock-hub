# Module 5 — Achats

Ce module couvre l'expression de besoin, la création et validation des demandes d'achat, puis la consultation fournisseurs et la commande.

## Fiches

- `01-expression-de-besoin.md`
- `02-da-validation.md`
- `03-consultation-fournisseurs-commandes.md`

## Liens documentaires

- Relation -> [matrices/05-achats.md](../../matrices/05-achats.md) : matrice source du module achats et de ses circuits.
- Relation -> [use-cases.md](../../use-cases.md) : cas d'usage de besoin, validation DA, consultation et commande.
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences de contrôle du besoin et de génération des commandes.
- Relation -> [business-rules.md](../../business-rules.md) : règles de rattachement, de validation et d'engagement fournisseur.
- Relation -> [permissions.md](../../permissions.md) : droits du terrain, du magasin, des achats et des valideurs.
- Relation -> [state-transitions.md](../../state-transitions.md) : états de besoin, DA et commande fournisseur.
- Relation -> [edge-cases.md](../../edge-cases.md) : reliquat, circuit absent, commande partielle, prix qui varie.
- Relation -> [user-flows.md](../../user-flows.md) : parcours du besoin terrain jusqu'à la commande.

## Liens inter-modules

- Relation -> [../01-referentiel/01-tiers.md](../01-referentiel/01-tiers.md) : les fournisseurs et demandeurs s'appuient sur le référentiel tiers.
- Relation -> [../01-referentiel/02-articles-prestations.md](../01-referentiel/02-articles-prestations.md) : les demandes d'achat utilisent le catalogue articles et prestations.
- Relation -> [../04-budget-pilotage-financier-projet/01-budget-initial.md](../04-budget-pilotage-financier-projet/01-budget-initial.md) : le budget conditionne les engagements d'achat.
- Relation -> [../06-stock-logistique-magasin/01-reception-fournisseur.md](../06-stock-logistique-magasin/01-reception-fournisseur.md) : la commande validée se traduit ensuite en réception fournisseur.

## Liens internes

- Relation -> [01-expression-de-besoin.md](./01-expression-de-besoin.md) : formalisation du besoin terrain et du stock disponible.
- Relation -> [02-da-validation.md](./02-da-validation.md) : création, soumission et décision de la demande d'achat.
- Relation -> [03-consultation-fournisseurs-commandes.md](./03-consultation-fournisseurs-commandes.md) : consultation fournisseurs et génération des commandes.
