# BTP / Avancement / Attachements / Situations - Avancement et attachements

## Périmètre

Saisir l'avancement physique et produire les attachements servant de preuve des quantités réalisées.

## Écran / action

### Action 1 - Saisir l'avancement physique

- Écran : Saisie d'avancement chantier
- Action : Enregistrer les quantités

### Action 2 - Créer un attachement

- Écran : Attachements
- Action : Générer un attachement

## Input

### Action 1 - Saisir l'avancement physique

- Champ / donnée : chantier, période, unité d'oeuvre, quantités exécutées
- Source : saisie utilisateur
- Caractère obligatoire : chantier, période, quantités
- Remarque : unités d'oeuvre selon le marché

### Action 2 - Créer un attachement

- Champ / donnée : période, avancements sélectionnés, commentaire
- Source : sélection utilisateur
- Caractère obligatoire : avancements sélectionnés
- Remarque : attachement basé sur quantités saisies

## Traitement système

### Action 1 - Saisir l'avancement physique

1. Vérifier les droits de saisie chantier.
2. Valider les unités d'oeuvre et la cohérence des quantités.
3. Enregistrer l'avancement par période.
4. Mettre à jour le statut de l'avancement.
5. Tracer l'historique de saisie.

### Action 2 - Créer un attachement

1. Vérifier que les quantités sont saisies et éligibles.
2. Créer l'attachement et lier les quantités.
3. Positionner le statut initial (brouillon / soumis).
4. Tracer l'historique de création.

## Output

### Action 1 - Saisir l'avancement physique

- Résultat visible : avancement enregistré
- Statut affiché : saisi / soumis
- Trace créée : historique d'avancement
- Notification éventuelle : alerte de doublon si applicable

### Action 2 - Créer un attachement

- Résultat visible : attachement créé
- Statut affiché : brouillon / soumis
- Trace créée : lien avancement-attachement
- Notification éventuelle : demande de validation

## Règle métier

### Action 1 - Saisir l'avancement physique

- Règle 1 : les quantités d'avancement doivent être saisies sur des unités d'oeuvre pertinentes.
- Règle 2 : les quantités doivent être validées avant valorisation.

### Action 2 - Créer un attachement

- Règle 1 : un attachement sert de preuve des quantités réalisées.
- Règle 2 : l'attachement doit rester historisé par période.

## Exception

### Action 1 - Saisir l'avancement physique

- Cas : quantités déjà déclarées sur la période
  Effet attendu : blocage ou demande de correction.
- Cas : quantités contestées
  Effet attendu : marquage "en litige".

### Action 2 - Créer un attachement

- Cas : avancement non validé
  Effet attendu : attachement créé en brouillon ou refusé.
- Cas : quantités incohérentes
  Effet attendu : message d'erreur et correction requise.

## Liens documentaires

- Relation -> [README du module](./README.md) : rattache l'avancement physique au module BTP.
- Relation -> [Matrice du module](../../matrices/11-btp-avancement-attachements-situations.md) : aligne les quantités, les attachements et les états.
- Relation -> [user-flows.md](../../user-flows.md) : situe la saisie d'avancement dans le flux chantier.
- Relation -> [business-rules.md](../../business-rules.md) : formalise la pertinence des unités d'oeuvre et la validation préalable.
- Relation -> [state-transitions.md](../../state-transitions.md) : décrit le passage saisi -> soumis.

## Liens inter-modules

- Relation -> [07-execution-terrain-ordres-de-travail/02-execution-terrain.md](../07-execution-terrain-ordres-de-travail/02-execution-terrain.md) : les quantités mesurées prolongent l'exécution terrain.
- Relation -> [12-facturation/01-facturation-par-origine.md](../12-facturation/01-facturation-par-origine.md) : les attachements validés peuvent alimenter la facture BTP.
