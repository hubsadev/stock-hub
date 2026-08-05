Parfait. Voici le **2-b) User stories**, toujours **module par module**, formulé de manière simple et exploitable pour la suite. Je reste volontairement au niveau user stories uniquement, sans entrer encore dans les functional requirements ni les acceptance criteria. 

# 2-b) User stories

## Module 1 — Référentiel

1. En tant qu’administrateur ou gestionnaire référentiel, je veux créer un client afin qu’il puisse être utilisé dans les offres, contrats, projets et factures.
2. En tant qu’utilisateur autorisé, je veux modifier les informations d’un client afin de garder des données à jour.
3. En tant qu’administrateur ou gestionnaire référentiel, je veux créer un fournisseur afin de pouvoir lancer des achats.
4. En tant qu’utilisateur autorisé, je veux enregistrer un article ou une prestation afin qu’il soit utilisable dans les achats, stocks et offres.
5. En tant qu’utilisateur autorisé, je veux définir les caractéristiques d’un article afin de distinguer précisément les besoins terrain.
6. En tant qu’utilisateur autorisé, je veux enregistrer un site afin de rattacher les interventions, équipements et tickets au bon emplacement.
7. En tant qu’utilisateur autorisé, je veux enregistrer un dépôt afin de suivre correctement les stocks.
8. En tant qu’utilisateur autorisé, je veux enregistrer un employé, un sous-traitant, un véhicule ou un équipement afin de pouvoir les affecter aux opérations.
9. En tant qu’utilisateur autorisé, je veux désactiver une donnée du référentiel sans supprimer l’historique afin de préserver la traçabilité. 

## Module 2 — Avant-vente

1. En tant que direction, je veux créer une demande de cotation afin de suivre une nouvelle demande client ou appel d’offres.
2. En tant que direction, je veux enregistrer un appel d’offres afin d’en suivre les échéances et le périmètre.
3. En tant que bureau d’études, je veux saisir les métrés, quantitatifs, besoins matériels et besoins en main-d’œuvre afin de produire une étude exploitable.
4. En tant que chef de projet, je veux construire une offre multi-lots et choisir son type, devis ou facture proforma, afin de chiffrer correctement une offre complexe.
5. En tant que chef de projet, je veux créer plusieurs versions d’une offre afin d’intégrer les ajustements sans perdre l’historique.
6. En tant que direction ou valideur, je veux voir le coût estimé, la marge brute et le taux de marge afin de décider si l’offre peut être envoyée.
7. En tant que direction ou contrôle de gestion, je veux recevoir une alerte si la marge passe sous un seuil configurable afin d’arbitrer le risque sans bloquer mécaniquement le dossier.
8. En tant que valideur technique, je veux approuver ou rejeter une offre afin d’éviter l’envoi d’une proposition techniquement non conforme.
9. En tant que direction, je veux approuver ou rejeter toute offre afin de contrôler le risque commercial et financier.
10. En tant que direction, je veux envoyer une offre validée au client afin d’avancer dans le cycle commercial.
11. En tant que direction ou chef de projet, je veux marquer une offre comme retenue, infirmée ou sans suite afin de refléter la décision du client. 

## Module 3 — Contrats / Affaires / Projets

1. En tant que direction ou chef de projet, je veux transformer une offre retenue en contrat afin de lancer l’exécution.
2. En tant que chef de projet, je veux créer un ou plusieurs projets à partir d’un contrat signé afin d’avoir un cadre unique de pilotage opérationnel.
3. En tant que chef de projet, je veux découper un projet en zones, sites et sous-lots afin d’organiser l’exécution.
4. En tant que chef de projet, je veux affecter un responsable à un projet afin qu’il soit piloté clairement.
5. En tant que direction ou management projet, je veux consulter une fiche projet consolidée afin de suivre l’exécution dans sa globalité.
6. En tant que chef de projet, je veux modifier le découpage d’un projet lorsque le périmètre évolue afin que l’organisation reflète la réalité terrain.
7. En tant que direction ou contrôle de gestion, je veux conserver une vue affaire de rattachement afin de suivre les engagements contractuels et analytiques. 

## Module 4 — Budget / Pilotage financier projet

1. En tant que chef de projet, je veux créer un budget initial par poste de coût afin d’encadrer financièrement l’affaire.
2. En tant que chef de projet ou contrôleur de gestion, je veux rattacher le budget à une affaire, un projet ou un centre de coût afin d’assurer le bon suivi analytique.
3. En tant que valideur autorisé, je veux valider un budget avant lancement des achats afin de maîtriser les engagements.
4. En tant que chef de projet, je veux réviser un budget existant afin de refléter les changements réels du projet.
5. En tant que direction, je veux comparer budget initial, budget révisé et consommé afin d’identifier les dérives.
6. En tant que direction, je veux suivre la marge cible de l’affaire afin de préserver la rentabilité. 

## Module 5 — Achats

1. En tant que conducteur de travaux, superviseur ou chef de projet, je veux saisir un besoin afin de déclencher l’approvisionnement nécessaire.
2. En tant que magasinier ou responsable logistique, je veux vérifier le stock disponible avant achat afin d’éviter une commande inutile.
3. En tant que magasinier, je veux affecter le stock disponible à un besoin validé afin de servir le terrain sans attendre le processus achat.
4. En tant qu’acheteur, je veux transformer uniquement le manque en demande d’achat afin de lancer le processus achat formel sur le reliquat.
5. En tant qu’acheteur, je veux rattacher une demande d’achat à une affaire, un projet ou un stock central afin d’en garantir la destination.
6. En tant que comptable achats, responsable achats, direction stratégie et développement ou DG, je veux approuver ou rejeter une demande d’achat afin de contrôler les dépenses selon mon niveau d’autorité.
7. En tant que responsable achats, je veux consulter plusieurs fournisseurs afin d’obtenir les meilleures offres.
8. En tant que responsable achats, je veux comparer les offres fournisseurs selon le prix, la disponibilité et les caractéristiques afin de choisir la solution la plus adaptée.
9. En tant que responsable achats, je veux sélectionner plusieurs fournisseurs pour un même besoin afin de couvrir une quantité insuffisante chez un seul fournisseur.
10. En tant que responsable achats, je veux générer un ou plusieurs bons de commande fournisseur afin de formaliser l’engagement d’achat.
11. En tant que chef de projet ou responsable achats, je veux suivre l’état des commandes afin d’anticiper les retards d’approvisionnement. 

## Module 6 — Stock / Logistique / Magasin

1. En tant que magasinier, je veux enregistrer une réception fournisseur afin de mettre à jour le stock.
2. En tant que magasinier, je veux enregistrer une réception partielle afin de refléter la réalité des livraisons.
3. En tant que magasinier, je veux affecter du matériel à un chantier, un site, un véhicule ou un technicien afin qu’il soit disponible pour l’exécution.
4. En tant que magasinier, je veux réserver du stock pour une affaire afin de sécuriser sa disponibilité.
5. En tant que magasinier, je veux réaffecter en urgence un stock réservé à un autre chantier si nécessaire afin de traiter les priorités terrain.
6. En tant que magasinier, je veux enregistrer une sortie de stock afin d’assurer la traçabilité des mouvements.
7. En tant que magasinier, je veux enregistrer un transfert entre dépôts ou chantiers afin de réallouer les ressources en fonction des besoins.
8. En tant que magasinier, je veux enregistrer un retour de matériel à l’entrepôt afin de réintégrer les articles non consommés.
9. En tant que responsable logistique, je veux consulter le stock par emplacement afin de savoir ce qui est disponible.
10. En tant que responsable logistique, je veux suivre les seuils d’alerte, de rotation et de commande afin d’éviter les ruptures. 

## Module 7 — Exécution terrain / Ordres de travail

1. En tant que planificateur, chef de projet ou support, je veux créer un ordre de travail afin de formaliser une intervention à réaliser.
2. En tant que planificateur, je veux affecter un ordre de travail à une équipe interne ou à un prestataire et à une date afin d’organiser l’exécution.
3. En tant que chef d’équipe ou technicien, je veux démarrer une intervention depuis le terrain afin de signaler le début réel de l’exécution.
4. En tant que chef d’équipe ou technicien, je veux déclarer les heures passées afin que le coût réel soit calculé.
5. En tant que chef d’équipe ou technicien, je veux déclarer les matériels consommés afin que le stock et le coût soient mis à jour.
6. En tant que chef d’équipe ou technicien, je veux renseigner une checklist afin de prouver que les étapes obligatoires ont été réalisées.
7. En tant que chef d’équipe ou technicien, je veux joindre des photos afin de documenter l’intervention.
8. En tant que chef d’équipe ou technicien, je veux signaler une anomalie et la corriger si possible afin de sécuriser la qualité d’exécution.
9. En tant que chef de projet, je veux identifier le prestataire intervenant et son coût afin de pouvoir le payer et intégrer sa prestation au coût réel.
10. En tant que chef d’équipe ou technicien, je veux clôturer techniquement une intervention afin de passer à l’étape de validation ou de facturation.
11. En tant que chef de projet, je veux consulter l’historique des interventions afin de suivre la réalisation sur le terrain. 

## Module 8 — PV / Preuves de réalisation

1. En tant que chef d’équipe ou technicien, je veux générer un PV après intervention afin de formaliser ce qui a été livré ou réalisé.
2. En tant que chef d’équipe ou technicien, je veux saisir les résultats des tests afin de prouver la conformité technique.
3. En tant que chef d’équipe ou technicien, je veux enregistrer les réserves éventuelles afin qu’elles soient traitées officiellement.
4. En tant que représentant client, je veux signer le PV afin de confirmer la réalisation.
5. En tant que chef de projet ou comptable, je veux utiliser un PV validé comme justificatif de facturation afin de sécuriser la facturation. 

## Module 9 — Temps / Ressources / Pointage

1. En tant que chef d’équipe, je veux saisir le pointage quotidien des équipes afin d’enregistrer le travail réalisé.
2. En tant que chef d’équipe, je veux distinguer les heures normales et supplémentaires afin d’avoir un suivi correct du temps.
3. En tant que chef d’équipe, je veux rattacher les heures à une affaire, un chantier, une tâche ou un OT afin qu’elles soient correctement imputées.
4. En tant que chef d’équipe, je veux déclarer l’utilisation des engins, véhicules et outils afin que leur coût soit pris en compte.
5. En tant que superviseur ou responsable hiérarchique, je veux valider ou corriger les pointages afin d’assurer leur fiabilité.
6. En tant que chef de projet, je veux consulter les pointages par période ou par affaire afin de suivre l’effort réellement consommé. 

## Module 10 — Coûts analytiques / Rentabilité

1. En tant que chef de projet, je veux calculer le coût réel d’une intervention afin d’évaluer sa rentabilité.
2. En tant que chef de projet, je veux calculer le coût réel d’un site, chantier ou projet afin de piloter la performance.
3. En tant que contrôleur de gestion, je veux consolider les coûts de main-d’œuvre, déplacement, matériel, engins et sous-traitance afin d’obtenir le coût complet.
4. En tant que direction, je veux comparer le coût réel au budget afin d’identifier les écarts.
5. En tant que direction, je veux calculer la marge réelle par affaire, client ou site afin de prendre de meilleures décisions. 

## Module 11 — BTP / Avancement / Attachements / Situations

1. En tant que superviseur ou conducteur de travaux, je veux saisir les quantités exécutées afin de suivre l’avancement réel du chantier.
2. En tant que superviseur ou conducteur de travaux, je veux créer un attachement afin de justifier les quantités réalisées.
3. En tant que valideur interne ou client, je veux valider les quantités de l’attachement afin de confirmer ce qui est reconnu.
4. En tant que comptable ou chef de projet, je veux générer une situation mensuelle à partir des quantités validées afin de préparer la facturation.
5. En tant que comptable ou chef de projet, je veux calculer les retenues, avances, acomptes ou pénalités afin d’obtenir le net à facturer.
6. En tant que direction projet, je veux consulter l’historique des avancements et situations afin de suivre le chantier dans le temps. 

## Module 12 — Facturation

1. En tant que comptable, je veux créer une facture à partir d’un PV validé afin de facturer une installation ou une intervention.
2. En tant que comptable, je veux créer une facture à partir d’une situation validée afin de facturer des travaux BTP.
3. En tant que comptable, je veux créer une facture selon le mode contractuel applicable afin de respecter le contrat.
4. En tant que comptable, je veux créer une facture de maintenance ou SAV lorsqu’une intervention est facturable afin de refléter correctement le contrat ou le hors-périmètre.
5. En tant que comptable, je veux consulter les factures émises par client ou affaire afin de suivre la facturation.
6. En tant que responsable autorisé, je veux corriger ou annuler une facture dans les cas permis afin de traiter les erreurs de facturation.  

## Module 13 — Encaissement / Recouvrement

1. En tant que comptable, je veux enregistrer un encaissement client afin de suivre les paiements reçus.
2. En tant que comptable, je veux rapprocher un règlement avec une facture afin de savoir ce qui est soldé.
3. En tant que comptable, je veux identifier les échéances à venir et les impayés afin d’organiser le recouvrement.
4. En tant que comptable, je veux déclencher et suivre des relances afin d’accélérer les paiements.
5. En tant que direction financière, je veux consulter les montants facturés, encaissés et restant dus afin de piloter la trésorerie.  

## Module 14 — SAV / Maintenance / Ticketing

1. En tant que support, je veux créer un ticket incident afin d’enregistrer une panne signalée par le client.
2. En tant que support, je veux affecter une priorité et un SLA à un ticket afin de respecter les engagements de service.
3. En tant que support ou technicien, je veux consulter l’historique du site et des équipements afin de mieux diagnostiquer l’incident.
4. En tant que support, je veux transformer un ticket en ordre d’intervention afin de déclencher une action terrain.
5. En tant que technicien, je veux enregistrer le diagnostic, les pièces remplacées et le temps passé afin de documenter la résolution.
6. En tant que support ou gestionnaire contrat, je veux déterminer si l’intervention est couverte par contrat ou garantie afin de savoir si elle doit être facturée.
7. En tant que support, je veux clôturer le ticket après résolution afin de finaliser le traitement.
8. En tant que manager support, je veux suivre le respect des SLA et les temps de résolution afin d’améliorer le service. 

## Module 15 — Planning / Coordination opérationnelle

1. En tant que planificateur ou chef de projet, je veux planifier les chantiers et interventions afin d’organiser les ressources dans le temps.
2. En tant que planificateur, je veux affecter les équipes et moyens aux activités prévues afin de garantir leur exécution.
3. En tant que chef de projet, je veux définir des jalons afin de suivre la progression du projet.
4. En tant que chef de projet, je veux replanifier une activité en cas de contrainte ou retard afin de maintenir la continuité opérationnelle.
5. En tant que direction ou chef de projet, je veux consulter le planning global d’un projet afin d’avoir une vue d’ensemble.  

## Module 16 — Gouvernance / Validation / Contrôle interne

1. En tant qu’administrateur métier, je veux définir des circuits de validation afin d’encadrer les étapes sensibles.
2. En tant que valideur, je veux approuver ou rejeter une offre, un budget ou un achat afin de contrôler les engagements.
3. En tant qu’auditeur interne ou manager, je veux consulter l’historique des validations afin de vérifier qui a décidé quoi et quand.
4. En tant que système de contrôle, je veux bloquer la progression d’un objet non validé afin d’imposer le respect des procédures.  

## Module 17 — Reporting / KPI / Direction

1. En tant que direction, je veux consulter le taux de transformation des offres afin de mesurer la performance commerciale.
2. En tant que direction, je veux consulter le carnet de commandes afin d’anticiper l’activité à venir.
3. En tant que direction, je veux comparer marge prévue et marge réelle afin d’identifier les dérives.
4. En tant que direction, je veux consulter l’avancement physique et financier des projets afin de suivre leur santé globale.
5. En tant que direction, je veux suivre la productivité, les retards, les tickets, les SLA, les factures et les encaissements afin de piloter l’entreprise.
6. En tant que direction, je veux analyser la rentabilité par client, projet ou site afin d’orienter les décisions stratégiques. 

## Module 18 — Vue transverse Affaire / Projet

1. En tant que chef de projet, je veux consulter une vue 360 d’un projet afin d’avoir tous les éléments au même endroit.
2. En tant que direction, je veux voir sur une seule fiche les offres, contrats, budgets, achats, stocks, OT, PV, avancement, factures et tickets liés à un projet afin de piloter plus vite.
3. En tant que chef de projet, je veux suivre le réalisé à date afin de comparer prévisionnel et réalité.
4. En tant que direction ou chef de projet, je veux suivre les risques et blocages d’un projet ou de son affaire de rattachement afin d’anticiper les dérives ou retards.  

La suite logique est **3-a) Functional requirements**, toujours **module par module**.
