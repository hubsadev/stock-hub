Parfait. Voici le **3-a) Functional requirements**, toujours **module par module**, en restant strictement sur ce niveau. Je n’inclus pas encore **3-b acceptance criteria**, **3-c business rules**, **3-d permissions**, **3-e state transitions**, **3-f edge cases / user flows**. Les éléments ci-dessous sont dérivés de ton exemple et reformulés en exigences fonctionnelles exploitables. 

# 3-a) Functional requirements

## Module 1 — Référentiel

1. Le système doit permettre de créer, consulter, modifier et désactiver des fiches clients.
2. Le système doit permettre de créer, consulter, modifier et désactiver des fiches fournisseurs.
3. Le système doit permettre de créer, consulter, modifier et désactiver des fiches articles.
4. Le système doit permettre de gérer des articles matériels et des prestations.
5. Le système doit permettre d’enregistrer les caractéristiques descriptives d’un article.
6. Le système doit permettre de créer et gérer des fiches sites.
7. Le système doit permettre de créer et gérer des fiches dépôts / entrepôts.
8. Le système doit permettre de créer et gérer des fiches employés.
9. Le système doit permettre de créer et gérer des fiches sous-traitants.
10. Le système doit permettre de créer et gérer des fiches véhicules.
11. Le système doit permettre de créer et gérer des fiches équipements.
12. Le système doit attribuer un identifiant unique à chaque objet de référence.
13. Le système doit conserver l’historique minimal des modifications sur les objets de référence.
14. Le système doit rendre les objets de référence réutilisables dans les autres modules. 

## Module 2 — Avant-vente

1. Le système doit permettre de créer une demande de cotation.
2. Le système doit permettre d’enregistrer un appel d’offres avec ses informations principales.
3. Le système doit permettre d’associer un client à une demande de cotation.
4. Le système doit permettre d’enregistrer la date limite de remise d’offre.
5. Le système doit permettre de créer une étude technique liée à une demande de cotation.
6. Le système doit permettre de saisir les métrés, besoins matériels, besoins en main-d’œuvre, durée prévisionnelle, contraintes terrain et plan de charge.
7. Le système doit permettre de construire une offre composée de plusieurs lots.
8. Le système doit permettre de définir le type d’offre : devis ou facture proforma.
9. Le système doit permettre de créer plusieurs versions d’une même offre.
10. Le système doit permettre de calculer le montant de vente, le coût estimé, la marge brute et le taux de marge.
11. Le système doit permettre de déclencher une alerte lorsque la marge passe sous un seuil configurable.
12. Le système doit permettre de soumettre une offre à validation technique.
13. Le système doit permettre de soumettre toute offre à validation direction.
14. Le système doit permettre d’enregistrer la décision de validation ou de rejet d’une offre.
15. Le système doit permettre de tracer les versions et validations d’une offre.
16. Le système doit permettre de marquer une offre comme envoyée au client.
17. Le système doit permettre d’enregistrer l’issue commerciale d’une offre : retenue, infirmée ou sans suite. 

## Module 3 — Contrats / Affaires / Projets

1. Le système doit permettre de créer un contrat à partir d’une offre retenue.
2. Le système doit permettre de créer un ou plusieurs projets liés à un contrat.
3. Le système doit permettre d’associer un projet à une affaire ou à un contrat de rattachement si le modèle retenu l’exige.
4. Le système doit permettre d’enregistrer le type de projet ou d’affaire de rattachement.
5. Le système doit permettre d’affecter un responsable projet / chef de projet.
6. Le système doit permettre d’enregistrer les dates de début et de fin prévisionnelle.
7. Le système doit permettre de découper un projet en zones.
8. Le système doit permettre de découper une zone en sites.
9. Le système doit permettre de découper un projet en sous-lots ou sous-périmètres.
10. Le système doit permettre d’associer un volet maintenance à un projet.
11. Le système doit permettre de consulter une fiche consolidée de projet.
12. Le système doit permettre de consulter la vue contractuelle ou analytique d’une affaire de rattachement. 

## Module 4 — Budget / Pilotage financier projet

1. Le système doit permettre de créer un budget initial pour une affaire.
2. Le système doit permettre de saisir un budget par poste de coût.
3. Le système doit permettre d’associer un budget à une affaire, un projet ou un centre de coût.
4. Le système doit permettre d’enregistrer un montant budgété par catégorie de dépense.
5. Le système doit permettre de soumettre un budget à validation.
6. Le système doit permettre d’enregistrer une version révisée d’un budget.
7. Le système doit permettre de conserver l’historique des budgets initiaux et révisés.
8. Le système doit permettre de comparer budget initial, budget révisé et consommé.
9. Le système doit permettre d’afficher la marge cible de l’affaire. 

## Module 5 — Achats

1. Le système doit permettre de saisir une expression de besoin.
2. Le système doit permettre de contrôler le stock disponible avant création d’une demande d’achat.
3. Le système doit permettre d’affecter le stock disponible à un besoin validé.
4. Le système doit permettre de transformer uniquement le besoin non couvert en demande d’achat.
5. Le système doit permettre d’associer une demande d’achat à une affaire, un projet ou un stock central.
6. Le système doit permettre de saisir une liste d’articles ou de prestations dans une demande d’achat.
7. Le système doit permettre d’enregistrer les caractéristiques d’un besoin d’achat.
8. Le système doit permettre de soumettre une demande d’achat à un circuit de validation impliquant la comptabilité, les achats, la direction stratégie et développement et la direction générale selon les seuils retenus.
9. Le système doit permettre d’enregistrer les décisions de validation d’achat.
10. Le système doit permettre de consulter plusieurs fournisseurs pour une même demande.
11. Le système doit permettre d’enregistrer plusieurs offres fournisseurs.
12. Le système doit permettre de produire un comparatif d’offres fournisseurs.
13. Le système doit permettre de sélectionner un ou plusieurs fournisseurs pour un même besoin.
14. Le système doit permettre de générer un ou plusieurs bons de commande à partir d’une demande d’achat.
15. Le système doit permettre de suivre le statut d’une commande fournisseur.
16. Le système doit permettre de consulter l’historique des achats par affaire, projet ou fournisseur. 

## Module 6 — Stock / Logistique / Magasin

1. Le système doit permettre d’enregistrer une réception fournisseur.
2. Le système doit permettre d’enregistrer une réception partielle ou totale.
3. Le système doit permettre d’enregistrer les quantités effectivement reçues par ligne de commande.
4. Le système doit permettre de gérer plusieurs emplacements de stock.
5. Le système doit permettre d’affecter du matériel à un chantier, un site, un véhicule, un technicien ou une affaire.
6. Le système doit permettre de réserver du stock pour une affaire ou un projet.
7. Le système doit permettre de réaffecter en urgence un stock réservé à un autre chantier avec traçabilité et restitution ultérieure.
8. Le système doit permettre d’enregistrer les sorties de stock.
9. Le système doit permettre d’enregistrer les transferts de matériel entre emplacements.
10. Le système doit permettre d’enregistrer les retours de matériel vers l’entrepôt.
11. Le système doit permettre de réintégrer le matériel retourné dans le stock.
12. Le système doit permettre de consulter les mouvements de stock.
13. Le système doit permettre de suivre les niveaux de stock par emplacement.
14. Le système doit permettre de gérer des seuils d’alerte, seuils de commande et stock de rotation.
15. Le système doit permettre d’enregistrer les résultats d’inventaire.
16. Le système doit permettre de gérer la traçabilité par lot ou numéro de série pour certains équipements. 

## Module 7 — Exécution terrain / Ordres de travail

1. Le système doit permettre de créer un ordre de travail.
2. Le système doit permettre d’associer un ordre de travail à un site, un chantier, un projet, une affaire ou un ticket.
3. Le système doit permettre de définir un type d’ordre de travail.
4. Le système doit permettre de planifier un ordre de travail à une date.
5. Le système doit permettre d’affecter un ordre de travail à une équipe interne ou à un prestataire terrain.
6. Le système doit permettre de détailler les tâches à réaliser dans un ordre de travail.
7. Le système doit permettre à l’équipe terrain de démarrer une intervention.
8. Le système doit permettre d’enregistrer le temps passé sur une intervention.
9. Le système doit permettre d’enregistrer les matériels consommés pendant une intervention.
10. Le système doit permettre d’enregistrer les outils, équipements ou véhicules utilisés.
11. Le système doit permettre de renseigner des checklists d’exécution.
12. Le système doit permettre d’ajouter des photos à une intervention.
13. Le système doit permettre de déclarer des anomalies remontées sur le terrain.
14. Le système doit permettre d’enregistrer la correction d’une anomalie lorsqu’elle est traitée sur place.
15. Le système doit permettre d’identifier le prestataire ou fournisseur intervenant sur le terrain lorsqu’une prestation externe est réalisée.
16. Le système doit permettre de clôturer techniquement une intervention. 

## Module 8 — PV / Preuves de réalisation

1. Le système doit permettre de générer un PV lié à une intervention ou un ordre de travail.
2. Le système doit permettre de décrire les travaux réalisés dans le PV.
3. Le système doit permettre d’enregistrer les résultats des tests.
4. Le système doit permettre d’enregistrer des réserves.
5. Le système doit permettre d’ajouter des pièces jointes au PV.
6. Le système doit permettre d’enregistrer la signature du client.
7. Le système doit permettre de consulter les PV par affaire, site, intervention ou période.
8. Le système doit permettre de lier un PV validé à une étape de facturation. 

## Module 9 — Temps / Ressources / Pointage

1. Le système doit permettre de saisir des pointages journaliers.
2. Le système doit permettre de saisir le pointage d’une équipe ou d’un employé.
3. Le système doit permettre de distinguer les heures normales et supplémentaires.
4. Le système doit permettre de rattacher un pointage à une affaire, un chantier, un OT ou une tâche.
5. Le système doit permettre d’enregistrer l’utilisation d’engins.
6. Le système doit permettre d’enregistrer l’utilisation de véhicules.
7. Le système doit permettre d’enregistrer l’utilisation d’outils ou d’équipements.
8. Le système doit permettre de soumettre un pointage à validation hiérarchique.
9. Le système doit permettre d’enregistrer la validation ou correction d’un pointage.
10. Le système doit permettre de consulter les pointages par équipe, période, affaire ou chantier. 

## Module 10 — Coûts analytiques / Rentabilité

1. Le système doit permettre de calculer le coût réel d’une intervention.
2. Le système doit permettre de calculer le coût réel d’un site.
3. Le système doit permettre de calculer le coût réel d’un chantier.
4. Le système doit permettre de calculer le coût réel d’une affaire.
5. Le système doit permettre d’intégrer dans le coût réel les heures, déplacements, matériels consommés, engins, véhicules et sous-traitance.
6. Le système doit permettre de consolider les coûts par affaire, site, chantier ou client.
7. Le système doit permettre de comparer coûts réels et budget.
8. Le système doit permettre de calculer la marge réelle d’une affaire.
9. Le système doit permettre de consulter la rentabilité par client, projet ou site. 

## Module 11 — BTP / Avancement / Attachements / Situations

1. Le système doit permettre de saisir les quantités exécutées sur chantier.
2. Le système doit permettre de rattacher les quantités à une période et à une affaire ou chantier.
3. Le système doit permettre de créer un attachement.
4. Le système doit permettre d’associer des quantités réalisées à un attachement.
5. Le système doit permettre de soumettre un attachement à validation.
6. Le système doit permettre d’enregistrer la validation des quantités.
7. Le système doit permettre de générer une situation de travaux à partir des quantités validées.
8. Le système doit permettre de valoriser les quantités selon le cadre contractuel applicable.
9. Le système doit permettre de calculer retenues, acomptes, avances ou pénalités.
10. Le système doit permettre d’afficher le net à facturer.
11. Le système doit permettre de consulter l’historique des avancements, attachements et situations. 

## Module 12 — Facturation

1. Le système doit permettre de créer une facture client.
2. Le système doit permettre de générer une facture à partir d’un PV validé.
3. Le système doit permettre de générer une facture à partir d’une situation validée.
4. Le système doit permettre de prendre en charge différents modes de facturation, y compris la maintenance ou le SAV facturable.
5. Le système doit permettre d’associer une facture à une affaire, un projet, un contrat, un site ou une intervention.
6. Le système doit permettre de consulter l’historique des factures émises.
7. Le système doit permettre de suivre le reste à facturer.
8. Le système doit permettre d’annuler ou corriger une facture selon les droits autorisés.  

## Module 13 — Encaissement / Recouvrement

1. Le système doit permettre d’enregistrer un règlement client.
2. Le système doit permettre d’associer un règlement à une ou plusieurs factures.
3. Le système doit permettre de suivre les échéances de paiement.
4. Le système doit permettre d’identifier les factures en retard de paiement.
5. Le système doit permettre d’enregistrer des actions de relance.
6. Le système doit permettre de consulter l’historique de recouvrement par client.
7. Le système doit permettre de calculer les montants facturés, encaissés et restant dus. 

## Module 14 — SAV / Maintenance / Ticketing

1. Le système doit permettre de créer un ticket incident.
2. Le système doit permettre d’associer un ticket à un client, un site et une catégorie.
3. Le système doit permettre d’enregistrer une priorité et un SLA.
4. Le système doit permettre de consulter l’historique des incidents d’un site.
5. Le système doit permettre de consulter la base installée du site concerné.
6. Le système doit permettre d’affecter un ticket à un support ou technicien.
7. Le système doit permettre de générer un ordre d’intervention depuis un ticket.
8. Le système doit permettre d’enregistrer un diagnostic.
9. Le système doit permettre d’enregistrer les pièces remplacées.
10. Le système doit permettre d’enregistrer le temps passé sur incident.
11. Le système doit permettre d’enregistrer la cause racine.
12. Le système doit permettre de clôturer un ticket.
13. Le système doit permettre d’indiquer si l’intervention est couverte par contrat ou garantie.
14. Le système doit permettre d’indiquer si l’intervention de maintenance ou de SAV est facturable. 

## Module 15 — Planning / Coordination opérationnelle

1. Le système doit permettre de créer un planning d’affaire ou projet.
2. Le système doit permettre de planifier des chantiers, interventions et jalons.
3. Le système doit permettre d’affecter des équipes aux activités planifiées.
4. Le système doit permettre d’affecter des moyens matériels aux activités planifiées.
5. Le système doit permettre de suivre les dates prévisionnelles et réelles.
6. Le système doit permettre de replanifier une activité.
7. Le système doit permettre de consulter une vue consolidée du planning d’un projet.  

## Module 16 — Gouvernance / Validation / Contrôle interne

1. Le système doit permettre de configurer des circuits de validation pour les offres.
2. Le système doit permettre de configurer des circuits de validation pour les budgets.
3. Le système doit permettre de configurer des circuits de validation pour les demandes d’achat.
4. Le système doit permettre d’enregistrer une décision d’approbation ou de rejet.
5. Le système doit permettre de tracer l’identité du valideur et la date de décision.
6. Le système doit permettre de consulter l’historique des validations.
7. Le système doit empêcher la progression d’un objet lorsque la validation requise n’est pas obtenue.  

## Module 17 — Reporting / KPI / Direction

1. Le système doit permettre d’afficher le taux de transformation des offres.
2. Le système doit permettre d’afficher le montant du carnet de commandes.
3. Le système doit permettre d’afficher la marge prévue versus la marge réelle.
4. Le système doit permettre d’afficher le coût réel par projet.
5. Le système doit permettre d’afficher le reste à engager.
6. Le système doit permettre d’afficher les délais projet.
7. Le système doit permettre d’afficher l’avancement physique versus financier.
8. Le système doit permettre d’afficher la consommation matérielle.
9. Le système doit permettre d’afficher la productivité des équipes.
10. Le système doit permettre d’afficher le nombre de tickets et le respect des SLA.
11. Le système doit permettre d’afficher le temps moyen de résolution.
12. Le système doit permettre d’afficher les factures émises, les encaissements, le reste à facturer et le DSO (délai de paiement).
13. Le système doit permettre d’afficher la rentabilité par client, projet ou site. 

## Module 18 — Vue transverse Affaire / Projet

1. Le système doit permettre d’afficher une vue 360 d’un projet et, si nécessaire, de son affaire de rattachement.
2. Le système doit permettre de regrouper sur une même fiche les données de demande de cotation, offre, contrat, budget, achats, stock, OT, PV, avancement, facturation et maintenance liées à un projet.
3. Le système doit permettre d’afficher le réalisé à date d’un projet.
4. Le système doit permettre d’afficher les risques et blocages signalés sur un projet ou sur son affaire de rattachement.
5. Le système doit permettre de suivre la performance globale d’un projet depuis son lancement jusqu’à sa clôture.  

La suite logique est **3-b) Acceptance criteria**, toujours **module par module**.
