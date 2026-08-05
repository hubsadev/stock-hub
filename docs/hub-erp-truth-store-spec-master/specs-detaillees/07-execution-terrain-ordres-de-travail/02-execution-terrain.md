# Exécution terrain / Ordres de travail - Exécution terrain

## Périmètre

Démarrer l'intervention, renseigner l'exécution et les preuves terrain.

## Écran / action

### Action 1 - Démarrer intervention

- Écran : Fiche OT (mobile) / bouton "Démarrer"
- Action : Démarrer l'intervention

### Action 2 - Déclarer l'exécution

- Écran : Fiche OT / onglet Exécution
- Action : Enregistrer heures, consommations, checklists, photos

## Input

### Action 1 - Démarrer intervention

- Champ / donnée : date/heure de démarrage
- Source : système (horodatage) ou saisie
- Caractère obligatoire : oui
- Remarque : peut être capturé automatiquement

### Action 2 - Déclarer l'exécution

- Champ / donnée : temps passé
- Source : saisie équipe
- Caractère obligatoire : oui
- Remarque : doit être imputable à l'OT

- Champ / donnée : matériels consommés
- Source : saisie équipe
- Caractère obligatoire : selon type d'OT
- Remarque : déclenche mouvement de stock

- Champ / donnée : checklists
- Source : saisie équipe
- Caractère obligatoire : selon type d'OT
- Remarque : obligatoire pour clôture

- Champ / donnée : photos / pièces jointes
- Source : capture mobile
- Caractère obligatoire : selon type d'OT
- Remarque : preuve d'exécution

## Traitement système

### Action 1 - Démarrer intervention

1. Vérifier que l'OT est affecté à l'équipe/prestataire.
2. Vérifier l'état de l'OT (planifié/affecté).
3. Enregistrer l'heure de début.
4. Passer le statut à "En cours".
5. Historiser l'événement.

### Action 2 - Déclarer l'exécution

1. Vérifier droits de saisie terrain.
2. Vérifier cohérence des quantités et du temps.
3. Enregistrer consommations et ressources.
4. Créer les mouvements de stock nécessaires.
5. Attacher photos et checklists à l'OT.

## Output

### Action 1 - Démarrer intervention

- Résultat visible : intervention démarrée
- Statut affiché : En cours
- Trace créée : historique OT
- Notification éventuelle : aucune

### Action 2 - Déclarer l'exécution

- Résultat visible : données d'exécution enregistrées
- Statut affiché : En cours
- Trace créée : consommations et pièces jointes visibles
- Notification éventuelle : alerte si checklist manquante

## Règle métier

### Action 1 - Démarrer intervention

- Règle 1 : un OT doit être affecté avant démarrage.
- Règle 2 : un OT non planifié ne peut pas démarrer.

### Action 2 - Déclarer l'exécution

- Règle 1 : toute intervention doit enregistrer le temps passé.
- Règle 2 : les checklists requises doivent être renseignées.

## Exception

### Action 1 - Démarrer intervention

- Cas : OT non affecté
  Effet attendu : démarrage bloqué.
- Cas : démarrage hors ligne
  Effet attendu : démarrage enregistré en local, synchronisation ultérieure.

### Action 2 - Déclarer l'exécution

- Cas : stock insuffisant pour consommation
  Effet attendu : alerte et enregistrement partiel ou bloqué selon règle.
- Cas : preuves obligatoires manquantes
  Effet attendu : impossibilité de clôture technique.

## Liens documentaires

- Relation -> [README du module](./README.md) : rattache l'exécution terrain au cycle OT complet.
- Relation -> [Matrice du module](../../matrices/07-execution-terrain-ordres-de-travail.md) : relie cette fiche aux règles et cas d'usage consolidés.
- Relation -> [user-flows.md](../../user-flows.md) : situe le démarrage et la déclaration d'exécution dans le flux opérationnel terrain.
- Relation -> [business-rules.md](../../business-rules.md) : formalise les contrôles de temps, de cohérence et de preuves.
- Relation -> [edge-cases.md](../../edge-cases.md) : couvre les cas de stock insuffisant, hors ligne et preuves manquantes.

## Liens inter-modules

- Relation -> [08-pv-preuves-de-realisation/01-generation-pv.md](../08-pv-preuves-de-realisation/01-generation-pv.md) : les données d'exécution alimentent le PV.
- Relation -> [09-temps-ressources-pointage/02-imputation-ressources.md](../09-temps-ressources-pointage/02-imputation-ressources.md) : les temps et consommations nourrissent le pointage et l'imputation.
- Relation -> [10-couts-analytiques-rentabilite/01-cout-reel-intervention.md](../10-couts-analytiques-rentabilite/01-cout-reel-intervention.md) : les consommations terrain entrent dans le coût réel.
