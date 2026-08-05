# Spécifications détaillées

Ce dossier contient la version détaillée de la spécification fonctionnelle de l'application.

Le niveau visé est un niveau quasi prêt pour :

- conception produit
- cadrage dev
- préparation QA / recette
- préparation écrans et API

## Structure

Chaque module possède son propre sous-dossier.

Dans chaque sous-dossier :

- un `README.md` donne la vue d'ensemble du module
- un fichier par concept ou par flow documente les actions clés
- des sections de liens rendent les dépendances explicites pour lecture ou graphe

## Modules

- [01 - Référentiel](./01-referentiel/README.md)
- [02 - Avant-vente](./02-avant-vente/README.md)
- [03 - Contrats / Affaires / Projets](./03-contrats-affaires-projets/README.md)
- [04 - Budget / Pilotage financier projet](./04-budget-pilotage-financier-projet/README.md)
- [05 - Achats](./05-achats/README.md)
- [06 - Stock / Logistique / Magasin](./06-stock-logistique-magasin/README.md)
- [07 - Exécution terrain / Ordres de travail](./07-execution-terrain-ordres-de-travail/README.md)
- [08 - PV / Preuves de réalisation](./08-pv-preuves-de-realisation/README.md)
- [09 - Temps / Ressources / Pointage](./09-temps-ressources-pointage/README.md)
- [10 - Coûts analytiques / Rentabilité](./10-couts-analytiques-rentabilite/README.md)
- [11 - BTP / Avancement / Attachements / Situations](./11-btp-avancement-attachements-situations/README.md)
- [12 - Facturation](./12-facturation/README.md)
- [13 - Encaissement / Recouvrement](./13-encaissement-recouvrement/README.md)
- [14 - SAV / Maintenance / Ticketing](./14-sav-maintenance-ticketing/README.md)
- [15 - Planning / Coordination opérationnelle](./15-planning-coordination-operationnelle/README.md)
- [16 - Gouvernance / Validation / Contrôle interne](./16-gouvernance-validation-controle-interne/README.md)
- [17 - Reporting / KPI / Direction](./17-reporting-kpi-direction/README.md)
- [18 - Vue transverse Affaire / Projet](./18-vue-transverse-affaire-projet/README.md)

## Graphes

- Relation -> [GRAPHE-DOCUMENTAIRE.md](./GRAPHE-DOCUMENTAIRE.md) : vue synthétique des liens forts entre modules.
- Relation -> [GRAPHE-LIENS.md](./GRAPHE-LIENS.md) : vue complète reliant sources racines, matrices, modules et grands flux inter-modules.
- Relation -> [CATALOGUE-ECRANS.md](./CATALOGUE-ECRANS.md) : catalogue d'écrans cible déduit de toute la base de spécification.
- Relation -> [SITEMAP-ERP.md](./SITEMAP-ERP.md) : arborescence complète de navigation ERP déduite des écrans et des user flows.

## Format des fiches

Chaque fiche suit la même structure :

1. `Écran / action`
2. `Input`
3. `Traitement système`
4. `Output`
5. `Règle métier`
6. `Exception`
7. `Liens documentaires`
8. `Liens inter-modules`

## Convention de liens

Chaque lien doit expliciter :

- la relation métier ou documentaire
- le fichier cible
- la raison du lien

Format recommandé :

- `Relation -> [fichier](chemin) : explication`

Relations typiques :

- `Appartient à`
- `S'appuie sur`
- `Contraint par`
- `Déclenche`
- `Alimente`
- `Dépend de`
- `Partage le workflow avec`
- `Est consolidé dans`
- `Est piloté par`

## Convention de rédaction

- Rester au niveau fonctionnel, pas au niveau technique bas niveau.
- Être assez précis pour guider produit, dev et QA.
- Décrire le cas nominal, puis les contrôles et les cas d'exception.
- Garder les noms métier cohérents avec les fichiers source du dossier racine.
- Référencer explicitement les objets métier clés : projet, affaire, OT, PV, DA, ticket, facture, etc.

## Sources

- [problems-goals.md](../problems-goals.md)
- [use-cases.md](../use-cases.md)
- [user-stories.md](../user-stories.md)
- [functionnal-requirements.md](../functionnal-requirements.md)
- [acceptance-criteria.md](../acceptance-criteria.md)
- [business-rules.md](../business-rules.md)
- [permissions.md](../permissions.md)
- [state-transitions.md](../state-transitions.md)
- [edge-cases.md](../edge-cases.md)
- [user-flows.md](../user-flows.md)
- [matrices/README.md](../matrices/README.md)
