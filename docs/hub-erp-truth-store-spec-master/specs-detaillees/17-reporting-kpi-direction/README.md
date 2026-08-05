# Module 17 - Reporting / KPI / Direction

## Objectif

Décrire les écrans et actions de consultation des KPI commerciaux, projet/finance et maintenance.

## Fichiers

- [01-kpi-commerciaux.md](./01-kpi-commerciaux.md)
- [02-kpi-projet-finance.md](./02-kpi-projet-finance.md)
- [03-kpi-maintenance.md](./03-kpi-maintenance.md)
## Liens documentaires

- Relation -> [GRAPHE-DOCUMENTAIRE.md](../GRAPHE-DOCUMENTAIRE.md) : vue synthétique des dépendances principales du module dans le graphe global
- Relation -> [Matrice module 17](../../matrices/17-reporting-kpi-direction.md) : synthèse structurée des objets métier, use cases, règles, permissions et états du module
- Relation -> [use-cases.md](../../use-cases.md) : cas d’usage de référence du module pour reporting / kpi / direction
- Relation -> [user-stories.md](../../user-stories.md) : attentes exprimées côté utilisateur pour reporting / kpi / direction
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences fonctionnelles à décliner pour reporting / kpi / direction
- Relation -> [business-rules.md](../../business-rules.md) : règles métier structurantes pour reporting / kpi / direction
- Relation -> [permissions.md](../../permissions.md) : habilitations et rôles associés pour reporting / kpi / direction
- Relation -> [state-transitions.md](../../state-transitions.md) : transitions d’état concernées pour reporting / kpi / direction
- Relation -> [edge-cases.md](../../edge-cases.md) : cas limites à rejouer en recette pour reporting / kpi / direction
- Relation -> [user-flows.md](../../user-flows.md) : parcours opérationnels de référence pour reporting / kpi / direction

## Liens inter-modules

- Relation -> [Module 02 - Avant-vente](../02-avant-vente/README.md) : les KPI commerciaux dépendent du flux offre et de la décision client
- Relation -> [04-decision-client-historique.md](../02-avant-vente/04-decision-client-historique.md) : le taux de transformation se calcule à partir des décisions client
- Relation -> [Module 04 - Budget / Pilotage financier projet](../04-budget-pilotage-financier-projet/README.md) : marge prévue, marge réelle et écarts de budget alimentent les KPI
- Relation -> [03-suivi-ecarts-marge.md](../04-budget-pilotage-financier-projet/03-suivi-ecarts-marge.md) : les écarts de marge servent de base aux indicateurs financiers
- Relation -> [Module 10 - Coûts analytiques / Rentabilité](../10-couts-analytiques-rentabilite/README.md) : les KPI de rentabilité consomment le coût réel et la marge
- Relation -> [03-rentabilite-marge.md](../10-couts-analytiques-rentabilite/03-rentabilite-marge.md) : la rentabilité alimente les tableaux de bord direction
- Relation -> [Module 12 - Facturation](../12-facturation/README.md) : les KPI financiers dépendent des factures émises et du reste à facturer
- Relation -> [Module 13 - Encaissement / Recouvrement](../13-encaissement-recouvrement/README.md) : le cash, le DSO et les encaissements alimentent les vues direction
- Relation -> [Module 14 - SAV / Maintenance / Ticketing](../14-sav-maintenance-ticketing/README.md) : les KPI de maintenance suivent tickets, SLA et résolution
- Relation -> [Module 18 - Vue transverse Affaire / Projet](../18-vue-transverse-affaire-projet/README.md) : les KPI peuvent être lus au niveau du cockpit projet

## Liens internes

- Relation -> [01-kpi-commerciaux.md](./01-kpi-commerciaux.md) : pilote la performance commerciale et le carnet de commandes
- Relation -> [02-kpi-projet-finance.md](./02-kpi-projet-finance.md) : suit la rentabilité, le coût, l’avancement et le cash projet
- Relation -> [03-kpi-maintenance.md](./03-kpi-maintenance.md) : synthétise les KPI support et maintenance

