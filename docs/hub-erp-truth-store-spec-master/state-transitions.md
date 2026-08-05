Parfait. Voici le **3-e) State transitions**, toujours **module par module**, en restant strictement sur les **transitions d’état métier** des objets principaux. Je formule cela comme des cycles de vie possibles et cohérents avec ton exemple. 

# 3-e) State transitions

## Principes généraux

1. Chaque objet métier principal doit avoir un cycle de vie explicite.
2. Une transition d’état doit être déclenchée par une action utilisateur ou un événement métier.
3. Certaines transitions doivent être bloquées si les validations ou prérequis ne sont pas satisfaits.
4. Certaines transitions peuvent être irréversibles selon la criticité métier.
5. Les transitions doivent être historisées.  

---

## Module 1 — Référentiel

### Objet : Client / Fournisseur / Article / Site / Dépôt / Équipement

**États**

1. Brouillon
2. Actif
3. Inactif / Désactivé
4. Archivé

**Transitions**

1. Brouillon → Actif
2. Actif → Inactif
3. Inactif → Actif
4. Inactif → Archivé

**Règle de transition**

1. Un objet référentiel actif peut être utilisé dans les opérations.
2. Un objet inactif ne doit plus être sélectionnable pour de nouvelles opérations.
3. Un objet déjà utilisé historiquement ne passe pas en suppression physique, mais vers inactif ou archivé. 

---

## Module 2 — Avant-vente

### Objet : Demande de cotation

**États**

1. Brouillon
2. Ouverte
3. En étude
4. Offre préparée
5. Offre envoyée
6. Offre retenue
7. Offre infirmée
8. Clôturée sans suite
9. Clôturée

**Transitions**

1. Brouillon → Ouverte
2. Ouverte → En étude
3. En étude → Offre préparée
4. Offre préparée → Offre envoyée
5. Offre envoyée → Offre retenue
6. Offre envoyée → Offre infirmée
7. Offre envoyée → Clôturée sans suite
8. Offre retenue → Clôturée
9. Offre infirmée → Clôturée
10. Clôturée sans suite → Clôturée

### Objet : Offre

**États**

1. Brouillon
2. En étude
3. À valider technique
4. À valider direction
5. Validée
6. Rejetée
7. Envoyée
8. Retenue
9. Infirmée
10. Sans suite
11. Expirée / Clôturée

**Transitions**

1. Brouillon → En étude
2. En étude → À valider technique
3. À valider technique → À valider direction
4. À valider technique → Rejetée
5. À valider direction → Validée
6. À valider direction → Rejetée
7. Rejetée → Brouillon
8. Validée → Envoyée
9. Envoyée → Retenue
10. Envoyée → Infirmée
11. Envoyée → Sans suite
12. Envoyée → Expirée / Clôturée
13. Retenue → Expirée / Clôturée
14. Infirmée → Expirée / Clôturée
15. Sans suite → Expirée / Clôturée

**Règle de transition**

1. Le passage à “Envoyée” n’est autorisé qu’après validation technique et validation direction.
2. Une alerte de marge sous seuil configurable n’empêche pas automatiquement la soumission, sauf règle de gouvernance complémentaire.
3. Une nouvelle version d’offre repart typiquement à l’état Brouillon ou En étude. 

---

## Module 3 — Contrats / Affaires / Projets

### Objet : Contrat

**États**

1. Brouillon
2. En revue
3. Validé
4. Signé
5. Actif
6. Suspendu
7. Clôturé
8. Résilié

**Transitions**

1. Brouillon → En revue
2. En revue → Validé
3. Validé → Signé
4. Signé → Actif
5. Actif → Suspendu
6. Suspendu → Actif
7. Actif → Clôturé
8. Actif → Résilié

### Objet : Projet / Affaire de rattachement

**États**

1. Créé
2. En préparation
3. En exécution
4. En suivi / partiellement livré
5. En maintenance
6. Clôture en cours
7. Clôturé
8. Suspendu
9. Annulé

**Transitions**

1. Créé → En préparation
2. En préparation → En exécution
3. En exécution → En suivi / partiellement livré
4. En suivi / partiellement livré → En maintenance
5. En exécution → Clôture en cours
6. En maintenance → Clôture en cours
7. Clôture en cours → Clôturé
8. En préparation → Suspendu
9. En exécution → Suspendu
10. Suspendu → En exécution
11. Créé → Annulé
12. En préparation → Annulé

**Règle de transition**

1. Un projet ne peut passer en exécution qu’après création de sa structure minimale, de ses zones et sites, et après mise en place du budget/organisation requis selon le modèle retenu.
2. Un contrat peut générer un ou plusieurs projets, qui partagent ou non une affaire de rattachement selon le modèle retenu. 

---

## Module 4 — Budget / Pilotage financier projet

### Objet : Budget

**États**

1. Brouillon
2. Soumis à validation
3. Validé
4. Rejeté
5. Révisé
6. Clos / Remplacé

**Transitions**

1. Brouillon → Soumis à validation
2. Soumis à validation → Validé
3. Soumis à validation → Rejeté
4. Rejeté → Brouillon
5. Validé → Révisé
6. Révisé → Soumis à validation
7. Validé → Clos / Remplacé
8. Révisé validé → Clos / Remplacé pour la version précédente

**Règle de transition**

1. Une version validée peut devenir remplacée lorsqu’une version révisée est approuvée.
2. Une version remplacée reste consultable. 

---

## Module 5 — Achats

### Objet : Expression de besoin

**États**

1. Brouillon
2. Soumise
3. Validée besoin
4. Servie sur stock
5. Partiellement servie
6. Convertie en DA
7. Rejetée
8. Annulée

**Transitions**

1. Brouillon → Soumise
2. Soumise → Validée besoin
3. Validée besoin → Servie sur stock
4. Validée besoin → Partiellement servie
5. Partiellement servie → Convertie en DA
6. Validée besoin → Convertie en DA
7. Soumise → Rejetée
8. Brouillon → Annulée
9. Soumise → Annulée

### Objet : Demande d’achat

**États**

1. Brouillon
2. En validation comptable
3. En validation achats
4. En validation stratégie et développement
5. En validation DG
6. Validée
7. Rejetée
8. Partiellement commandée
9. Commandée
10. Clôturée
11. Annulée

**Transitions**

1. Brouillon → En validation comptable
2. En validation comptable → En validation achats
3. En validation achats → En validation stratégie et développement
4. En validation stratégie et développement → En validation DG
5. En validation DG → Validée
6. En validation comptable → Rejetée
7. En validation achats → Rejetée
8. En validation stratégie et développement → Rejetée
9. En validation DG → Rejetée
10. Rejetée → Brouillon
11. Validée → Partiellement commandée
12. Validée → Commandée
13. Partiellement commandée → Commandée
14. Commandée → Clôturée
15. Brouillon → Annulée
16. Validée → Annulée

### Objet : Commande fournisseur

**États**

1. Brouillon
2. Émise
3. Confirmée
4. Partiellement reçue
5. Totalement reçue
6. Clôturée
7. Annulée

**Transitions**

1. Brouillon → Émise
2. Émise → Confirmée
3. Confirmée → Partiellement reçue
4. Confirmée → Totalement reçue
5. Partiellement reçue → Totalement reçue
6. Totalement reçue → Clôturée
7. Brouillon → Annulée
8. Émise → Annulée

**Règle de transition**

1. Une expression de besoin peut être servie totalement sur stock sans créer de demande d’achat.
2. Une DA peut rester partiellement commandée si plusieurs commandes sont émises chez plusieurs fournisseurs. 

---

## Module 6 — Stock / Logistique / Magasin

### Objet : Réception fournisseur

**États**

1. En attente
2. Partielle
3. Totale
4. Contrôlée
5. Clôturée
6. Rejetée / Litige

**Transitions**

1. En attente → Partielle
2. En attente → Totale
3. Partielle → Totale
4. Partielle → Contrôlée
5. Totale → Contrôlée
6. Contrôlée → Clôturée
7. En attente → Rejetée / Litige
8. Partielle → Rejetée / Litige

### Objet : Réservation stock

**États**

1. Demandée
2. Réservée
3. Partiellement servie
4. Servie
5. Libérée
6. Annulée

**Transitions**

1. Demandée → Réservée
2. Réservée → Partiellement servie
3. Réservée → Servie
4. Partiellement servie → Servie
5. Réservée → Libérée
6. Demandée → Annulée

### Objet : Mouvement de stock

**États**

1. Initié
2. Validé
3. Exécuté
4. Annulé

**Transitions**

1. Initié → Validé
2. Validé → Exécuté
3. Initié → Annulé

**Règle de transition**

1. Les sorties, transferts et retours passent au minimum par une phase initiée puis exécutée, avec validation si exigée. 

---

## Module 7 — Exécution terrain / Ordres de travail

### Objet : Ordre de travail

**États**

1. Brouillon
2. Planifié
3. Affecté
4. En cours
5. Suspendu
6. Terminé techniquement
7. En validation
8. Clos
9. Annulé

**Transitions**

1. Brouillon → Planifié
2. Planifié → Affecté
3. Affecté → En cours
4. En cours → Suspendu
5. Suspendu → En cours
6. En cours → Terminé techniquement
7. Terminé techniquement → En validation
8. En validation → Clos
9. Brouillon → Annulé
10. Planifié → Annulé
11. Affecté → Annulé

**Règle de transition**

1. Un OT doit être au minimum planifié et affecté à une équipe interne ou à un prestataire avant de passer en cours.
2. Un OT clos ne doit plus être modifiable sauf action exceptionnelle tracée. 

---

## Module 8 — PV / Preuves de réalisation

### Objet : PV

**États**

1. Brouillon
2. Complété
3. Signé client
4. Avec réserves
5. Validé
6. Rejeté
7. Facturé
8. Archivé

**Transitions**

1. Brouillon → Complété
2. Complété → Signé client
3. Complété → Avec réserves
4. Avec réserves → Signé client
5. Signé client → Validé
6. Avec réserves → Validé
7. Signé client → Rejeté
8. Validé → Facturé
9. Facturé → Archivé

**Règle de transition**

1. Le statut “Avec réserves” peut coexister comme état distinct avant validation finale.
2. Le passage à “Facturé” intervient quand le PV a été utilisé comme base de facturation. 

---

## Module 9 — Temps / Ressources / Pointage

### Objet : Pointage

**États**

1. Brouillon
2. Soumis
3. Validé
4. Corrigé
5. Rejeté
6. Verrouillé

**Transitions**

1. Brouillon → Soumis
2. Soumis → Validé
3. Soumis → Rejeté
4. Validé → Corrigé
5. Corrigé → Soumis
6. Validé → Verrouillé
7. Rejeté → Brouillon

**Règle de transition**

1. Un pointage validé peut devenir verrouillé après intégration paie/coût ou clôture de période.
2. Une correction après validation doit laisser une trace. 

---

## Module 10 — Coûts analytiques / Rentabilité

### Objet : Calcul analytique / Période analytique

**États**

1. En préparation
2. Calculé
3. Vérifié
4. Ajusté
5. Clôturé

**Transitions**

1. En préparation → Calculé
2. Calculé → Vérifié
3. Vérifié → Ajusté
4. Ajusté → Vérifié
5. Vérifié → Clôturé

**Règle de transition**

1. Une période analytique clôturée n’est plus modifiable sans mécanisme de réouverture contrôlée.
2. Les coûts consolidés s’appuient sur les données validées en amont. 

---

## Module 11 — BTP / Avancement / Attachements / Situations

### Objet : Avancement

**États**

1. Brouillon
2. Saisi
3. Soumis
4. Validé
5. Rejeté
6. Intégré en attachement

**Transitions**

1. Brouillon → Saisi
2. Saisi → Soumis
3. Soumis → Validé
4. Soumis → Rejeté
5. Rejeté → Saisi
6. Validé → Intégré en attachement

### Objet : Attachement

**États**

1. Brouillon
2. Soumis
3. Validé interne
4. Validé client
5. Rejeté
6. Valorisé
7. Clos

**Transitions**

1. Brouillon → Soumis
2. Soumis → Validé interne
3. Validé interne → Validé client
4. Soumis → Rejeté
5. Rejeté → Brouillon
6. Validé interne → Valorisé
7. Validé client → Valorisé
8. Valorisé → Clos

### Objet : Situation de travaux

**États**

1. Brouillon
2. Calculée
3. Vérifiée
4. Validée
5. Facturée
6. Clôturée
7. Rejetée

**Transitions**

1. Brouillon → Calculée
2. Calculée → Vérifiée
3. Vérifiée → Validée
4. Vérifiée → Rejetée
5. Rejetée → Brouillon
6. Validée → Facturée
7. Facturée → Clôturée

**Règle de transition**

1. Une situation ne devient facturable qu’après validation des quantités ou de l’attachement selon le processus retenu. 

---

## Module 12 — Facturation

### Objet : Facture client

**États**

1. Brouillon
2. En validation
3. Validée
4. Émise
5. Partiellement payée
6. Payée
7. En litige
8. Annulée
9. Clôturée

**Transitions**

1. Brouillon → En validation
2. En validation → Validée
3. En validation → Annulée
4. Validée → Émise
5. Émise → Partiellement payée
6. Partiellement payée → Payée
7. Émise → Payée
8. Émise → En litige
9. En litige → Émise
10. Payée → Clôturée
11. Annulée → Clôturée

**Règle de transition**

1. Une facture émise entre dans le cycle de recouvrement.
2. Une facture payée peut passer en clôturée après rapprochement complet.  

---

## Module 13 — Encaissement / Recouvrement

### Objet : Encaissement / Dossier de recouvrement

**États**

1. Non échu
2. Échu
3. En relance
4. Partiellement encaissé
5. Encaissé
6. Litige paiement
7. Clos

**Transitions**

1. Non échu → Échu
2. Échu → En relance
3. Échu → Partiellement encaissé
4. En relance → Partiellement encaissé
5. Partiellement encaissé → Encaissé
6. Échu → Litige paiement
7. Litige paiement → En relance
8. Encaissé → Clos

**Règle de transition**

1. Le dossier de recouvrement suit la situation de paiement de la facture.
2. Plusieurs relances peuvent intervenir tant que le dossier n’est pas encaissé ou clos. 

---

## Module 14 — SAV / Maintenance / Ticketing

### Objet : Ticket

**États**

1. Nouveau
2. Qualifié
3. Affecté
4. En diagnostic
5. En intervention
6. Résolu
7. Clos
8. Suspendu
9. Rejeté / Hors périmètre

**Transitions**

1. Nouveau → Qualifié
2. Qualifié → Affecté
3. Affecté → En diagnostic
4. En diagnostic → En intervention
5. En diagnostic → Résolu
6. En intervention → Résolu
7. Résolu → Clos
8. Affecté → Suspendu
9. Suspendu → Affecté
10. Qualifié → Rejeté / Hors périmètre

### Objet : Contrat de maintenance / couverture

**États**

1. Brouillon
2. Actif
3. Suspendu
4. Expiré
5. Résilié

**Transitions**

1. Brouillon → Actif
2. Actif → Suspendu
3. Suspendu → Actif
4. Actif → Expiré
5. Actif → Résilié

**Règle de transition**

1. Le ticket peut être clôturé après résolution, enregistrement des actions et décision de facturabilité.
2. Un ticket hors périmètre peut être rejeté comme ticket contractuel mais traité comme intervention facturable selon le modèle retenu. 

---

## Module 15 — Planning / Coordination opérationnelle

### Objet : Activité planifiée

**États**

1. Brouillon
2. Planifiée
3. Confirmée
4. En cours
5. Reportée
6. Terminée
7. Annulée

**Transitions**

1. Brouillon → Planifiée
2. Planifiée → Confirmée
3. Confirmée → En cours
4. En cours → Terminée
5. Planifiée → Reportée
6. Reportée → Planifiée
7. Planifiée → Annulée
8. Confirmée → Annulée

**Règle de transition**

1. Une activité reportée doit conserver l’historique de sa date précédente.
2. Une activité terminée reste consultable pour le suivi projet. 

---

## Module 16 — Gouvernance / Validation / Contrôle interne

### Objet : Validation

**États**

1. Non soumise
2. Soumise
3. En cours de validation
4. Approuvée
5. Rejetée
6. Expirée / Annulée

**Transitions**

1. Non soumise → Soumise
2. Soumise → En cours de validation
3. En cours de validation → Approuvée
4. En cours de validation → Rejetée
5. Rejetée → Soumise
6. Soumise → Expirée / Annulée

**Règle de transition**

1. Tant qu’un objet est dans un état de validation non approuvé, les actions dépendantes peuvent être bloquées.
2. Une validation rejetée peut être resoumise après correction.  

---

## Module 17 — Reporting / KPI / Direction

### Objet : Tableau de bord / Snapshot KPI

**États**

1. En préparation
2. Calculé
3. Publié
4. Archivé

**Transitions**

1. En préparation → Calculé
2. Calculé → Publié
3. Publié → Archivé

**Règle de transition**

1. Un snapshot publié doit correspondre à un jeu de données consolidé à une date donnée.
2. Un snapshot archivé reste consultable pour l’historique de pilotage. 

---

## Module 18 — Vue transverse Affaire / Projet

### Objet : Dossier projet consolidé

**États**

1. Initialisé
2. Alimenté
3. Actif
4. Sous surveillance
5. En clôture
6. Clos
7. Archivé

**Transitions**

1. Initialisé → Alimenté
2. Alimenté → Actif
3. Actif → Sous surveillance
4. Sous surveillance → Actif
5. Actif → En clôture
6. En clôture → Clos
7. Clos → Archivé

**Règle de transition**

1. Le dossier consolidé reflète l’état global du projet et, si applicable, de son affaire de rattachement.
2. L’état “Sous surveillance” peut être utilisé quand des risques ou blocages majeurs sont identifiés.
3. L’état “En clôture” précède la fermeture administrative et opérationnelle définitive.  

La suite logique est **3-f) Edge cases**, puis ensuite **user flows**.
