Parfait. Voici le **3-b) Acceptance criteria**, toujours **module par module**, en gardant un format clair, testable et directement exploitable pour la spécification fonctionnelle détaillée. Je reste strictement sur le niveau **acceptance criteria**. 

# 3-b) Acceptance criteria

## Module 1 — Référentiel

### AC1. Création d’un client

1. Étant donné qu’un utilisateur autorisé ouvre le formulaire de création client, quand il renseigne les champs obligatoires et valide, alors le client est créé avec un identifiant unique.
2. Étant donné qu’un client est créé, quand l’utilisateur consulte sa fiche, alors les informations enregistrées sont visibles.
3. Étant donné qu’un champ obligatoire est absent, quand l’utilisateur tente d’enregistrer, alors le système bloque la création et affiche les erreurs.

### AC2. Modification d’un client

1. Étant donné qu’un client existe, quand un utilisateur autorisé modifie ses informations et enregistre, alors les nouvelles valeurs sont visibles dans la fiche.
2. Étant donné qu’une modification a été enregistrée, quand l’historique est consulté, alors la modification doit être traçable.

### AC3. Désactivation d’un objet référentiel

1. Étant donné qu’un client, fournisseur, article ou site existe, quand un utilisateur autorisé le désactive, alors l’objet n’est plus sélectionnable pour de nouveaux enregistrements.
2. Étant donné qu’un objet a été désactivé, quand des documents historiques le référencent, alors ces documents continuent d’afficher la référence concernée.
3. Étant donné qu’un objet désactivé est consulté, quand la fiche est ouverte, alors son statut doit apparaître comme inactif. 

## Module 2 — Avant-vente

### AC1. Création d’une demande de cotation

1. Étant donné qu’un utilisateur autorisé crée une demande de cotation avec les informations minimales requises, quand il valide, alors la demande est enregistrée avec une référence unique.
2. Étant donné qu’une demande de cotation existe, quand elle est consultée, alors le client, l’objet, le type, la date limite et le montant estimé sont visibles.

### AC2. Création d’une étude technique

1. Étant donné qu’une demande de cotation existe, quand le bureau d’études saisit les métrés, besoins matériels, besoins en main-d’œuvre, durée et contraintes, alors l’étude technique est enregistrée.
2. Étant donné qu’une étude existe, quand elle est consultée, alors toutes les données saisies sont accessibles.

### AC3. Création d’une offre versionnée

1. Étant donné qu’une demande de cotation existe, quand un chef de projet crée une offre, alors l’offre reçoit une référence unique et son type, devis ou facture proforma, est enregistré.
2. Étant donné qu’une offre existe déjà, quand une nouvelle version est créée, alors la version précédente est conservée et la nouvelle version est liée au même dossier commercial.
3. Étant donné qu’une offre contient plusieurs lots, quand elle est consultée, alors chaque lot doit apparaître séparément.

### AC4. Calcul de marge et alerte

1. Étant donné qu’une offre contient un montant de vente et un coût estimé, quand elle est enregistrée, alors la marge brute et le taux de marge sont calculés automatiquement.
2. Étant donné que les montants de l’offre changent, quand la mise à jour est validée, alors les indicateurs de marge sont recalculés.
3. Étant donné qu’un seuil de marge est configuré, quand le taux de marge passe sous ce seuil, alors une alerte visible est générée sans bloquer automatiquement le dossier.

### AC5. Soumission à validation

1. Étant donné qu’une offre est prête, quand l’utilisateur la soumet à validation, alors son statut passe à l’état correspondant au circuit de validation technique puis direction.
2. Étant donné qu’une offre est en attente de validation, quand un valideur approuve, alors la décision est tracée avec l’identité du valideur et la date.
3. Étant donné qu’une offre est rejetée, quand elle est consultée, alors le rejet et son motif éventuel sont visibles.

### AC6. Envoi au client

1. Étant donné qu’une offre a reçu toutes les validations requises, quand l’utilisateur l’envoie au client, alors son statut devient “envoyée”.
2. Étant donné qu’une offre n’a pas reçu toutes les validations requises, quand l’utilisateur tente de l’envoyer, alors le système bloque l’action.
3. Étant donné qu’une décision client est saisie, quand le dossier est consulté, alors l’issue “retenue”, “infirmée” ou “sans suite” est visible. 

## Module 3 — Contrats / Affaires / Projets

### AC1. Transformation d’une offre retenue en contrat et projet

1. Étant donné qu’une offre est marquée comme retenue, quand un utilisateur autorisé lance la transformation, alors un contrat est créé.
2. Étant donné qu’un contrat est créé depuis une offre, quand il est consulté, alors il conserve le lien avec l’offre d’origine.
3. Étant donné qu’un contrat est créé, quand le modèle opérationnel le prévoit, alors un ou plusieurs projets peuvent être initialisés depuis ce contrat.

### AC2. Création d’un projet

1. Étant donné qu’un contrat signé existe, quand un projet est créé, alors il reçoit une référence unique.
2. Étant donné qu’un projet est créé, quand il est consulté, alors le client, le contrat, le chef de projet, les dates et le montant contractuel sont visibles.

### AC3. Découpage d’un projet

1. Étant donné qu’un projet existe, quand l’utilisateur ajoute des zones, sites ou sous-lots, alors ceux-ci sont rattachés au projet.
2. Étant donné qu’un projet a été découpé, quand sa fiche est consultée, alors tous les sous-ensembles apparaissent dans sa structure. 

## Module 4 — Budget / Pilotage financier projet

### AC1. Création d’un budget initial

1. Étant donné qu’une affaire existe, quand un chef de projet crée un budget avec les postes requis, alors le budget est enregistré.
2. Étant donné qu’un budget existe, quand il est consulté, alors les montants par poste sont visibles.

### AC2. Validation du budget

1. Étant donné qu’un budget est soumis à validation, quand un valideur approuve, alors le budget passe à l’état validé.
2. Étant donné qu’un budget n’est pas validé, quand une action soumise à cette validation est tentée, alors le système applique le blocage prévu.

### AC3. Révision d’un budget

1. Étant donné qu’un budget validé existe, quand une révision est créée, alors la version initiale est conservée.
2. Étant donné qu’un budget révisé est enregistré, quand les versions sont consultées, alors les anciennes et nouvelles valeurs restent consultables. 

## Module 5 — Achats

### AC1. Saisie d’une expression de besoin

1. Étant donné qu’un utilisateur autorisé saisit un besoin avec les informations minimales requises, quand il valide, alors l’expression de besoin est enregistrée.
2. Étant donné qu’un besoin est enregistré, quand il est consulté, alors les articles ou prestations demandés apparaissent avec leurs quantités et caractéristiques.

### AC2. Contrôle stock et transformation en demande d’achat

1. Étant donné qu’une expression de besoin existe, quand le stock disponible couvre totalement le besoin, alors le système permet une affectation directe sans création de demande d’achat.
2. Étant donné qu’une expression de besoin existe, quand le stock disponible ne couvre qu’une partie du besoin, alors la demande d’achat porte uniquement sur la quantité manquante.
3. Étant donné qu’une demande d’achat est créée, quand elle est consultée, alors l’affaire, le projet ou le stock central de rattachement est visible.

### AC3. Validation d’une demande d’achat

1. Étant donné qu’une demande d’achat est soumise, quand chaque valideur requis se prononce, alors les décisions des acteurs attendus sont tracées.
2. Étant donné qu’une validation obligatoire manque, quand l’utilisateur tente de poursuivre le processus, alors l’action est bloquée.

### AC4. Consultation fournisseurs et comparatif

1. Étant donné qu’une demande d’achat validée existe, quand plusieurs offres fournisseurs sont saisies, alors elles sont rattachées à la même demande.
2. Étant donné que plusieurs offres existent, quand le comparatif est consulté, alors les critères prix, disponibilité et caractéristiques apparaissent de manière rapprochée pour comparaison.

### AC5. Sélection fournisseur et commande

1. Étant donné qu’une ou plusieurs offres ont été retenues, quand l’utilisateur génère une commande, alors un ou plusieurs bons de commande sont créés.
2. Étant donné qu’un même besoin est réparti entre plusieurs fournisseurs, quand les commandes sont consultées, alors chaque commande affiche uniquement les lignes qui lui sont attribuées. 

## Module 6 — Stock / Logistique / Magasin

### AC1. Réception fournisseur

1. Étant donné qu’une commande fournisseur existe, quand le magasinier enregistre une réception, alors un bon de réception est créé.
2. Étant donné qu’une réception est partielle, quand elle est enregistrée, alors les quantités reçues sont mises à jour sans clôturer à tort les quantités restantes.
3. Étant donné qu’une réception est totale, quand elle est enregistrée, alors la commande peut apparaître comme totalement reçue.

### AC2. Affectation de stock

1. Étant donné que du stock est disponible, quand le magasinier l’affecte à un chantier, site, technicien ou véhicule, alors le mouvement de stock est enregistré.
2. Étant donné qu’une affectation est faite, quand le stock est consulté par emplacement, alors les quantités reflètent cette affectation.

### AC3. Réservation de stock

1. Étant donné qu’un stock est disponible, quand une quantité est réservée pour une affaire, alors cette quantité apparaît comme réservée.
2. Étant donné qu’une quantité est réservée, quand un autre utilisateur tente de l’utiliser sans autorisation de réaffectation, alors le système applique la règle prévue.
3. Étant donné qu’une réaffectation urgente de stock réservé est autorisée, quand elle est enregistrée, alors l’origine, la destination et la restitution attendue restent traçables.

### AC4. Retour et transfert

1. Étant donné qu’un article est sur chantier ou autre emplacement, quand il est transféré, alors un mouvement de sortie et un mouvement d’entrée cohérents sont tracés.
2. Étant donné qu’un article est retourné à l’entrepôt, quand le retour est validé, alors il réintègre le stock selon son état accepté.

### AC5. Seuils et inventaire

1. Étant donné qu’un niveau de stock descend sous le seuil défini, quand le stock est recalculé, alors une alerte de seuil peut être visible.
2. Étant donné qu’un inventaire est saisi, quand il est validé, alors l’écart entre stock théorique et stock constaté est enregistré. 

## Module 7 — Exécution terrain / Ordres de travail

### AC1. Création et planification d’un OT

1. Étant donné qu’un utilisateur autorisé crée un OT avec les informations minimales requises, quand il valide, alors l’OT reçoit une référence unique.
2. Étant donné qu’un OT existe, quand il est planifié, alors la date, l’équipe et le site ou chantier sont visibles.

### AC2. Démarrage d’intervention

1. Étant donné qu’un OT est affecté à une équipe, quand l’équipe démarre l’intervention, alors l’heure de début est enregistrée.
2. Étant donné qu’une intervention a démarré, quand elle est consultée, alors son statut reflète qu’elle est en cours.

### AC3. Déclaration terrain

1. Étant donné qu’une intervention est en cours, quand l’équipe saisit du temps passé, alors ce temps est enregistré.
2. Étant donné qu’une intervention consomme du matériel, quand la consommation est déclarée, alors elle est liée à l’intervention.
3. Étant donné que des checklists sont requises, quand l’intervention est renseignée, alors les checklists complétées sont visibles.
4. Étant donné que des photos sont ajoutées, quand l’intervention est consultée, alors les pièces jointes sont accessibles.
5. Étant donné qu’un prestataire réalise tout ou partie de l’intervention, quand l’intervention est consultée, alors l’identité du prestataire et la part exécutée sont visibles.

### AC4. Clôture technique

1. Étant donné qu’une intervention est terminée, quand l’équipe la clôture, alors l’heure de fin est enregistrée.
2. Étant donné qu’une intervention clôturée est consultée, quand les détails sont affichés, alors temps, consommations, anomalies et preuves associées sont visibles. 

## Module 8 — PV / Preuves de réalisation

### AC1. Génération d’un PV

1. Étant donné qu’une intervention ou un OT existe, quand l’utilisateur génère un PV, alors le PV est créé avec un lien vers son origine.
2. Étant donné qu’un PV est créé, quand il est consulté, alors les travaux réalisés sont visibles.

### AC2. Tests et réserves

1. Étant donné qu’un PV est en cours de saisie, quand les résultats des tests sont renseignés, alors ils sont enregistrés.
2. Étant donné qu’une réserve est identifiée, quand elle est saisie, alors elle apparaît dans le PV.

### AC3. Signature client

1. Étant donné qu’un PV est prêt, quand le client signe, alors la signature est enregistrée dans le système.
2. Étant donné qu’un PV signé est consulté, quand ses détails sont affichés, alors la signature et la date apparaissent.

### AC4. Lien avec la facturation

1. Étant donné qu’un PV validé remplit les conditions de facturation, quand un comptable prépare la facture, alors le PV peut être sélectionné comme justificatif. 

## Module 9 — Temps / Ressources / Pointage

### AC1. Saisie du pointage

1. Étant donné qu’un chef d’équipe saisit le pointage d’une journée, quand il valide, alors le pointage est enregistré.
2. Étant donné qu’un pointage est enregistré, quand il est consulté, alors les personnes, heures, ressources et rattachements sont visibles.

### AC2. Imputation analytique

1. Étant donné qu’un pointage est saisi, quand il est enregistré, alors il est rattaché à une affaire, un chantier, un OT ou une tâche.
2. Étant donné qu’un pointage non rattaché est saisi, quand l’utilisateur tente de le valider, alors le système applique le contrôle prévu.

### AC3. Validation hiérarchique

1. Étant donné qu’un pointage a été soumis, quand le responsable le valide, alors la validation est tracée.
2. Étant donné qu’un pointage est corrigé par le valideur, quand il est réouvert, alors les données corrigées sont visibles avec une trace de modification. 

## Module 10 — Coûts analytiques / Rentabilité

### AC1. Calcul du coût réel

1. Étant donné que des temps, consommations, déplacements ou ressources existent, quand le calcul analytique est exécuté, alors le coût réel est produit pour l’objet concerné.
2. Étant donné qu’une intervention est consultée, quand son coût est affiché, alors les composantes principales du coût sont visibles.

### AC2. Consolidation

1. Étant donné que plusieurs coûts existent sur une affaire, quand la vue consolidée est consultée, alors le coût global est affiché.
2. Étant donné qu’un budget existe aussi sur cette affaire, quand la comparaison est consultée, alors écart budgétaire et marge réelle sont visibles. 

## Module 11 — BTP / Avancement / Attachements / Situations

### AC1. Saisie d’avancement

1. Étant donné qu’un chantier existe, quand le superviseur saisit des quantités exécutées, alors celles-ci sont enregistrées par période.
2. Étant donné que des quantités existent, quand elles sont consultées, alors elles sont visibles par type d’ouvrage.

### AC2. Création d’un attachement

1. Étant donné que des quantités ont été saisies, quand un attachement est créé, alors il reprend les quantités sélectionnées.
2. Étant donné qu’un attachement est soumis, quand il est validé, alors son statut reflète cette validation.

### AC3. Génération d’une situation

1. Étant donné qu’un attachement validé existe, quand la situation mensuelle est générée, alors les quantités validées sont valorisées.
2. Étant donné que des retenues, acomptes ou pénalités s’appliquent, quand la situation est calculée, alors le net à facturer est affiché.

### AC4. Historique

1. Étant donné qu’une affaire a plusieurs périodes d’avancement, quand l’utilisateur consulte l’historique, alors il voit les avancements, attachements et situations passés. 

## Module 12 — Facturation

### AC1. Création d’une facture

1. Étant donné qu’un justificatif valide existe, quand un comptable crée une facture, alors la facture reçoit une référence unique.
2. Étant donné qu’une facture est créée, quand elle est consultée, alors le client, l’affaire, le montant et la base de facturation sont visibles.

### AC2. Facturation depuis PV ou situation

1. Étant donné qu’un PV validé existe, quand il est sélectionné, alors il peut servir de base de facturation.
2. Étant donné qu’une situation validée existe, quand elle est sélectionnée, alors elle peut servir de base de facturation.
3. Étant donné qu’une intervention de maintenance ou SAV est déclarée facturable, quand elle est sélectionnée, alors elle peut servir de base de facturation selon les règles contractuelles.

### AC3. Suivi du reste à facturer

1. Étant donné qu’une affaire contient des éléments facturables non encore facturés, quand le suivi est consulté, alors le reste à facturer est visible.

### AC4. Correction ou annulation

1. Étant donné qu’un utilisateur autorisé intervient sur une facture, quand il effectue une correction ou annulation permise, alors l’opération est tracée.  

## Module 13 — Encaissement / Recouvrement

### AC1. Enregistrement d’un règlement

1. Étant donné qu’une facture existe, quand un règlement est saisi, alors il est enregistré avec son montant et sa date.
2. Étant donné qu’un règlement est enregistré, quand la facture est consultée, alors l’information de paiement apparaît.

### AC2. Rapprochement

1. Étant donné qu’un règlement concerne une ou plusieurs factures, quand le rapprochement est fait, alors les factures concernées reflètent le montant imputé.

### AC3. Suivi des impayés et relances

1. Étant donné que des échéances sont dépassées, quand la vue recouvrement est consultée, alors les factures en retard apparaissent.
2. Étant donné qu’une relance est enregistrée, quand l’historique du dossier client est consulté, alors l’action de relance est visible. 

## Module 14 — SAV / Maintenance / Ticketing

### AC1. Création d’un ticket

1. Étant donné qu’un incident est signalé, quand le support saisit les informations requises, alors le ticket est créé avec une référence unique.
2. Étant donné qu’un ticket existe, quand il est consulté, alors le client, le site, la catégorie, la priorité et le SLA sont visibles.

### AC2. Diagnostic et historique

1. Étant donné qu’un ticket concerne un site existant, quand le support consulte le ticket, alors l’historique site et la base installée sont accessibles.
2. Étant donné qu’un diagnostic est saisi, quand le ticket est consulté, alors ce diagnostic apparaît dans le dossier.

### AC3. Intervention depuis ticket

1. Étant donné qu’un ticket nécessite une action terrain, quand un OT est généré, alors il est lié au ticket.
2. Étant donné qu’une pièce est remplacée pendant la résolution, quand elle est enregistrée, alors elle apparaît dans l’historique de traitement.

### AC4. Clôture et facturabilité

1. Étant donné qu’un incident est résolu, quand le ticket est clôturé, alors la cause racine, le temps passé et la décision de facturabilité sont enregistrés.
2. Étant donné qu’un ticket est couvert par contrat ou garantie, quand la clôture est faite, alors cette information apparaît dans le dossier.
3. Étant donné qu’une intervention de maintenance ou SAV est hors périmètre, quand la clôture est faite, alors la facturabilité est visible pour la suite comptable. 

## Module 15 — Planning / Coordination opérationnelle

### AC1. Planification

1. Étant donné qu’une affaire existe, quand des activités sont planifiées, alors elles apparaissent sur le planning de l’affaire.
2. Étant donné qu’une activité est affectée à une équipe, quand le planning est consulté, alors cette affectation est visible.

### AC2. Replanification

1. Étant donné qu’une activité planifiée doit être déplacée, quand l’utilisateur la reprogramme, alors la nouvelle date est enregistrée.
2. Étant donné qu’une activité a été replanifiée, quand l’historique ou le planning est consulté, alors la planification courante est visible. 

## Module 16 — Gouvernance / Validation / Contrôle interne

### AC1. Circuit de validation

1. Étant donné qu’un circuit de validation est configuré, quand un objet concerné est soumis, alors il suit ce circuit.
2. Étant donné qu’une étape de validation est franchie, quand l’objet est consulté, alors la décision et le valideur sont visibles.

### AC2. Blocage des objets non validés

1. Étant donné qu’un objet requiert une validation préalable, quand un utilisateur tente une action interdite avant validation, alors le système la bloque.
2. Étant donné qu’un objet est validé, quand l’utilisateur autorisé reprend le traitement, alors l’action devient possible selon les règles prévues.  

## Module 17 — Reporting / KPI / Direction

### AC1. Consultation des indicateurs

1. Étant donné que des données existent dans le système, quand la direction consulte le tableau de bord, alors les KPI disponibles sont affichés.
2. Étant donné que des données changent, quand le tableau de bord est rafraîchi, alors les indicateurs reflètent les données à jour.

### AC2. Analyse par axe

1. Étant donné que l’utilisateur consulte la rentabilité, quand il choisit un axe d’analyse tel que client, affaire ou site, alors les résultats sont affichés selon cet axe.
2. Étant donné que l’utilisateur consulte les tickets ou SLA, quand il ouvre les indicateurs maintenance, alors les métriques correspondantes sont visibles. 

## Module 18 — Vue transverse Affaire / Projet

### AC1. Vue 360 projet

1. Étant donné qu’un projet existe, quand un utilisateur autorisé ouvre sa fiche consolidée, alors il voit les informations principales de contrat, budget, achats, stock, exécution, avancement, facturation et maintenance.
2. Étant donné que plusieurs objets sont liés au même projet, quand la vue 360 est consultée, alors ces objets sont accessibles depuis cette fiche.

### AC2. Suivi global

1. Étant donné qu’un projet est en cours, quand la vue consolidée est consultée, alors le réalisé à date est visible.
2. Étant donné que des risques ou blocages ont été enregistrés, quand la vue projet est consultée, alors ces éléments apparaissent dans la synthèse.  

La suite logique est **3-c) Business rules**.
