# Catalogue des écrans

Ce document n'est pas une extraction brute des labels `Écran` présents dans les fiches.
Il s'agit d'un catalogue d'écrans cible, déduit de l'ensemble de la base `spec-truth` :

- fiches détaillées par module
- matrices de synthèse
- documents sources métier

Principe de construction :

- un même écran regroupe ses onglets, actions et variantes quand ils relèvent de la même surface produit
- les écrans de type liste, fiche, formulaire, file de travail, dashboard, cockpit ou planning sont distingués
- les écrans purement techniques ou d'infrastructure non décrits dans la spec ne sont pas inventés ici

## Règles de lecture

- `Nature` décrit le type d'écran cible
- `Couverture déduite` explique pourquoi l'écran existe dans l'application cible
- `Sources` pointe vers les fiches qui ont servi à le déduire

## Module 01 - Référentiel


| ID        | Écran cible                            | Nature      | Couverture déduite                                                                                      | Sources                                                                                                                            |
| --------- | -------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| ECR-01-01 | Catalogue des tiers                    | Liste       | Recherche, filtrage et entrée de création des clients et fournisseurs.                                  | [01-tiers.md](./01-referentiel/01-tiers.md), [04-consultation-desactivation.md](./01-referentiel/04-consultation-desactivation.md) |
| ECR-01-02 | Fiche tiers                            | Fiche       | Création, modification, activation, désactivation et historique d'un client ou fournisseur.             | [01-tiers.md](./01-referentiel/01-tiers.md), [04-consultation-desactivation.md](./01-referentiel/04-consultation-desactivation.md) |
| ECR-01-03 | Catalogue articles et prestations      | Liste       | Consultation et entrée de création du catalogue exploité par avant-vente, achats et stock.              | [02-articles-prestations.md](./01-referentiel/02-articles-prestations.md)                                                          |
| ECR-01-04 | Fiche article ou prestation            | Fiche       | Paramétrage détaillé, activation/inactivation et maintenance des attributs métier.                      | [02-articles-prestations.md](./01-referentiel/02-articles-prestations.md)                                                          |
| ECR-01-05 | Référentiel sites et dépôts            | Liste/Fiche | Gestion des sites opérationnels et des emplacements logistiques utilisés par les flux terrain et stock. | [03-sites-depots-ressources.md](./01-referentiel/03-sites-depots-ressources.md)                                                    |
| ECR-01-06 | Référentiel ressources opérationnelles | Liste/Fiche | Gestion des ressources humaines et matérielles : employés, sous-traitants, véhicules, équipements.      | [03-sites-depots-ressources.md](./01-referentiel/03-sites-depots-ressources.md)                                                    |


## Module 02 - Avant-vente


| ID        | Écran cible                     | Nature         | Couverture déduite                                                                               | Sources                                                                                                                                                                                                                                           |
| --------- | ------------------------------- | -------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ECR-02-01 | Pipeline avant-vente            | Liste/Pipeline | Vue d'entrée pour créer, suivre et qualifier les demandes de cotation et les offres en cours.    | [01-demande-de-cotation.md](./02-avant-vente/01-demande-de-cotation.md), [03-validation-et-envoi-offre.md](./02-avant-vente/03-validation-et-envoi-offre.md)                                                                                      |
| ECR-02-02 | Fiche demande de cotation       | Fiche          | Qualification d'une demande avec client, date limite, contexte et informations d'appel d'offres. | [01-demande-de-cotation.md](./02-avant-vente/01-demande-de-cotation.md)                                                                                                                                                                           |
| ECR-02-03 | Atelier d'étude et de chiffrage | Atelier        | Construction technique et économique de l'offre : étude, lots, chiffrage, synthèse.              | [02-etude-et-chiffrage.md](./02-avant-vente/02-etude-et-chiffrage.md)                                                                                                                                                                             |
| ECR-02-04 | Fiche offre                     | Fiche          | Validation, envoi, versioning et décision client autour d'une offre.                             | [02-etude-et-chiffrage.md](./02-avant-vente/02-etude-et-chiffrage.md), [03-validation-et-envoi-offre.md](./02-avant-vente/03-validation-et-envoi-offre.md), [04-decision-client-historique.md](./02-avant-vente/04-decision-client-historique.md) |


## Module 03 - Contrats / Affaires / Projets


| ID        | Écran cible                      | Nature    | Couverture déduite                                                                                  | Sources                                                                                                                                                                                                        |
| --------- | -------------------------------- | --------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ECR-03-01 | Registre des contrats            | Liste     | Recherche et sélection des contrats issus des offres retenues.                                      | [01-transformation-offre-contrat-projet.md](./03-contrats-affaires-projets/01-transformation-offre-contrat-projet.md)                                                                                          |
| ECR-03-02 | Fiche contrat                    | Fiche     | Transformation d'une offre en contrat, gestion des données contractuelles et lancement des projets. | [01-transformation-offre-contrat-projet.md](./03-contrats-affaires-projets/01-transformation-offre-contrat-projet.md)                                                                                          |
| ECR-03-03 | Registre des affaires et projets | Liste     | Point d'accès aux projets et affaires actifs, avec leurs rattachements contractuels.                | [02-structuration-projet.md](./03-contrats-affaires-projets/02-structuration-projet.md), [03-affaire-rattachement-vue-consolidee.md](./03-contrats-affaires-projets/03-affaire-rattachement-vue-consolidee.md) |
| ECR-03-04 | Fiche affaire / projet           | Fiche     | Consultation des informations clés, des rattachements contractuels et des métadonnées d'exécution.  | [02-structuration-projet.md](./03-contrats-affaires-projets/02-structuration-projet.md), [03-affaire-rattachement-vue-consolidee.md](./03-contrats-affaires-projets/03-affaire-rattachement-vue-consolidee.md) |
| ECR-03-05 | Structure projet                 | Structure | Décomposition d'un projet en lots, phases, jalons ou composantes pilotables.                        | [02-structuration-projet.md](./03-contrats-affaires-projets/02-structuration-projet.md)                                                                                                                        |


## Module 04 - Budget / Pilotage financier projet


| ID        | Écran cible                           | Nature          | Couverture déduite                                                                     | Sources                                                                                                    |
| --------- | ------------------------------------- | --------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| ECR-04-01 | Fiche budget projet / affaire         | Fiche           | Création du budget initial et accès à sa version active depuis l'affaire ou le projet. | [01-budget-initial.md](./04-budget-pilotage-financier-projet/01-budget-initial.md)                         |
| ECR-04-02 | Détail budget et postes de coût       | Détail          | Saisie et maintenance des lignes budgétaires par poste de coût.                        | [01-budget-initial.md](./04-budget-pilotage-financier-projet/01-budget-initial.md)                         |
| ECR-04-03 | File de validation et révision budget | File de travail | Soumission, approbation, refus et révision des versions budgétaires.                   | [02-validation-revision-budget.md](./04-budget-pilotage-financier-projet/02-validation-revision-budget.md) |
| ECR-04-04 | Tableau de bord budget et écarts      | Dashboard       | Suivi des écarts, dérives et marge budgétaire au niveau affaire / projet.              | [03-suivi-ecarts-marge.md](./04-budget-pilotage-financier-projet/03-suivi-ecarts-marge.md)                 |


## Module 05 - Achats


| ID        | Écran cible                        | Nature     | Couverture déduite                                                                     | Sources                                                                                                                      |
| --------- | ---------------------------------- | ---------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| ECR-05-01 | Registre des expressions de besoin | Liste      | Point d'entrée pour les besoins remontés du terrain ou des projets.                    | [01-expression-de-besoin.md](./05-achats/01-expression-de-besoin.md)                                                         |
| ECR-05-02 | Fiche expression de besoin         | Fiche      | Qualification détaillée du besoin, rattachement et préparation de la bascule en DA.    | [01-expression-de-besoin.md](./05-achats/01-expression-de-besoin.md), [02-da-validation.md](./05-achats/02-da-validation.md) |
| ECR-05-03 | Registre des demandes d'achat      | Liste      | Vue de suivi des DA, de leur statut et de leur avancement dans le workflow.            | [02-da-validation.md](./05-achats/02-da-validation.md)                                                                       |
| ECR-05-04 | Fiche demande d'achat              | Fiche      | Gestion des lignes, soumission, décision d'approbation et passage au traitement achat. | [02-da-validation.md](./05-achats/02-da-validation.md)                                                                       |
| ECR-05-05 | Comparatif fournisseurs            | Comparatif | Analyse des offres reçues et arbitrage fournisseur pour un besoin donné.               | [03-consultation-fournisseurs-commandes.md](./05-achats/03-consultation-fournisseurs-commandes.md)                           |
| ECR-05-06 | Commande fournisseur               | Fiche      | Création et suivi des commandes émises à partir d'une DA validée.                      | [03-consultation-fournisseurs-commandes.md](./05-achats/03-consultation-fournisseurs-commandes.md)                           |


## Module 06 - Stock / Logistique / Magasin


| ID        | Écran cible                     | Nature          | Couverture déduite                                                           | Sources                                                                                      |
| --------- | ------------------------------- | --------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| ECR-06-01 | Centre de réception fournisseur | Liste/Opération | Prépare et enregistre les réceptions à partir des commandes fournisseur.     | [01-reception-fournisseur.md](./06-stock-logistique-magasin/01-reception-fournisseur.md)     |
| ECR-06-02 | Fiche réception                 | Fiche           | Contrôle des quantités reçues, statuts de réception et écarts de livraison.  | [01-reception-fournisseur.md](./06-stock-logistique-magasin/01-reception-fournisseur.md)     |
| ECR-06-03 | Réservation et sortie de stock  | Opération       | Réserve les articles et exécute les sorties pour projets, OT ou SAV.         | [02-affectation-reservation.md](./06-stock-logistique-magasin/02-affectation-reservation.md) |
| ECR-06-04 | Transfert et retour de stock    | Opération       | Déplace ou restitue les articles entre dépôts, chantiers et stocks centraux. | [03-transfert-retour.md](./06-stock-logistique-magasin/03-transfert-retour.md)               |
| ECR-06-05 | Vue stock par emplacement       | Vue de stock    | Lecture des niveaux de stock par dépôt, site ou emplacement.                 | [04-pilotage-stock.md](./06-stock-logistique-magasin/04-pilotage-stock.md)                   |
| ECR-06-06 | Inventaire de stock             | Opération       | Comptage, correction et justification des écarts d'inventaire.               | [04-pilotage-stock.md](./06-stock-logistique-magasin/04-pilotage-stock.md)                   |


## Module 07 - Exécution terrain / Ordres de travail


| ID        | Écran cible                            | Nature         | Couverture déduite                                                                   | Sources                                                                                                                                                                                                        |
| --------- | -------------------------------------- | -------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ECR-07-01 | Liste / planning des ordres de travail | Liste/Planning | Visualisation et priorisation des OT à créer, planifier ou suivre.                   | [01-creation-planification-ot.md](./07-execution-terrain-ordres-de-travail/01-creation-planification-ot.md)                                                                                                    |
| ECR-07-02 | Formulaire création OT                 | Formulaire     | Création initiale d'un OT avec rattachement, équipe, dates et prérequis.             | [01-creation-planification-ot.md](./07-execution-terrain-ordres-de-travail/01-creation-planification-ot.md)                                                                                                    |
| ECR-07-03 | Fiche OT back-office                   | Fiche          | Planification, exécution, anomalies, clôture et génération des suites documentaires. | [01-creation-planification-ot.md](./07-execution-terrain-ordres-de-travail/01-creation-planification-ot.md), [03-anomalies-cloture-ot.md](./07-execution-terrain-ordres-de-travail/03-anomalies-cloture-ot.md) |
| ECR-07-04 | Fiche OT mobile terrain                | Mobile         | Démarrage, saisie terrain, temps passés, preuves et compte rendu opérationnel.       | [02-execution-terrain.md](./07-execution-terrain-ordres-de-travail/02-execution-terrain.md)                                                                                                                    |


## Module 08 - PV / Preuves de réalisation


| ID        | Écran cible     | Nature | Couverture déduite                                                                        | Sources                                                                                                                                                                                                                                               |
| --------- | --------------- | ------ | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ECR-08-01 | Registre des PV | Liste  | Recherche et suivi des PV générés depuis les OT ou interventions.                         | [01-generation-pv.md](./08-pv-preuves-de-realisation/01-generation-pv.md), [03-pv-base-facturation.md](./08-pv-preuves-de-realisation/03-pv-base-facturation.md)                                                                                      |
| ECR-08-02 | Fiche PV        | Fiche  | Travaux réalisés, réserves, signature client, validation et éligibilité à la facturation. | [01-generation-pv.md](./08-pv-preuves-de-realisation/01-generation-pv.md), [02-reserves-signature.md](./08-pv-preuves-de-realisation/02-reserves-signature.md), [03-pv-base-facturation.md](./08-pv-preuves-de-realisation/03-pv-base-facturation.md) |


## Module 09 - Temps / Ressources / Pointage


| ID        | Écran cible                              | Nature     | Couverture déduite                                                             | Sources                                                                                                         |
| --------- | ---------------------------------------- | ---------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| ECR-09-01 | Pointage quotidien équipe                | Saisie     | Saisie collective ou semi-collective des temps du jour pour une équipe.        | [01-pointage-equipe.md](./09-temps-ressources-pointage/01-pointage-equipe.md)                                   |
| ECR-09-02 | Imputation et ressources pointées        | Détail     | Imputation fine des temps, ressources et activités sur projets, OT ou tickets. | [02-imputation-ressources.md](./09-temps-ressources-pointage/02-imputation-ressources.md)                       |
| ECR-09-03 | Validation et consultation des pointages | File/Liste | Validation managériale et consultation filtrée des pointages.                  | [03-validation-consultation-pointage.md](./09-temps-ressources-pointage/03-validation-consultation-pointage.md) |


## Module 10 - Coûts analytiques / Rentabilité


| ID        | Écran cible                          | Nature    | Couverture déduite                                                                | Sources                                                                                                 |
| --------- | ------------------------------------ | --------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| ECR-10-01 | Fiche coût analytique d'intervention | Fiche     | Consolidation du coût réel d'une intervention à partir du temps, stock et achats. | [01-cout-reel-intervention.md](./10-couts-analytiques-rentabilite/01-cout-reel-intervention.md)         |
| ECR-10-02 | Tableau de bord analytique consolidé | Dashboard | Vue consolidée des coûts complets par affaire, projet, OT ou ticket.              | [02-consolidation-cout-complet.md](./10-couts-analytiques-rentabilite/02-consolidation-cout-complet.md) |
| ECR-10-03 | Tableau de bord rentabilité et marge | Dashboard | Lecture de la marge, des dérives et de la performance économique.                 | [03-rentabilite-marge.md](./10-couts-analytiques-rentabilite/03-rentabilite-marge.md)                   |


## Module 11 - BTP / Avancement / Attachements / Situations


| ID        | Écran cible                        | Nature      | Couverture déduite                                                                  | Sources                                                                                                                                                                                                              |
| --------- | ---------------------------------- | ----------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ECR-11-01 | Saisie d'avancement chantier       | Saisie      | Déclaration de l'avancement physique ou quantitatif sur chantier.                   | [01-avancement-attachements.md](./11-btp-avancement-attachements-situations/01-avancement-attachements.md)                                                                                                           |
| ECR-11-02 | Gestion des attachements           | Détail      | Constitution et contrôle des pièces d'attachement servant de base aux situations.   | [01-avancement-attachements.md](./11-btp-avancement-attachements-situations/01-avancement-attachements.md), [03-historique-corrections.md](./11-btp-avancement-attachements-situations/03-historique-corrections.md) |
| ECR-11-03 | Registre des situations de travaux | Liste/Fiche | Création, validation et suivi des situations de travaux.                            | [02-situation-validation.md](./11-btp-avancement-attachements-situations/02-situation-validation.md)                                                                                                                 |
| ECR-11-04 | Historique chantier et corrections | Historique  | Traçabilité des révisions, corrections et réémissions d'attachements ou situations. | [03-historique-corrections.md](./11-btp-avancement-attachements-situations/03-historique-corrections.md)                                                                                                             |


## Module 12 - Facturation


| ID        | Écran cible                | Nature    | Couverture déduite                                                                     | Sources                                                                                                                                                                        |
| --------- | -------------------------- | --------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ECR-12-01 | Registre des factures      | Liste     | Recherche et filtrage des factures selon origine, statut, client, affaire ou projet.   | [03-consultation-correction-facture.md](./12-facturation/03-consultation-correction-facture.md)                                                                                |
| ECR-12-02 | Assistant nouvelle facture | Assistant | Création d'une facture depuis un PV, une situation ou un autre mode contractuel prévu. | [01-facturation-par-origine.md](./12-facturation/01-facturation-par-origine.md), [02-modes-contractuels-specifiques.md](./12-facturation/02-modes-contractuels-specifiques.md) |
| ECR-12-03 | Fiche facture              | Fiche     | Consultation, correction, annulation, traçabilité et cycle de vie d'une facture.       | [03-consultation-correction-facture.md](./12-facturation/03-consultation-correction-facture.md)                                                                                |


## Module 13 - Encaissement / Recouvrement


| ID        | Écran cible                                 | Nature          | Couverture déduite                                                                      | Sources                                                                                         |
| --------- | ------------------------------------------- | --------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| ECR-13-01 | Formulaire d'encaissement client            | Formulaire      | Enregistrement d'un règlement client avec mode, montant, référence et affectation.      | [01-encaissement-client.md](./13-encaissement-recouvrement/01-encaissement-client.md)           |
| ECR-13-02 | Fiche encaissement                          | Fiche           | Détail d'un encaissement, affectations, traces et statut du paiement.                   | [01-encaissement-client.md](./13-encaissement-recouvrement/01-encaissement-client.md)           |
| ECR-13-03 | Tableau de bord recouvrement                | Dashboard       | Pilotage des échéances, retards, priorités de relance et exposition au risque.          | [02-echeances-relances.md](./13-encaissement-recouvrement/02-echeances-relances.md)             |
| ECR-13-04 | Dossier relance client                      | Dossier         | Vue de travail sur une facture échue ou un client en retard avec historique de relance. | [02-echeances-relances.md](./13-encaissement-recouvrement/02-echeances-relances.md)             |
| ECR-13-05 | Écran de rapprochement paiements / factures | Rapprochement   | Association des paiements entrants aux factures ouvertes.                               | [03-rapprochement-tresorerie.md](./13-encaissement-recouvrement/03-rapprochement-tresorerie.md) |
| ECR-13-06 | File des paiements non rapprochés           | File de travail | Résolution des écarts, ambiguïtés ou paiements sans affectation.                        | [03-rapprochement-tresorerie.md](./13-encaissement-recouvrement/03-rapprochement-tresorerie.md) |


## Module 14 - SAV / Maintenance / Ticketing


| ID        | Écran cible                     | Nature        | Couverture déduite                                                                                         | Sources                                                                                                                                                                                                                                                                 |
| --------- | ------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ECR-14-01 | Registre des tickets SAV        | Liste         | Vue d'entrée pour suivre les tickets, priorités, SLA et statuts de résolution.                             | [01-creation-ticket.md](./14-sav-maintenance-ticketing/01-creation-ticket.md), [03-cloture-facturabilite.md](./14-sav-maintenance-ticketing/03-cloture-facturabilite.md)                                                                                                |
| ECR-14-02 | Formulaire de ticket SAV        | Formulaire    | Création d'un ticket à partir du contexte client, site, équipement ou contrat.                             | [01-creation-ticket.md](./14-sav-maintenance-ticketing/01-creation-ticket.md)                                                                                                                                                                                           |
| ECR-14-03 | Fiche ticket SAV                | Fiche         | Qualification, diagnostic, résolution, cause racine, SLA et décision de facturabilité.                     | [01-creation-ticket.md](./14-sav-maintenance-ticketing/01-creation-ticket.md), [02-diagnostic-intervention.md](./14-sav-maintenance-ticketing/02-diagnostic-intervention.md), [03-cloture-facturabilite.md](./14-sav-maintenance-ticketing/03-cloture-facturabilite.md) |
| ECR-14-04 | Suivi d'intervention SAV sur OT | Écran partagé | Prolonge le ticket dans un écran OT partagé avec l'exécution terrain lorsque l'intervention est planifiée. | [02-diagnostic-intervention.md](./14-sav-maintenance-ticketing/02-diagnostic-intervention.md), [02-execution-terrain.md](./07-execution-terrain-ordres-de-travail/02-execution-terrain.md)                                                                              |


## Module 15 - Planning / Coordination opérationnelle


| ID        | Écran cible              | Nature             | Couverture déduite                                                         | Sources                                                                                                                                                                                                  |
| --------- | ------------------------ | ------------------ | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ECR-15-01 | Planning projet          | Planning           | Vue locale des activités planifiées, jalons et affectations sur un projet. | [01-planning-ressources.md](./15-planning-coordination-operationnelle/01-planning-ressources.md), [02-jalons-replanification.md](./15-planning-coordination-operationnelle/02-jalons-replanification.md) |
| ECR-15-02 | Fiche activité planifiée | Fiche              | Détail d'une activité avec ressources, dépendances et replanification.     | [01-planning-ressources.md](./15-planning-coordination-operationnelle/01-planning-ressources.md), [02-jalons-replanification.md](./15-planning-coordination-operationnelle/02-jalons-replanification.md) |
| ECR-15-03 | Planning consolidé       | Planning consolidé | Vision transverse des charges, disponibilités et collisions de planning.   | [03-vue-consolidee-planning.md](./15-planning-coordination-operationnelle/03-vue-consolidee-planning.md)                                                                                                 |


## Module 16 - Gouvernance / Validation / Contrôle interne


| ID        | Écran cible                         | Nature          | Couverture déduite                                                                          | Sources                                                                                                       |
| --------- | ----------------------------------- | --------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| ECR-16-01 | Paramétrage des validations         | Paramétrage     | Définition des circuits, seuils, rôles et délégations de validation.                        | [01-circuits-validation.md](./16-gouvernance-validation-controle-interne/01-circuits-validation.md)           |
| ECR-16-02 | Boîte de validation                 | File de travail | Traitement opérationnel des décisions à approuver sur offres, budgets, DA ou autres objets. | [02-decisions-tracabilite.md](./16-gouvernance-validation-controle-interne/02-decisions-tracabilite.md)       |
| ECR-16-03 | Historique des validations          | Historique      | Traçabilité des décisions, commentaires, refus et relectures.                               | [02-decisions-tracabilite.md](./16-gouvernance-validation-controle-interne/02-decisions-tracabilite.md)       |
| ECR-16-04 | Contrôle de blocage sur fiche objet | Contrôle        | Affichage des blocages de conformité ou de gouvernance sur les objets métier.               | [03-blocage-controle-interne.md](./16-gouvernance-validation-controle-interne/03-blocage-controle-interne.md) |


## Module 17 - Reporting / KPI / Direction


| ID        | Écran cible                    | Nature    | Couverture déduite                                                     | Sources                                                                           |
| --------- | ------------------------------ | --------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| ECR-17-01 | Dashboard KPI commerciaux      | Dashboard | Pilotage de l'entonnoir commercial, offres et décisions clients.       | [01-kpi-commerciaux.md](./17-reporting-kpi-direction/01-kpi-commerciaux.md)       |
| ECR-17-02 | Dashboard KPI projet / finance | Dashboard | Pilotage consolidé du budget, des coûts, de la marge et du cash.       | [02-kpi-projet-finance.md](./17-reporting-kpi-direction/02-kpi-projet-finance.md) |
| ECR-17-03 | Dashboard KPI maintenance      | Dashboard | Lecture transverse des tickets, SLA, performance SAV et facturabilité. | [03-kpi-maintenance.md](./17-reporting-kpi-direction/03-kpi-maintenance.md)       |


## Module 18 - Vue transverse Affaire / Projet


| ID        | Écran cible                          | Nature         | Couverture déduite                                                                                 | Sources                                                                                                                                                                        |
| --------- | ------------------------------------ | -------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ECR-18-01 | Vue 360 affaire / projet             | Vue transverse | Navigation consolidée à travers offres, contrat, budget, achats, OT, PV, factures, tickets et KPI. | [01-vue-360-projet.md](./18-vue-transverse-affaire-projet/01-vue-360-projet.md), [02-navigation-transverse.md](./18-vue-transverse-affaire-projet/02-navigation-transverse.md) |
| ECR-18-02 | Cockpit risques et arbitrages projet | Cockpit        | Vue décisionnelle des risques, alertes, dérives et arbitrages nécessaires sur un projet.           | [03-risques-cockpit-projet.md](./18-vue-transverse-affaire-projet/03-risques-cockpit-projet.md)                                                                                |


## Hors périmètre volontaire

Les éléments suivants ne sont pas listés comme écrans métier car ils ne sont pas décrits explicitement dans la spec actuelle :

- authentification et gestion de session
- préférences utilisateur
- administration technique de la plateforme
- paramétrage ERP générique hors périmètre métier

## Étape suivante conseillée

À partir de ce catalogue, on peut produire l'un des trois livrables suivants :

- une cartographie des menus et sous-menus de navigation
- un zoning détaillé écran par écran
- un backlog UX/UI et dev par écran avec priorisation

