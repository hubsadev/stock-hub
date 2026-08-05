Parfait. Voici le **3-d) Permissions**, toujours **module par module**, en restant strictement sur le niveau des droits d’accès et d’action. Je formule cela sous forme de permissions métier par rôle, sans encore entrer dans les états, edge cases ni user flows. 

# 3-d) Permissions

## Principes généraux de permissions

1. Un utilisateur ne doit voir que les modules, données et actions autorisés pour son rôle.
2. Les droits doivent être gérés au minimum par rôle métier.
3. Les droits peuvent être affinés par périmètre organisationnel, par affaire, par chantier, par site ou par dépôt.
4. Les actions de validation doivent être réservées aux rôles habilités.
5. Les actions sensibles doivent être traçables.
6. Un utilisateur peut avoir plusieurs rôles cumulés.
7. Les droits de consultation, création, modification, validation, suppression logique et export doivent être distingués.  

---

## Module 1 — Référentiel

### Permissions par rôle

**Administrateur système**

1. Peut créer, modifier, désactiver et réactiver tous les objets référentiels.
2. Peut gérer les nomenclatures de catégories et paramètres de référence.

**Gestionnaire référentiel**

1. Peut créer et modifier clients, fournisseurs, articles, sites, dépôts, équipements et véhicules.
2. Peut désactiver un objet référentiel selon les règles autorisées.
3. Ne peut pas supprimer physiquement un objet déjà utilisé dans l’historique.

**Direction / Développement**

1. Peut consulter les clients.
2. Peut créer ou proposer la création d’un client.
3. Peut consulter les sites liés à ses projets ou affaires.
4. Ne peut pas gérer les fournisseurs ni les dépôts sauf droit explicite.

**Responsable achats**

1. Peut consulter et modifier les fournisseurs et articles utiles aux achats.
2. Peut consulter les dépôts et caractéristiques logistiques des articles.

**Chef de projet / Conducteur de travaux / Support**

1. Peut consulter les référentiels nécessaires à son activité.
2. Peut créer certains objets opérationnels comme sites ou équipements si le modèle retenu l’autorise.
3. Ne peut pas administrer l’ensemble du référentiel sans droit spécifique.  

---

## Module 2 — Avant-vente

### Permissions par rôle

**Direction / Développement**

1. Peut créer, consulter et modifier les demandes de cotation.
2. Peut créer les appels d’offres.
3. Peut créer un brouillon d’offre.
4. Peut consulter les versions d’offre liées à ses dossiers.
5. Peut envoyer une offre au client uniquement si elle est validée selon le circuit requis.

**Chef de projet**

1. Peut créer et modifier les études commerciales et offres.
2. Peut structurer les lots de l’offre et définir son type, devis ou facture proforma.
3. Peut créer des versions d’offre.
4. Peut soumettre une offre à validation.
5. Peut proposer le passage d’une offre en retenue, infirmée ou sans suite selon le processus autorisé.

**Bureau d’études**

1. Peut créer et modifier l’étude technique.
2. Peut saisir métrés, quantitatifs, besoins matériels, besoins en main-d’œuvre et contraintes.
3. Peut consulter les offres liées à l’étude.
4. Ne peut pas envoyer l’offre au client sauf droit explicite.

**Direction générale**

1. Peut consulter toutes les demandes de cotation et offres.
2. Peut approuver ou rejeter les offres soumises à validation.
3. Peut consulter les indicateurs de marge et de risque avant décision.

**Finance / Contrôle de gestion**

1. Peut consulter les offres et données de coût estimatif.
2. Peut commenter ou intervenir dans le circuit de validation si prévu.
3. Ne peut pas modifier le contenu commercial détaillé sauf droit spécifique.  

---

## Module 3 — Contrats / Affaires / Projets

### Permissions par rôle

**Direction / Chef de projet**

1. Peut transformer une offre retenue en contrat si autorisé.
2. Peut créer un ou plusieurs projets à partir d’un contrat validé.
3. Peut consulter les projets et affaires de rattachement dont il a la charge.

**Chef de projet**

1. Peut créer et modifier la structure d’un projet.
2. Peut créer des zones, sites et sous-lots dans son périmètre.
3. Peut définir ou mettre à jour les informations opérationnelles du projet.
4. Peut consulter tous les objets rattachés à son projet.

**Direction**

1. Peut consulter toutes les affaires et tous les projets.
2. Peut arbitrer ou valider certaines modifications structurantes selon le niveau de gouvernance retenu.

**Comptable / Contrôle de gestion**

1. Peut consulter les contrats, affaires et projets.
2. Peut utiliser ces objets dans les modules de facturation, encaissement et analytique.
3. Ne peut pas modifier le découpage opérationnel sauf droit spécifique. 

---

## Module 4 — Budget / Pilotage financier projet

### Permissions par rôle

**Chef de projet**

1. Peut créer un budget initial.
2. Peut saisir ou modifier un budget brouillon.
3. Peut proposer une révision budgétaire.
4. Peut consulter le budget de ses projets ou affaires.

**Contrôle de gestion / Finance**

1. Peut consulter tous les budgets relevant de son périmètre.
2. Peut modifier ou compléter les hypothèses budgétaires si le processus l’autorise.
3. Peut comparer budget, engagé et réalisé.

**Direction**

1. Peut valider ou rejeter un budget.
2. Peut valider ou rejeter une révision budgétaire.
3. Peut consulter les écarts budgétaires globaux.

**Responsable achats**

1. Peut consulter les budgets nécessaires au contrôle des engagements.
2. Ne peut pas valider un budget sauf rôle complémentaire explicite. 

---

## Module 5 — Achats

### Permissions par rôle

**Conducteur de travaux / Superviseur / Chef de projet**

1. Peut créer une expression de besoin.
2. Peut demander une vérification de stock ou proposer une demande d’achat pour le besoin non couvert.
3. Peut consulter l’état d’avancement des demandes liées à ses projets ou affaires.
4. Ne peut pas valider seul toutes les demandes d’achat sauf si son rôle le prévoit.

**Magasinier / Responsable logistique**

1. Peut vérifier le stock disponible pour un besoin validé.
2. Peut affecter le stock disponible à un chantier, site, véhicule ou technicien.
3. Peut confirmer qu’une demande d’achat ne porte que sur le reliquat non couvert.

**Responsable achats**

1. Peut consulter toutes les demandes d’achat autorisées.
2. Peut compléter, modifier ou consolider une demande d’achat avant commande.
3. Peut consulter les fournisseurs.
4. Peut saisir les offres fournisseurs.
5. Peut établir le comparatif des offres.
6. Peut générer un ou plusieurs bons de commande.
7. Peut suivre les commandes fournisseur.

**Comptable achats / Finance**

1. Peut participer au circuit de validation achat.
2. Peut consulter les commandes et engagements.
3. Peut contrôler la conformité administrative de l’achat.

**Direction stratégie et développement**

1. Peut approuver ou rejeter les demandes d’achat relevant de son niveau d’autorité.
2. Peut arbitrer les achats stratégiques, atypiques ou multi-fournisseurs.

**Direction / DG**

1. Peut approuver ou rejeter les demandes d’achat relevant de son niveau d’autorité.
2. Peut consulter les achats stratégiques ou hors seuil.

**Magasinier**

1. Peut consulter les commandes nécessaires à la réception.
2. Ne peut pas créer ou approuver une commande fournisseur sauf droit explicite.  

---

## Module 6 — Stock / Logistique / Magasin

### Permissions par rôle

**Magasinier**

1. Peut enregistrer les réceptions fournisseur.
2. Peut enregistrer les sorties, transferts et retours de stock.
3. Peut affecter du matériel à un chantier, site, véhicule ou technicien.
4. Peut consulter les niveaux de stock et mouvements.
5. Peut saisir les inventaires.

**Responsable logistique**

1. Peut consulter tous les stocks de son périmètre.
2. Peut valider ou superviser certains mouvements selon le modèle retenu.
3. Peut gérer les réservations, transferts inter-dépôts et alertes de stock.

**Chef de projet / Conducteur de travaux**

1. Peut consulter le stock utile à ses projets ou affaires.
2. Peut demander ou initier une sortie de stock selon les règles établies.
3. Peut consulter les affectations et réservations liées à son périmètre.
4. Ne peut pas corriger directement une réception fournisseur sans droit logistique.

**Technicien / Chef d’équipe**

1. Peut consulter le matériel qui lui est affecté.
2. Peut déclarer ou demander un retour de matériel si le workflow le prévoit.
3. Ne peut pas administrer les stocks globaux.

**Responsable achats**

1. Peut consulter l’état des réceptions et disponibilités logistiques liées aux commandes. 

---

## Module 7 — Exécution terrain / Ordres de travail

### Permissions par rôle

**Planificateur / Chef de projet / Support**

1. Peut créer un ordre de travail.
2. Peut affecter une équipe interne ou un prestataire, une date et un site ou chantier.
3. Peut modifier un OT tant qu’il n’est pas dans un état verrouillé.
4. Peut consulter les OT de son périmètre.

**Chef d’équipe**

1. Peut consulter les OT affectés à son équipe.
2. Peut démarrer, mettre à jour et clôturer techniquement une intervention selon les règles.
3. Peut renseigner le temps passé, la consommation matériel, les photos, checklists et anomalies.

**Technicien**

1. Peut consulter les OT qui lui sont affectés.
2. Peut renseigner les données terrain autorisées.
3. Peut joindre des preuves d’exécution.
4. Ne peut pas réaffecter un OT à une autre équipe sauf droit spécifique.

**Prestataire terrain**

1. Peut consulter les OT qui lui sont explicitement affectés.
2. Peut renseigner les données d’exécution et les preuves autorisées.
3. Ne peut pas modifier le planning global, réaffecter un OT ou consulter des OT hors de son périmètre.

**Direction / Management opérationnel**

1. Peut consulter l’ensemble des OT.
2. Peut superviser l’exécution et les retards.
3. Peut réassigner ou arbitrer selon les droits configurés. 

---

## Module 8 — PV / Preuves de réalisation

### Permissions par rôle

**Chef d’équipe / Technicien**

1. Peut créer ou préparer un PV lié à une intervention.
2. Peut saisir les travaux réalisés, résultats de tests, réserves et pièces jointes.
3. Peut enregistrer la signature client si le mode de capture lui est autorisé.

**Chef de projet / Superviseur**

1. Peut consulter les PV de son périmètre.
2. Peut vérifier la complétude d’un PV.
3. Peut valider ou rejeter un PV si le processus prévoit une validation interne.

**Comptable**

1. Peut consulter les PV validés.
2. Peut utiliser un PV validé comme justificatif de facturation.
3. Ne peut pas modifier le contenu technique du PV sauf droit exceptionnel. 

---

## Module 9 — Temps / Ressources / Pointage

### Permissions par rôle

**Chef d’équipe**

1. Peut saisir le pointage quotidien de son équipe.
2. Peut imputer les heures à une affaire, un chantier, un OT ou une tâche.
3. Peut déclarer l’usage des engins, véhicules et équipements utilisés.

**Technicien / Ouvrier**

1. Peut saisir ou consulter son propre pointage si le modèle retenu inclut l’auto-déclaration.
2. Peut proposer une saisie qui reste soumise à validation.

**Superviseur / Conducteur de travaux**

1. Peut consulter les pointages de son périmètre.
2. Peut valider, corriger ou rejeter un pointage.
3. Peut contrôler les heures supplémentaires et les affectations.

**Chef de projet / Contrôle de gestion**

1. Peut consulter les pointages validés.
2. Peut exploiter les pointages pour le calcul des coûts.
3. Ne peut pas nécessairement modifier un pointage validé sauf rôle additionnel. 

---

## Module 10 — Coûts analytiques / Rentabilité

### Permissions par rôle

**Chef de projet**

1. Peut consulter les coûts analytiques de ses projets ou affaires.
2. Peut consulter les écarts entre budget et réalisé.
3. Peut analyser la rentabilité de ses projets.

**Contrôle de gestion / Finance**

1. Peut consulter tous les indicateurs analytiques autorisés.
2. Peut recalculer, consolider ou corriger certaines imputations selon les droits accordés.
3. Peut produire des analyses comparatives par affaire, site ou client.

**Direction**

1. Peut consulter toutes les données de rentabilité.
2. Peut consulter les marges prévues et réelles. 

---

## Module 11 — BTP / Avancement / Attachements / Situations

### Permissions par rôle

**Superviseur / Conducteur de travaux**

1. Peut saisir l’avancement physique.
2. Peut créer un attachement.
3. Peut proposer les quantités exécutées pour validation.
4. Peut consulter l’historique des avancements et attachements de son chantier.

**Chef de projet**

1. Peut consulter l’ensemble des avancements de ses projets ou affaires.
2. Peut vérifier les quantités avant valorisation.
3. Peut superviser la cohérence entre avancement, budget et facturation.

**Client / Représentant client**

1. Peut valider ou signer les quantités si le processus inclut une validation externe.
2. Ne peut pas modifier les données internes hors mécanisme prévu.

**Comptable / Chef de projet**

1. Peut générer les situations à partir des quantités validées.
2. Peut consulter les retenues, acomptes, avances et montants nets à facturer. 

---

## Module 12 — Facturation

### Permissions par rôle

**Comptable**

1. Peut créer une facture client.
2. Peut sélectionner la base de facturation autorisée.
3. Peut consulter, éditer et finaliser les factures selon le processus défini.
4. Peut enregistrer les corrections ou annulations autorisées.

**Chef de projet**

1. Peut consulter les factures de ses projets ou affaires.
2. Peut consulter le reste à facturer.
3. Peut préparer ou proposer des éléments de facturation si le processus le prévoit.
4. Ne peut pas nécessairement émettre définitivement une facture sans rôle finance.

**Direction financière / Direction**

1. Peut consulter toutes les factures.
2. Peut approuver certaines factures selon seuils ou gouvernance choisie.  

---

## Module 13 — Encaissement / Recouvrement

### Permissions par rôle

**Comptable**

1. Peut enregistrer les règlements clients.
2. Peut rapprocher un paiement avec une ou plusieurs factures.
3. Peut consulter les échéances, impayés et historiques de relance.
4. Peut enregistrer les actions de recouvrement.

**Direction financière**

1. Peut consulter la situation globale des encaissements.
2. Peut suivre les retards de paiement et arbitrer les actions de recouvrement.

**Chef de projet / Direction**

1. Peut consulter les statuts d’encaissement de ses projets ou affaires selon les droits accordés.
2. Ne peut pas nécessairement enregistrer un encaissement sans rôle finance. 

---

## Module 14 — SAV / Maintenance / Ticketing

### Permissions par rôle

**Support télécom**

1. Peut créer un ticket.
2. Peut catégoriser, prioriser et affecter un ticket.
3. Peut consulter l’historique du site et la base installée.
4. Peut générer un ordre d’intervention depuis un ticket.
5. Peut clôturer un ticket si le processus le permet.

**Technicien**

1. Peut consulter les tickets ou OT qui lui sont affectés.
2. Peut renseigner le diagnostic, le temps passé, les pièces remplacées et les actions réalisées.
3. Ne peut pas modifier les paramètres SLA globaux.

**Chef de projet / Responsable maintenance**

1. Peut consulter les tickets relevant de son périmètre.
2. Peut superviser les délais et le respect des SLA.
3. Peut arbitrer certains cas de facturabilité si le modèle l’autorise.

**Comptable / Gestionnaire contrat**

1. Peut consulter la décision de facturabilité.
2. Peut facturer les interventions facturables selon le contrat et les justificatifs disponibles.  

---

## Module 15 — Planning / Coordination opérationnelle

### Permissions par rôle

**Planificateur / Chef de projet**

1. Peut créer et modifier le planning des affaires.
2. Peut affecter équipes et moyens aux activités.
3. Peut replanifier une activité.

**Conducteur de travaux / Superviseur**

1. Peut consulter le planning de son périmètre.
2. Peut proposer ou effectuer certaines modifications selon les droits délégués.

**Chef d’équipe / Technicien**

1. Peut consulter les activités planifiées qui le concernent.
2. Ne peut pas modifier le planning global sauf droit spécifique.

**Direction**

1. Peut consulter les plannings consolidés.
2. Peut arbitrer sur les priorités et reallocations majeures. 

---

## Module 16 — Gouvernance / Validation / Contrôle interne

### Permissions par rôle

**Valideur technique**

1. Peut approuver ou rejeter les objets soumis à validation technique.
2. Peut consulter les données nécessaires à sa décision.

**Valideur financier / Contrôle de gestion**

1. Peut approuver ou rejeter les objets soumis à validation financière.
2. Peut consulter les impacts budgétaires et de marge.

**Direction stratégie et développement**

1. Peut approuver ou rejeter les objets relevant de son périmètre stratégique.
2. Peut consulter les impacts business, sourcing et marge avant arbitrage.

**Direction / DG**

1. Peut approuver ou rejeter les objets relevant de son niveau de validation.
2. Peut consulter l’historique complet des validations sensibles.

**Administrateur fonctionnel**

1. Peut configurer les circuits de validation.
2. Peut définir les rôles valideurs selon type d’objet et niveau de seuil.
3. Ne doit pas pouvoir se substituer silencieusement aux traces de validation passées.  

---

## Module 17 — Reporting / KPI / Direction

### Permissions par rôle

**Direction**

1. Peut consulter les tableaux de bord globaux.
2. Peut consulter les KPI commerce, projet, chantier, maintenance et finance.
3. Peut accéder aux analyses consolidées multi-affaires.

**Chef de projet**

1. Peut consulter les tableaux de bord de ses projets.
2. Peut suivre marge, coûts, avancement, retards et facturation sur son périmètre.

**Contrôle de gestion / Finance**

1. Peut consulter les KPI de rentabilité, coûts, facturation et encaissement.
2. Peut accéder aux vues d’analyse détaillées.

**Responsable maintenance / Support**

1. Peut consulter les KPI tickets, SLA, temps moyen de résolution et récurrence incidents sur son périmètre. 

---

## Module 18 — Vue transverse Affaire / Projet

### Permissions par rôle

**Chef de projet**

1. Peut consulter la vue 360 de ses projets.
2. Peut naviguer vers les objets liés dans son périmètre.
3. Peut suivre les risques et blocages.

**Direction**

1. Peut consulter la vue 360 de tous les projets.
2. Peut accéder aux synthèses globales et détails stratégiques.

**Direction / Chef de projet**

1. Peut consulter la vue transverse des projets qu’il pilote ou a initiés.
2. Peut suivre l’état commercial, contractuel et opérationnel.

**Contrôle de gestion / Comptable / Support**

1. Peut consulter la vue transverse dans la mesure de son besoin métier et des droits accordés.
2. Ne voit pas nécessairement toutes les sections si les droits sont restreints par module.  

La suite logique est **3-e) State transitions**, toujours **module par module**.
