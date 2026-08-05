# PV / Preuves de réalisation - Génération PV

## Périmètre

Créer un PV à partir d'une intervention ou d'un OT et saisir les travaux réalisés.

## Écran / action

### Action 1 - Générer un PV

- Écran : Fiche OT / action "Générer PV"
- Action : Créer le PV

### Action 2 - Décrire les travaux réalisés

- Écran : Fiche PV / onglet Travaux
- Action : Enregistrer la description et les résultats de tests

## Input

### Action 1 - Générer un PV

- Champ / donnée : OT / intervention source
- Source : sélection système
- Caractère obligatoire : oui
- Remarque : un PV est toujours lié à une source

### Action 2 - Décrire les travaux réalisés

- Champ / donnée : description des travaux
- Source : saisie équipe
- Caractère obligatoire : oui
- Remarque : base de preuve d'exécution

- Champ / donnée : résultats de tests
- Source : saisie équipe
- Caractère obligatoire : selon type d'OT
- Remarque : requis pour conformité

- Champ / donnée : pièces jointes
- Source : capture
- Caractère obligatoire : selon type
- Remarque : photos, documents, relevés

## Traitement système

### Action 1 - Générer un PV

1. Vérifier que l'OT est en état compatible avec génération PV.
2. Générer la référence PV unique.
3. Créer le PV au statut "Brouillon".
4. Lier le PV à l'OT / intervention.
5. Historiser la création.

### Action 2 - Décrire les travaux réalisés

1. Vérifier les droits d'édition PV.
2. Enregistrer les travaux et résultats de tests.
3. Attacher les pièces jointes.
4. Mettre à jour l'historique du PV.

## Output

### Action 1 - Générer un PV

- Résultat visible : PV créé et visible dans la fiche OT
- Statut affiché : Brouillon
- Trace créée : historique PV
- Notification éventuelle : aucune

### Action 2 - Décrire les travaux réalisés

- Résultat visible : description et tests visibles dans le PV
- Statut affiché : Brouillon / En cours
- Trace créée : historique de modification
- Notification éventuelle : aucune

## Règle métier

### Action 1 - Générer un PV

- Règle 1 : un PV doit être lié à une intervention ou un OT.
- Règle 2 : un PV doit refléter les travaux effectivement réalisés.

### Action 2 - Décrire les travaux réalisés

- Règle 1 : les tests requis doivent être renseignés selon le type d'OT.
- Règle 2 : les pièces jointes doivent être conservées avec le PV.

## Exception

### Action 1 - Générer un PV

- Cas : OT non clôturé techniquement
  Effet attendu : génération bloquée ou PV créé en brouillon non validable selon règle.
- Cas : OT introuvable ou non autorisé
  Effet attendu : action refusée.

## Liens documentaires

- Relation -> [README du module](./README.md) : rattache la génération de PV au périmètre global.
- Relation -> [Matrice du module](../../matrices/08-pv-preuves-de-realisation.md) : relie cette fiche aux règles et use cases consolidés.
- Relation -> [state-transitions.md](../../state-transitions.md) : formalise le passage du PV en brouillon après création.
- Relation -> [business-rules.md](../../business-rules.md) : précise les conditions de liaison au source OT.
- Relation -> [edge-cases.md](../../edge-cases.md) : couvre les cas d'OT non clôturé ou non autorisé.

## Liens inter-modules

- Relation -> [07-execution-terrain-ordres-de-travail/03-anomalies-cloture-ot.md](../07-execution-terrain-ordres-de-travail/03-anomalies-cloture-ot.md) : la génération du PV dépend de la clôture technique de l'OT.
- Relation -> [12-facturation/01-facturation-par-origine.md](../12-facturation/01-facturation-par-origine.md) : un PV créé ici peut devenir une base de facture.

### Action 2 - Décrire les travaux réalisés

- Cas : informations minimales absentes
  Effet attendu : blocage de validation PV, message d'erreur.
- Cas : pièces jointes manquantes alors requises
  Effet attendu : PV non validable tant que les preuves ne sont pas ajoutées.
