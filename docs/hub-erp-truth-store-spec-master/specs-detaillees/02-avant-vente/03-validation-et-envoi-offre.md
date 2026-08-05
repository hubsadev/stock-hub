# Avant-vente - Validation et envoi d offre

## Perimetre

Circuit de validation technique et direction, puis envoi client.

## Ecran / action

### Action 1 - Soumettre l offre a validation

- Ecran : Offre > Actions
- Action : Soumettre a validation

### Action 2 - Approuver ou rejeter une offre

- Ecran : Offre > Validation
- Action : Approuver ou Rejeter

### Action 3 - Envoyer l offre au client

- Ecran : Offre > Actions
- Action : Envoyer au client

## Input

### Action 1 - Soumettre l offre a validation

- Champ / donnee : commentaire de soumission (optionnel)
- Source : saisie utilisateur
- Caractere obligatoire : non
- Remarque : offre doit etre complete

### Action 2 - Approuver ou rejeter une offre

- Champ / donnee : decision, commentaire de rejet
- Source : saisie valideur
- Caractere obligatoire : commentaire requis si rejet
- Remarque : traces de validation obligatoires

### Action 3 - Envoyer l offre au client

- Champ / donnee : canal d envoi, contact client
- Source : saisie utilisateur
- Caractere obligatoire : oui pour contact
- Remarque : offre doit etre validee

## Traitement systeme

### Action 1 - Soumettre l offre a validation

1. Verifier droits et statut.
2. Verifier complétude de l offre.
3. Passer au statut A valider technique puis direction.
4. Notifier les valideurs.
5. Historiser la soumission.

### Action 2 - Approuver ou rejeter une offre

1. Verifier droits du valideur.
2. Enregistrer la decision et la date.
3. Mettre a jour le statut.
4. Historiser la decision.

### Action 3 - Envoyer l offre au client

1. Verifier toutes validations requises.
2. Mettre le statut a Envoyee.
3. Enregistrer les informations d envoi.
4. Historiser l envoi.

## Output

### Action 1 - Soumettre l offre a validation

- Resultat visible : statut A valider
- Statut affiche : A valider technique ou direction
- Trace creee : historique de soumission
- Notification eventuelle : notification valideurs

### Action 2 - Approuver ou rejeter une offre

- Resultat visible : decision visible sur la fiche
- Statut affiche : Validee ou Rejetee
- Trace creee : historique de validation
- Notification eventuelle : notification porteur de dossier

### Action 3 - Envoyer l offre au client

- Resultat visible : offre envoyee
- Statut affiche : Envoyee
- Trace creee : historique d envoi
- Notification eventuelle : confirmation a l emetteur

## Regle metier

### Action 1 - Soumettre l offre a validation

- Toute offre doit passer par validation technique et direction.

### Action 3 - Envoyer l offre au client

- Aucune offre ne doit etre envoyee sans double validation.

## Exception

### Action 1 - Soumettre l offre a validation

- Cas : offre incomplete ; Effet attendu : blocage.

### Action 2 - Approuver ou rejeter une offre

- Cas : valideur absent ; Effet attendu : delegation ou attente.

### Action 3 - Envoyer l offre au client

- Cas : validation manquante ; Effet attendu : blocage.

## Liens documentaires

- Relation -> [matrices/02-avant-vente.md](../../matrices/02-avant-vente.md) : flux de validation et d'envoi d'offre.
- Relation -> [permissions.md](../../permissions.md) : droits de validation et d'envoi selon les rôles commerciaux.
- Relation -> [state-transitions.md](../../state-transitions.md) : en revue, validée, envoyée et versionnée.
- Relation -> [business-rules.md](../../business-rules.md) : règles de validation avant envoi client.
- Relation -> [user-flows.md](../../user-flows.md) : parcours validation -> envoi -> suivi client.

## Liens inter-modules

- Relation -> [../03-contrats-affaires-projets/01-transformation-offre-contrat-projet.md](../03-contrats-affaires-projets/01-transformation-offre-contrat-projet.md) : l'offre validée peut devenir le point d'entrée d'un contrat et d'un projet.
- Relation -> [../04-budget-pilotage-financier-projet/02-validation-revision-budget.md](../04-budget-pilotage-financier-projet/02-validation-revision-budget.md) : la validation de l'offre prépare les arbitrages budgétaires du projet.
- Relation -> [../01-referentiel/01-tiers.md](../01-referentiel/01-tiers.md) : l'offre est envoyée au client référencé.
