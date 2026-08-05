# Module 16 - Gouvernance / Validation / Contrôle interne

## Objectif

Décrire les circuits de validation, la traçabilité des décisions et les mécanismes de blocage associés.

## Fichiers

- [01-circuits-validation.md](./01-circuits-validation.md)
- [02-decisions-tracabilite.md](./02-decisions-tracabilite.md)
- [03-blocage-controle-interne.md](./03-blocage-controle-interne.md)
## Liens documentaires

- Relation -> [GRAPHE-DOCUMENTAIRE.md](../GRAPHE-DOCUMENTAIRE.md) : vue synthétique des dépendances principales du module dans le graphe global
- Relation -> [Matrice module 16](../../matrices/16-gouvernance-validation-controle-interne.md) : synthèse structurée des objets métier, use cases, règles, permissions et états du module
- Relation -> [use-cases.md](../../use-cases.md) : cas d’usage de référence du module pour gouvernance / validation / contrôle interne
- Relation -> [user-stories.md](../../user-stories.md) : attentes exprimées côté utilisateur pour gouvernance / validation / contrôle interne
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences fonctionnelles à décliner pour gouvernance / validation / contrôle interne
- Relation -> [business-rules.md](../../business-rules.md) : règles métier structurantes pour gouvernance / validation / contrôle interne
- Relation -> [permissions.md](../../permissions.md) : habilitations et rôles associés pour gouvernance / validation / contrôle interne
- Relation -> [state-transitions.md](../../state-transitions.md) : transitions d’état concernées pour gouvernance / validation / contrôle interne
- Relation -> [edge-cases.md](../../edge-cases.md) : cas limites à rejouer en recette pour gouvernance / validation / contrôle interne
- Relation -> [user-flows.md](../../user-flows.md) : parcours opérationnels de référence pour gouvernance / validation / contrôle interne

## Liens inter-modules

- Relation -> [Module 02 - Avant-vente](../02-avant-vente/README.md) : les offres et devis peuvent être soumis à validation avant envoi
- Relation -> [03-validation-et-envoi-offre.md](../02-avant-vente/03-validation-et-envoi-offre.md) : la validation des offres est un cas d’usage direct du module
- Relation -> [Module 04 - Budget / Pilotage financier projet](../04-budget-pilotage-financier-projet/README.md) : les budgets et révisions suivent des circuits de validation
- Relation -> [02-validation-revision-budget.md](../04-budget-pilotage-financier-projet/02-validation-revision-budget.md) : les révisions budgétaires ne deviennent actives qu’après validation
- Relation -> [Module 05 - Achats](../05-achats/README.md) : les demandes d’achat dépendent d’un circuit d’approbation
- Relation -> [02-da-validation.md](../05-achats/02-da-validation.md) : la validation des DA est une cible directe des règles internes
- Relation -> [Module 12 - Facturation](../12-facturation/README.md) : certaines corrections ou blocages peuvent impacter la facturation
- Relation -> [Module 13 - Encaissement / Recouvrement](../13-encaissement-recouvrement/README.md) : les décisions de remises ou d’ajustement doivent être tracées
- Relation -> [Module 18 - Vue transverse Affaire / Projet](../18-vue-transverse-affaire-projet/README.md) : les blocages et décisions doivent remonter dans le cockpit projet

## Liens internes

- Relation -> [01-circuits-validation.md](./01-circuits-validation.md) : définit les circuits et les niveaux d’approbation
- Relation -> [02-decisions-tracabilite.md](./02-decisions-tracabilite.md) : trace les décisions et arbitrages pris sur les objets métier
- Relation -> [03-blocage-controle-interne.md](./03-blocage-controle-interne.md) : décrit les règles de blocage et d’empêchement opérationnel

