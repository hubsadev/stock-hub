# BTP / Avancement / Attachements / Situations - Situation et validation

## Périmètre

Générer la situation mensuelle à partir des quantités validées et valider la situation.

## Écran / action

### Action 1 - Générer une situation mensuelle

- Écran : Situations de travaux
- Action : Calculer la situation

### Action 2 - Valider la situation

- Écran : Fiche situation
- Action : Valider / Rejeter

## Input

### Action 1 - Générer une situation mensuelle

- Champ / donnée : période, attachements validés, retenues, acomptes, avances, pénalités
- Source : sélection utilisateur
- Caractère obligatoire : période, attachements validés
- Remarque : paramètres contractuels requis

### Action 2 - Valider la situation

- Champ / donnée : décision, commentaire, valideur
- Source : action valideur
- Caractère obligatoire : décision
- Remarque : commentaire requis en cas de rejet

## Traitement système

### Action 1 - Générer une situation mensuelle

1. Vérifier que les quantités sont validées.
2. Valoriser les quantités selon le cadre contractuel.
3. Appliquer retenues, acomptes, avances et pénalités.
4. Calculer le net à facturer.
5. Enregistrer la situation avec statut "calculée".

### Action 2 - Valider la situation

1. Vérifier les droits de validation.
2. Mettre à jour le statut (validée / rejetée).
3. Tracer la décision et l'auteur.
4. Rendre la situation facturable si validée.

## Output

### Action 1 - Générer une situation mensuelle

- Résultat visible : situation calculée
- Statut affiché : calculée
- Trace créée : historique de valorisation
- Notification éventuelle : alerte si litige

### Action 2 - Valider la situation

- Résultat visible : situation validée ou rejetée
- Statut affiché : validée / rejetée
- Trace créée : décision de validation
- Notification éventuelle : notification aux acteurs

## Règle métier

### Action 1 - Générer une situation mensuelle

- Règle 1 : une situation mensuelle doit être basée sur des quantités validées.
- Règle 2 : la facture BTP doit être basée sur une situation validée.

### Action 2 - Valider la situation

- Règle 1 : les retenues, acomptes, avances et pénalités sont pris en compte.
- Règle 2 : une situation rejetée doit rester historisée.

## Exception

### Action 1 - Générer une situation mensuelle

- Cas : attachement non validé
  Effet attendu : génération bloquée ou marquée "provisoire".
- Cas : litige sur quantités
  Effet attendu : calcul partiel ou statut "en litige".

### Action 2 - Valider la situation

- Cas : rejet par le valideur
  Effet attendu : statut "rejetée" et motif obligatoire.
- Cas : validation tardive
  Effet attendu : historisation et recalcul si nécessaire.

## Liens documentaires

- Relation -> [README du module](./README.md) : situe la situation mensuelle dans le module BTP.
- Relation -> [Matrice du module](../../matrices/11-btp-avancement-attachements-situations.md) : aligne la valorisation et les statuts de validation.
- Relation -> [business-rules.md](../../business-rules.md) : précise les retenues, acomptes, avances et pénalités.
- Relation -> [permissions.md](../../permissions.md) : borne les rôles de calcul et de validation.
- Relation -> [state-transitions.md](../../state-transitions.md) : décrit le passage calculée -> validée/rejetée.
- Relation -> [edge-cases.md](../../edge-cases.md) : couvre les situations en litige et les validations tardives.

## Liens inter-modules

- Relation -> [10-couts-analytiques-rentabilite/02-consolidation-cout-complet.md](../10-couts-analytiques-rentabilite/02-consolidation-cout-complet.md) : la situation permet de comparer le réalisé BTP au coût complet.
- Relation -> [12-facturation/01-facturation-par-origine.md](../12-facturation/01-facturation-par-origine.md) : la situation validée devient la base de facture.
- Relation -> [12-facturation/03-consultation-correction-facture.md](../12-facturation/03-consultation-correction-facture.md) : les corrections de facture doivent conserver l'historique de la situation.
