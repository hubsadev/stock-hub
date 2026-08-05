Parfait. Je te donne **les deux** :

1. **User flows par module**
2. **User flows par grands processus métier de bout en bout**

Je reste cohérent avec toute la hiérarchie déjà construite, et je formule les flows de manière procédurale, exploitable pour la spécification détaillée plus tard. 

# 4) User flows

---

# 4-A) User flows **module par module**

## Module 1 — Référentiel

### Flow 1 — Créer un client

1. L’utilisateur ouvre le module Référentiel.
2. Il choisit “Clients”.
3. Il clique sur “Créer”.
4. Il renseigne les informations générales du client.
5. Il enregistre la fiche.
6. Le système attribue une référence unique.
7. Le client devient disponible dans les modules Avant-vente, Contrats, Facturation et SAV. 

### Flow 2 — Créer un article

1. L’utilisateur ouvre le module Articles.
2. Il choisit le type : matériel ou prestation.
3. Il renseigne le libellé, la catégorie et les caractéristiques.
4. Il enregistre la fiche article.
5. L’article devient disponible dans les offres, achats et stocks. 

### Flow 3 — Désactiver une donnée référentielle

1. L’utilisateur ouvre une fiche existante.
2. Il choisit l’action “Désactiver”.
3. Le système vérifie si la donnée est déjà utilisée historiquement.
4. La fiche passe en inactif.
5. Elle reste visible dans l’historique mais n’est plus proposée dans les nouveaux flux. 

---

## Module 2 — Avant-vente

### Flow 1 — Créer une demande de cotation

1. La direction crée une demande de cotation.
2. Elle sélectionne le client.
3. Elle renseigne l’objet, le type de demande, la date limite et le montant estimé.
4. Elle enregistre.
5. La demande de cotation passe dans le pipe avant-vente. 

### Flow 2 — Produire une étude technique

1. La direction ou le chef de projet transmet le dossier au bureau d’études.
2. Le bureau d’études renseigne métrés, quantitatifs, besoins matériels, besoins humains, durée et contraintes terrain.
3. L’étude est sauvegardée.
4. Les données deviennent exploitables pour le chiffrage. 

### Flow 3 — Construire et valider une offre

1. Le chef de projet crée une offre liée à la demande de cotation.
2. Il choisit le type d’offre : devis ou facture proforma.
3. Il structure l’offre par lots.
4. Il renseigne les montants de vente et coûts estimés.
5. Le système calcule marge brute et taux de marge.
6. Si la marge est sous le seuil configuré, une alerte visible est affichée.
7. L’offre est soumise à validation technique.
8. Après validation technique, elle est soumise à la direction.
9. Après validation complète, elle est envoyée au client.
10. Le dossier attend ensuite la décision client. 

### Flow 4 — Gérer une nouvelle version d’offre

1. Un utilisateur du dossier ouvre une offre existante.
2. Il crée une nouvelle version.
3. Il modifie les lots, prix, hypothèses ou le type d’offre.
4. Il soumet à nouveau au circuit de validation.
5. La nouvelle version devient la version active si validée. 

---

## Module 3 — Contrats / Affaires / Projets

### Flow 1 — Transformer une offre retenue en contrat

1. La direction ou le chef de projet marque l’offre comme retenue.
2. Il lance l’action de transformation.
3. Le système crée le contrat.
4. Le système crée ensuite un ou plusieurs projets associés.
5. Le projet devient le point central de pilotage opérationnel. 

### Flow 2 — Structurer un projet

1. Le chef de projet ouvre le nouveau projet.
2. Il affecte un responsable.
3. Il renseigne dates, type de projet, montant contrat et affaire de rattachement si nécessaire.
4. Il découpe le projet en zones, sites, sous-lots et maintenance.
5. Il sauvegarde la structure.
6. Les autres modules pourront ensuite rattacher leurs objets à ce projet. 

---

## Module 4 — Budget / Pilotage financier projet

### Flow 1 — Créer un budget initial

1. Le chef de projet ouvre l’affaire.
2. Il crée un budget.
3. Il saisit les montants par poste : main-d’œuvre, achats, sous-traitance, logistique, divers.
4. Il enregistre le budget.
5. Il le soumet à validation.
6. Une fois validé, le budget devient la référence de pilotage. 

### Flow 2 — Réviser un budget

1. Le chef de projet ou la finance constate une dérive.
2. Il crée une version révisée.
3. Il ajuste les postes nécessaires.
4. Il soumet la révision à validation.
5. Après validation, la nouvelle version devient la référence active.
6. L’ancienne version reste historisée. 

---

## Module 5 — Achats

### Flow 1 — Saisir un besoin

1. Le conducteur de travaux, superviseur ou chef de projet constate un besoin.
2. Il crée une expression de besoin.
3. Il renseigne articles, quantités, caractéristiques et destination.
4. Le besoin est enregistré. 

### Flow 2 — Vérifier le stock puis créer la demande d’achat sur le manque

1. Le magasinier ou le responsable logistique vérifie le stock disponible.
2. Si le stock couvre le besoin, il affecte le matériel au chantier, site ou technicien.
3. Si le stock ne couvre pas totalement le besoin, l’acheteur crée une DA uniquement pour le manque.
4. La DA est rattachée à une affaire, un projet ou un stock central.
5. La DA est soumise au circuit de validation.
6. Les valideurs comptables, achats, direction stratégie et développement et DG approuvent ou rejettent selon leur niveau. 

### Flow 3 — Consulter les fournisseurs et commander

1. Après validation, l’acheteur consulte plusieurs fournisseurs.
2. Il saisit les offres reçues.
3. Il construit le comparatif prix, disponibilité et caractéristiques.
4. Il choisit un ou plusieurs fournisseurs.
5. Il génère un ou plusieurs bons de commande.
6. Les commandes passent en suivi fournisseur. 

---

## Module 6 — Stock / Logistique / Magasin

### Flow 1 — Réceptionner une commande

1. Le magasinier ouvre la commande fournisseur attendue.
2. Il enregistre la réception.
3. Il indique les quantités réellement reçues.
4. Le système crée le bon de réception.
5. Le stock est mis à jour par emplacement. 

### Flow 2 — Affecter du matériel

1. Le magasinier consulte les besoins chantier ou site.
2. Il prépare la sortie de stock.
3. Il affecte les quantités vers chantier, site, véhicule, technicien ou stock réservé.
4. Le mouvement est enregistré.
5. Les quantités disponibles sont recalculées. 

### Flow 3 — Retour ou transfert de matériel

1. Un besoin de retour ou de transfert est initié.
2. Le magasinier choisit l’origine et la destination.
3. Il enregistre les quantités déplacées.
4. Le système trace le mouvement.
5. Le stock est mis à jour sur les deux emplacements. 

---

## Module 7 — Exécution terrain / Ordres de travail

### Flow 1 — Créer et planifier un OT

1. Le planificateur, support ou chef de projet crée un OT.
2. Il choisit le type d’intervention.
3. Il associe le site, l’équipe interne ou le prestataire, la date et les tâches.
4. L’OT est affecté à l’équipe terrain ou au prestataire concerné. 

### Flow 2 — Réaliser une intervention

1. Le chef d’équipe ouvre l’OT sur mobile ou tablette.
2. Il démarre l’intervention.
3. Il exécute les tâches.
4. Il déclare les heures passées.
5. Il déclare les matériels consommés.
6. Il déclare les véhicules, équipements et outils utilisés.
7. Il remplit les checklists.
8. Il prend des photos.
9. Il signale ou corrige les anomalies.
10. Si un prestataire intervient, son identité et sa prestation sont enregistrées.
11. Il clôture techniquement l’intervention. 

---

## Module 8 — PV / Preuves de réalisation

### Flow 1 — Générer un PV

1. Après intervention, l’équipe ouvre l’action “Générer PV”.
2. Elle renseigne les travaux réalisés.
3. Elle renseigne les résultats de tests.
4. Elle ajoute les réserves éventuelles.
5. Elle joint les photos ou preuves utiles.
6. Le client signe.
7. Le PV est enregistré comme preuve d’exécution. 

---

## Module 9 — Temps / Ressources / Pointage

### Flow 1 — Saisir le pointage journalier

1. Le chef d’équipe ouvre le pointage du jour.
2. Il renseigne la présence, les heures normales et supplémentaires.
3. Il rattache les temps à l’affaire, tâche, chantier ou OT.
4. Il déclare les ressources utilisées.
5. Il soumet le pointage.
6. Le responsable hiérarchique valide ou corrige. 

---

## Module 10 — Coûts analytiques / Rentabilité

### Flow 1 — Calculer le coût réel

1. Le système agrège temps validés, consommations, déplacements, engins, sous-traitance et autres charges.
2. Il calcule le coût réel au niveau intervention, site, chantier et affaire.
3. Le chef de projet ou le contrôle de gestion consulte la synthèse.
4. Le système compare coût réel et budget.
5. Les écarts sont visibles. 

---

## Module 11 — BTP / Avancement / Attachements / Situations

### Flow 1 — Saisir l’avancement

1. Le superviseur saisit les quantités exécutées sur la période.
2. Il enregistre les unités d’œuvre réalisées.
3. Les quantités sont proposées pour validation. 

### Flow 2 — Produire un attachement

1. Le superviseur crée l’attachement.
2. Il reprend les quantités exécutées.
3. L’attachement est soumis pour validation.
4. Une fois validé, il devient la base de valorisation. 

### Flow 3 — Générer une situation

1. Le comptable ou le chef de projet ouvre la période de situation.
2. Il sélectionne les quantités validées.
3. Le système valorise les travaux.
4. Il applique retenues, acomptes, pénalités ou avances.
5. Le net à facturer est calculé.
6. La situation est validée puis utilisée pour la facturation. 

---

## Module 12 — Facturation

### Flow 1 — Facturer depuis un justificatif

1. Le comptable ouvre le module Facturation.
2. Il sélectionne le projet ou l’affaire et la base de facturation : PV, situation, forfait, site, intervention ou maintenance facturable.
3. Le système calcule le montant selon les règles applicables.
4. Le comptable vérifie la facture.
5. La facture est validée puis émise au client.  

---

## Module 13 — Encaissement / Recouvrement

### Flow 1 — Enregistrer un règlement

1. Le comptable ouvre la facture ou le dossier client.
2. Il saisit le paiement reçu.
3. Il rapproche le règlement avec une ou plusieurs factures.
4. Le solde restant dû est recalculé. 

### Flow 2 — Relancer un impayé

1. Le comptable consulte les factures échues.
2. Il sélectionne celles à relancer.
3. Il enregistre l’action de relance.
4. Le dossier client garde l’historique de recouvrement. 

---

## Module 14 — SAV / Maintenance / Ticketing

### Flow 1 — Créer un ticket incident

1. Le support reçoit un signalement client.
2. Il crée un ticket.
3. Il renseigne site, catégorie, priorité, symptôme et SLA.
4. Le ticket est qualifié puis affecté. 

### Flow 2 — Traiter un ticket

1. Le support consulte l’historique site et la base installée.
2. Il effectue un premier diagnostic.
3. Si nécessaire, il crée un OT.
4. Le technicien intervient.
5. Il remplace les pièces si besoin.
6. Il teste le service.
7. Il renseigne la cause racine.
8. Le ticket est clôturé.
9. La facturabilité est déterminée selon contrat, garantie ou hors périmètre.
10. Si l’intervention est facturable, elle est transmise à la comptabilité pour facturation SAV ou maintenance. 

---

## Module 15 — Planning / Coordination opérationnelle

### Flow 1 — Planifier une activité

1. Le planificateur ouvre le planning projet.
2. Il crée une activité.
3. Il choisit date, équipe, ressources et jalon concerné.
4. L’activité est enregistrée.
5. Les équipes concernées peuvent la consulter. 

### Flow 2 — Replanifier une activité

1. Le chef de projet constate un retard ou contrainte.
2. Il modifie la date ou l’affectation.
3. Le planning est mis à jour.
4. L’historique ou la trace de replanification est conservé selon le modèle retenu. 

---

## Module 16 — Gouvernance / Validation / Contrôle interne

### Flow 1 — Soumettre un objet à validation

1. L’utilisateur finalise un objet : offre, budget ou DA.
2. Il clique sur “Soumettre”.
3. Le système l’envoie au circuit défini.
4. Chaque valideur approuve ou rejette.
5. Le système historise les décisions.
6. Si toutes les validations requises sont obtenues, l’objet devient exploitable pour l’étape suivante.  

---

## Module 17 — Reporting / KPI / Direction

### Flow 1 — Consulter un tableau de bord

1. La direction ouvre le cockpit ERP.
2. Elle choisit la période ou le périmètre.
3. Le système affiche KPI commerce, projet, chantier, maintenance et finance.
4. La direction filtre par client, affaire, site ou période.
5. Elle analyse les écarts et risques. 

---

## Module 18 — Vue transverse Affaire / Projet

### Flow 1 — Ouvrir une vue 360 projet

1. Le chef de projet ou la direction ouvre la fiche projet.
2. Le système affiche demande de cotation, offre, contrat, budget, achats, stock, OT, PV, avancement, facturation, encaissement et maintenance.
3. L’utilisateur navigue d’un volet à l’autre.
4. Il suit le réalisé à date et les risques.
5. Il utilise cette vue comme cockpit opérationnel du projet.  

---

# 4-B) User flows **par grands processus métier de bout en bout**

## Processus 1 — Avant-vente jusqu’à contrat signé

1. La direction reçoit un appel d’offres ou une demande client.
2. Elle crée la demande de cotation.
3. Le bureau d’études produit l’étude technique.
4. Le chef de projet construit l’offre multi-lots et en choisit le type, devis ou facture proforma.
5. Le système calcule les marges.
6. L’offre passe par validation technique.
7. L’offre passe par validation direction.
8. L’offre validée est envoyée au client.
9. Le client accepte ou refuse.
10. Si l’offre est retenue, elle est transformée en contrat puis en projet. 

## Processus 2 — Contrat signé jusqu’au lancement opérationnel

1. L’offre retenue devient contrat.
2. Le contrat donne naissance à un ou plusieurs projets.
3. Le chef de projet structure le projet en zones, sites, sous-lots et maintenance.
4. Le budget initial est saisi.
5. Le budget est validé.
6. Le planning initial est établi.
7. Le projet est prêt pour l’exécution. 

## Processus 3 — Besoin terrain jusqu’à approvisionnement

1. Le terrain exprime un besoin.
2. Le magasin vérifie d’abord si le besoin peut être couvert par le stock.
3. Si le stock suffit, il est affecté directement au projet ou au chantier.
4. Si le stock est insuffisant, le besoin non couvert devient une demande d’achat.
5. La demande suit le circuit de validation.
6. L’acheteur consulte les fournisseurs.
7. Il compare les offres.
8. Il sélectionne un ou plusieurs fournisseurs.
9. Il génère les commandes.
10. Les fournisseurs livrent.
11. Le magasin enregistre les réceptions.
12. Le matériel devient disponible en stock ou affecté au projet. 

## Processus 4 — Stock jusqu’à exécution terrain

1. Le matériel reçu est stocké par emplacement.
2. Le magasinier réserve ou affecte le matériel à un projet, un chantier ou un site.
3. Un OT est créé et affecté à une équipe ou à un prestataire.
4. L’équipe récupère le matériel affecté.
5. L’intervention est réalisée sur le terrain.
6. Les consommations sont déclarées.
7. Les stocks et coûts sont impactés. 

## Processus 5 — Intervention terrain jusqu’à PV puis facturation

1. Le planificateur crée l’OT.
2. L’équipe interne ou le prestataire exécute l’intervention.
3. Elle renseigne heures, matériel, équipements, photos, checklist et anomalies.
4. Elle génère le PV.
5. Le client signe le PV.
6. Le PV validé devient justificatif de facturation.
7. Le comptable émet la facture.
8. La facture entre dans le cycle d’encaissement. 

## Processus 6 — Pointage jusqu’au coût réel projet

1. Les équipes saisissent les pointages journaliers.
2. Les responsables valident les heures et ressources.
3. Le système impute les temps au projet, OT, tâche ou chantier.
4. Les données alimentent le coût analytique.
5. Le coût réel est calculé par intervention, site, chantier et projet.
6. Le chef de projet compare réel et budget. 

## Processus 7 — BTP avancement jusqu’à situation et facture

1. Le superviseur saisit les quantités exécutées.
2. Il produit un attachement.
3. Les quantités sont validées.
4. Le comptable ou le chef de projet génère la situation mensuelle.
5. Le système valorise les travaux.
6. Il applique retenues, pénalités, avances ou acomptes.
7. Le net à facturer est calculé.
8. La facture client est émise.
9. Le recouvrement suit ensuite la facture. 

## Processus 8 — Incident SAV jusqu’à clôture et éventuelle facturation

1. Le client signale un incident.
2. Le support crée le ticket.
3. Le support consulte l’historique et la base installée.
4. Il qualifie l’incident et affecte un technicien.
5. Si nécessaire, il génère un OT.
6. Le technicien intervient.
7. Il remplace la pièce ou réalise la correction.
8. Il renseigne temps passé, pièces remplacées et cause racine.
9. Le ticket est clôturé.
10. Le système détermine si l’intervention est couverte ou facturable. 

## Processus 9 — Facturation jusqu’à encaissement

1. Une facture est créée à partir d’un PV, d’une situation, d’un forfait, d’un site, d’une intervention ou d’une maintenance facturable.
2. La facture est validée puis émise.
3. Elle est suivie dans les échéances clients.
4. Le comptable enregistre le règlement.
5. Le système rapproche paiement et facture.
6. En cas d’impayé, une relance est lancée.
7. Le dossier passe à soldé une fois totalement encaissé.  

## Processus 10 — Pilotage global projet

1. Le projet est créé après gain commercial.
2. Il agrège budget, planning, achats, stocks, OT, avancement, factures, encaissements et tickets.
3. Le chef de projet suit les réalisations et les coûts.
4. La direction consulte les KPI et la rentabilité.
5. Les risques et blocages sont visibles.
6. Le projet passe progressivement vers la clôture opérationnelle puis administrative.  
